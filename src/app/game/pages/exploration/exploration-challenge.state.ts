import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeCompletionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { Json } from '../../../core/types/database.types';
import {
  toWalkingDeadSpeed,
  toWalkingDeadZone,
} from '../../../core/utils/combat-walking-dead';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationChallengeState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly completionToken = new RequestToken();
  private walkingTimer: number | null = null;

  private readonly lastCompletion = signal<ChallengeCompletionSnapshot | null>(null);

  readonly isCompleting = signal(false);
  readonly isCombatRunning = signal(false);
  readonly combatStrikeCount = signal(0);
  readonly walkingPosition = signal(0);
  readonly walkingDirection = signal<1 | -1>(1);
  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly isCombatChallenge = computed(() =>
    this.activeChallenge()?.minigameKey === 'combat',
  );
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
  readonly canStartCombat = computed(() =>
    Boolean(this.activeChallenge()) &&
    this.isCombatChallenge() &&
    !this.isCompleting() &&
    !this.isCombatRunning(),
  );
  readonly canSubmitCombatStrike = computed(() =>
    Boolean(this.activeChallenge()) &&
    this.isCombatChallenge() &&
    this.isCombatRunning() &&
    !this.isCompleting(),
  );
  readonly combatHitWindow = computed(() => toWalkingDeadZone(30, this.combatStrikeCount()));
  readonly combatWalkingSpeed = computed(() => toWalkingDeadSpeed(this.combatStrikeCount()));
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

    if (result.combatResultId) {
      return result.success
        ? `Walka zakończona wynikiem ${result.combatOutcome ?? 'N/D'}.`
        : `Walka zakończona porażką. Wynik DB: ${result.combatOutcome ?? 'N/D'}.`;
    }

    return result.success
      ? `${mode} completion succeeded.`
      : `${mode} completion failed.`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopCombatTiming());
  }

  completeManually(success: boolean): void {
    this.completeCurrentChallenge('manual', success);
  }

  startCombat(): void {
    this.feedback.clear();

    if (!this.activeChallenge() || !this.isCombatChallenge()) {
      this.feedback.setError(null, 'Brak danych aktywnego Triala/Encountera.');
      return;
    }

    if (!this.canStartCombat()) {
      this.feedback.setError(null, 'Nie można uruchomić walki.');
      return;
    }

    this.combatStrikeCount.set(0);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.isCombatRunning.set(true);
    this.startCombatTiming();
  }

  submitCombatStrike(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge || !this.isCombatChallenge()) {
      this.feedback.setError(null, 'Brak danych aktywnego Triala/Encountera.');
      return;
    }

    if (!this.canSubmitCombatStrike()) {
      this.feedback.setError(null, 'Nie można uruchomić walki.');
      return;
    }

    const timingHitsJson = this.combatTimingHitsJson();
    const token = this.completionToken.next();

    this.stopCombatTiming();
    this.isCombatRunning.set(false);
    this.isCompleting.set(true);
    this.explorations
      .submitExplorationChallengeCombatResolution({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
        timingHitsJson,
        requestId: this.combatRequestId(challenge.id),
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
          this.feedback.setSuccess(
            workflow.result.success
              ? 'Walka została zapisana.'
              : 'Walka została zapisana jako porażka.',
          );
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'RPC odrzucił próbę walki.');
        },
      });
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

  private completeCurrentChallenge(completionMode: string, success: boolean): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'No active challenge to complete.');
      return;
    }

    if (challenge.minigameKey === 'combat' && completionMode === 'manual') {
      this.feedback.setError(null, 'Walka wymaga rozstrzygnięcia przez resolver DB.');
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
      { label: 'Auto-resolve', value: this.chanceRollLabel(challenge.autoResolveChance, challenge.autoResolveRoll) },
    ];
  }

  private autoResolveText(
    challenge: HeroExplorationChallengeAttemptReadModel | null,
  ): string {
    const chance = challenge?.autoResolveChance;
    const chanceLabel = chance === null || chance === undefined ? 'the DB fallback chance' : `${chance}%`;

    return `Auto-resolve is a database fallback when manual play is not completed. It rolls ${chanceLabel} and can be worse than manual completion.`;
  }

  private chanceRollLabel(chance: number | null, roll: number | null): string {
    const chanceLabel = chance === null ? 'N/D' : `${chance}%`;
    const rollLabel = roll === null ? 'not rolled' : `roll ${roll}`;

    return `${chanceLabel} (${rollLabel})`;
  }

  private humanizeKey(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ') || 'Challenge';
  }

  private combatTimingHitsJson(): Json {
    const window = this.combatHitWindow();

    return [
      {
        indicatorPosition: this.walkingPosition(),
        zoneStart: window.start,
        zoneEnd: window.end,
        strikeIndex: this.combatStrikeCount() + 1,
        submittedAt: new Date().toISOString(),
      },
    ];
  }

  private combatRequestId(challengeAttemptId: string): string {
    const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `exploration-combat:${challengeAttemptId}:${randomId}`;
  }

  private startCombatTiming(): void {
    this.stopCombatTiming();

    this.walkingTimer = window.setInterval(() => {
      const next = this.walkingPosition() + this.walkingDirection() * this.combatWalkingSpeed();

      if (next >= 100) {
        this.walkingPosition.set(100);
        this.walkingDirection.set(-1);
        return;
      }

      if (next <= 0) {
        this.walkingPosition.set(0);
        this.walkingDirection.set(1);
        return;
      }

      this.walkingPosition.set(Number(next.toFixed(2)));
    }, 16);
  }

  private stopCombatTiming(): void {
    if (this.walkingTimer !== null) {
      window.clearInterval(this.walkingTimer);
      this.walkingTimer = null;
    }
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
