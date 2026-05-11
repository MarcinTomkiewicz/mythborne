import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeCompletionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  EXPLORATION_CHALLENGE_ACTION_MODE,
  explorationChallengeActionBlocker,
  explorationChallengeActionMode,
  hasChallengeAutoResolveChance,
} from './exploration-challenge-action-ui';
import {
  ChallengeCompletionSnapshot,
  ChallengeFact,
} from './exploration-challenge.model';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationLiveCombatState } from './exploration-live-combat.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';

@Injectable()
export class ExplorationChallengeState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly liveCombatState = inject(ExplorationLiveCombatState);
  private readonly rewardState = inject(ExplorationRewardState);
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
  readonly combatTimelineRows = this.liveCombatState.combatTimelineRows;
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
  readonly challengeActionMode = computed(() =>
    explorationChallengeActionMode(this.activeChallenge()),
  );
  readonly challengeActionBlocker = computed(() =>
    explorationChallengeActionBlocker(this.activeChallenge(), this.challengeActionMode()),
  );
  readonly canShowManualResolveActions = computed(() =>
    this.challengeActionMode() === EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial,
  );
  readonly canShowAutoResolveAction = computed(() =>
    this.canShowManualResolveActions() && hasChallengeAutoResolveChance(this.activeChallenge()),
  );
  readonly autoResolveExplanation = computed(() =>
    this.autoResolveText(this.activeChallenge()),
  );
  readonly canCompleteChallenge = computed(() =>
    Boolean(this.activeChallenge()) &&
    !this.isCompleting() &&
    this.challengeActionMode() === EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial,
  );
  readonly canAutoResolveChallenge = computed(() =>
    this.canCompleteChallenge() && hasChallengeAutoResolveChance(this.activeChallenge()),
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

    const mode = humanizeKey(result.completionMode, 'Challenge');

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

    if (challenge.minigameKey === ENCOUNTER_KIND.combat) {
      this.feedback.setError(
        null,
        'Combat challenges use the live combat flow and cannot be auto-resolved from this action.',
      );
      return;
    }

    if (
      explorationChallengeActionMode(challenge) !==
      EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial
    ) {
      this.feedback.setError(
        null,
        explorationChallengeActionBlocker(challenge)
          ?? 'This challenge does not expose a player auto-resolve action.',
      );
      return;
    }

    if (!hasChallengeAutoResolveChance(challenge)) {
      this.feedback.setError(null, 'DB did not return an auto-resolve chance for this Trial.');
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
          this.rewardState.preferCompletedChallengeReward(
            workflow.state.exploration?.id ?? null,
            workflow.result.challengeAttemptId,
          );
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

    const mode = explorationChallengeActionMode(challenge);

    if (mode !== EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial) {
      this.feedback.setError(
        null,
        explorationChallengeActionBlocker(challenge, mode)
          ?? 'This challenge does not expose a manual completion action.',
      );
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
          this.rewardState.preferCompletedChallengeReward(
            workflow.state.exploration?.id ?? null,
            workflow.result.challengeAttemptId,
          );
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

    const prefix = challenge.minigameKey === ENCOUNTER_KIND.combat ? 'Combat ' : '';

    if (challenge.trialDefinitionId) {
      return `${prefix}Trial`;
    }

    if (challenge.encounterDefinitionId) {
      return `${prefix}Encounter`;
    }

    return humanizeKey(challenge.challengeKind, 'Challenge');
  }

  private facts(challenge: HeroExplorationChallengeAttemptReadModel | null): ChallengeFact[] {
    if (!challenge) {
      return [];
    }

    return [
      { label: 'Kind', value: humanizeKey(challenge.challengeKind, 'Challenge') },
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
    if (challenge?.minigameKey === ENCOUNTER_KIND.combat) {
      return 'Combat challenges use the live combat flow.';
    }

    if (
      explorationChallengeActionMode(challenge) !==
      EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial
    ) {
      return explorationChallengeActionBlocker(challenge)
        ?? 'This challenge does not expose an auto-resolve action.';
    }

    if (!hasChallengeAutoResolveChance(challenge)) {
      return 'DB did not return an auto-resolve chance for this Trial.';
    }

    const chance = challenge?.autoResolve?.chance ?? challenge?.autoResolveChance;
    const chanceLabel = chance === null || chance === undefined
      ? 'the DB-returned chance'
      : `${chance}%`;

    return `Auto-resolve uses the DB-owned success chance for this challenge: ${chanceLabel}.`;
  }

  private chanceRollLabel(chance: number | null, roll: number | null): string {
    const chanceLabel = chance === null ? 'N/D' : `${chance}%`;
    const rollLabel = roll === null ? 'roll N/D' : `roll ${roll}`;

    return `${chanceLabel} (${rollLabel})`;
  }

  private autoResolveFactLabel(
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): string {
    if (challenge.minigameKey === ENCOUNTER_KIND.combat) {
      return 'Manual combat';
    }

    return this.chanceRollLabel(
      challenge.autoResolve?.chance ?? challenge.autoResolveChance,
      challenge.autoResolve?.roll ?? challenge.autoResolveRoll,
    );
  }

}
