import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeCompletionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationLiveCombatState } from './exploration-live-combat.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationChallengeState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly liveCombatState = inject(ExplorationLiveCombatState);
  private readonly completionToken = new RequestToken();
  private readonly lastCompletion = signal<ChallengeCompletionSnapshot | null>(null);

  readonly isCompleting = signal(false);
  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly isCombatChallenge = this.liveCombatState.isCombatChallenge;
  readonly isEnsuringCombatSession = this.liveCombatState.isEnsuringCombatSession;
  readonly isSubmittingCombatAction = this.liveCombatState.isSubmittingCombatAction;
  readonly isCombatRunning = this.liveCombatState.isCombatRunning;
  readonly walkingPosition = this.liveCombatState.walkingPosition;
  readonly combatLiveState = this.liveCombatState.combatLiveState;
  readonly combatResultDetail = this.liveCombatState.combatResultDetail;
  readonly canStartCombat = this.liveCombatState.canStartCombat;
  readonly combatTimingManifest = this.liveCombatState.combatTimingManifest;
  readonly canSubmitCombatStrike = this.liveCombatState.canSubmitCombatStrike;
  readonly combatHitWindow = this.liveCombatState.combatHitWindow;
  readonly combatWalkingSpeed = this.liveCombatState.combatWalkingSpeed;
  readonly combatParticipants = this.liveCombatState.combatParticipants;
  readonly combatEvents = this.liveCombatState.combatEvents;
  readonly completedCombatLiveState = this.liveCombatState.completedCombatLiveState;
  readonly currentCombatActor = this.liveCombatState.currentCombatActor;
  readonly combatStatusLabel = this.liveCombatState.combatStatusLabel;
  readonly combatRoundLabel = this.liveCombatState.combatRoundLabel;
  readonly currentChallengeResult = computed(() => {
    const state = this.overview.state();
    const completion = this.lastCompletion();

    return completion &&
      state?.exploration?.id === completion.explorationId &&
      !state.activeChallenge
      ? completion.result
      : null;
  });
  readonly challengeTitle = computed(() => this.title(this.activeChallenge()));
  readonly challengeFacts = computed(() => this.facts(this.activeChallenge()));
  readonly autoResolveExplanation = computed(() =>
    this.autoResolveText(this.activeChallenge()),
  );
  readonly canCompleteChallenge = computed(() =>
    Boolean(this.activeChallenge()) && !this.isCompleting() && !this.isCombatChallenge(),
  );
  readonly challengeResultTitle = computed(() => {
    const result = this.currentChallengeResult();

    if (!result) {
      return '';
    }

    return result.success ? 'Challenge completed' : 'Challenge failed';
  });
  readonly challengeResultDescription = computed(() => {
    const result = this.currentChallengeResult();

    if (!result) {
      return '';
    }

    const mode = this.humanizeKey(result.completionMode);

    return result.success
      ? `${mode} completion succeeded.`
      : `${mode} completion failed.`;
  });

  completeManually(success: boolean): void {
    this.completeCurrentChallenge('manual', success);
  }

  startCombat(): void {
    this.liveCombatState.startCombat();
  }

  submitCombatStrike(): void {
    this.liveCombatState.submitCombatStrike();
  }

  autoResolve(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'No active challenge to auto-resolve.');
      return;
    }

    const token = this.completionToken.next();

    this.isCompleting.set(true);
    this.explorations
      .autoResolveHeroExplorationChallengeAttempt({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
      })
      .pipe(
        finalize(() => {
          if (this.completionToken.isCurrent(token)) {
            this.isCompleting.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCompletion(workflow.result, workflow.state.exploration?.id ?? null);
          this.overview.setStateFromWorkflow(workflow.state);
          this.feedback.setSuccess('Challenge auto-resolved.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'Failed to auto-resolve challenge.');
        },
      });
  }

  participantHpLabel = this.liveCombatState.participantHpLabel.bind(this.liveCombatState);
  eventMetaLabel = this.liveCombatState.eventMetaLabel.bind(this.liveCombatState);
  timingManifestLabel = this.liveCombatState.timingManifestLabel.bind(this.liveCombatState);

  private completeCurrentChallenge(completionMode: string, success: boolean): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'No active challenge to complete.');
      return;
    }

    if (challenge.minigameKey === 'combat' && completionMode === 'manual') {
      this.feedback.setError(null, 'Walka wymaga live sesji DB i akcji gracza.');
      return;
    }

    const token = this.completionToken.next();

    this.isCompleting.set(true);
    this.explorations
      .completeHeroExplorationChallengeAttempt({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
        completionMode,
        success,
      })
      .pipe(
        finalize(() => {
          if (this.completionToken.isCurrent(token)) {
            this.isCompleting.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCompletion(workflow.result, workflow.state.exploration?.id ?? null);
          this.overview.setStateFromWorkflow(workflow.state);
          this.feedback.setSuccess('Challenge completed.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'Failed to complete challenge.');
        },
      });
  }

  private setCompletion(
    result: HeroExplorationChallengeCompletionReadModel,
    explorationId: string | null,
  ): void {
    this.lastCompletion.set({ result, explorationId });
  }

  private isCurrentCompletion(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
  ): boolean {
    return (
      this.completionToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId
    );
  }

  private title(challenge: HeroExplorationChallengeAttemptReadModel | null): string {
    if (!challenge) {
      return 'No active challenge.';
    }

    if (challenge.trialDefinitionId) {
      return 'Trial challenge';
    }

    if (challenge.encounterDefinitionId) {
      return 'Encounter challenge';
    }

    return this.humanizeKey(challenge.challengeKind);
  }

  private facts(challenge: HeroExplorationChallengeAttemptReadModel | null): ChallengeFact[] {
    if (!challenge) {
      return [];
    }

    return [
      { label: 'Kind', value: this.humanizeKey(challenge.challengeKind) },
      { label: 'Status', value: challenge.status },
      { label: 'Difficulty', value: challenge.difficultyKey },
      { label: 'District', value: challenge.districtCode },
      { label: 'Minigame', value: challenge.minigameKey ?? 'N/D' },
      { label: 'Tested stat', value: challenge.testedStatKey ?? 'N/D' },
      { label: 'Manual deadline', value: challenge.manualDeadlineAt ?? 'N/D' },
      { label: 'Manifestation', value: this.chanceRollLabel(challenge.manifestationChance, challenge.manifestationRoll) },
      { label: 'Auto-resolve', value: this.autoResolveFactLabel(challenge) },
    ];
  }

  private autoResolveText(
    challenge: HeroExplorationChallengeAttemptReadModel | null,
  ): string {
    const chance = challenge?.autoResolveChance;
    const chanceLabel = chance === null || chance === undefined
      ? 'the DB fallback chance'
      : `${chance}%`;

    return `Auto-resolve is a database fallback when manual play is not completed. It rolls ${chanceLabel} and can be worse than manual completion.`;
  }

  private chanceRollLabel(chance: number | null, roll: number | null): string {
    const chanceLabel = chance === null ? 'N/D' : `${chance}%`;
    const rollLabel = roll === null ? 'not rolled' : `roll ${roll}`;

    return `${chanceLabel} (${rollLabel})`;
  }

  private autoResolveFactLabel(
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): string {
    if (challenge.minigameKey === 'combat') {
      return 'Manual combat';
    }

    return this.chanceRollLabel(
      challenge.autoResolveChance,
      challenge.autoResolveRoll,
    );
  }

  private humanizeKey(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ') || 'Challenge';
  }
}

export interface ChallengeFact {
  label: string;
  value: string;
}

interface ChallengeCompletionSnapshot {
  result: HeroExplorationChallengeCompletionReadModel;
  explorationId: string | null;
}
