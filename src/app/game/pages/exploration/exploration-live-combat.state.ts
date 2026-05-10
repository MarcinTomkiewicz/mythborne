import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CombatLiveStateReadModel,
  CombatResultDetailReadModel,
  CombatTimingInput,
} from '../../../core/domain/combat/combat-live.model';
import { HeroExplorationChallengeAttemptReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ExplorationLiveCombat } from '../../../core/services/combat/exploration-live-combat';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { advanceWalkingDeadTimingFrame } from '../../../core/utils/combat-walking-dead';
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import {
  combatEventMetaLabel,
  combatTimingManifestLabel,
  explorationCombatRequestId,
  participantHpLabel,
} from './exploration-live-combat-labels';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationLiveCombatState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly liveCombat = inject(ExplorationLiveCombat);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly sessionToken = new RequestToken();
  private readonly actionToken = new RequestToken();
  private readonly detailToken = new RequestToken();
  private walkingTimer: number | null = null;
  private ensuredChallengeId: string | null = null;

  readonly isEnsuringCombatSession = signal(false);
  readonly isSubmittingCombatAction = signal(false);
  readonly isCombatRunning = signal(false);
  readonly walkingPosition = signal(0);
  readonly walkingDirection = signal<1 | -1>(1);
  readonly combatLiveState = signal<CombatLiveStateReadModel | null>(null);
  readonly combatResultDetail = signal<CombatResultDetailReadModel | null>(null);
  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly isCombatChallenge = computed(() =>
    this.activeChallenge()?.minigameKey === 'combat',
  );
  readonly combatTimingManifest = computed(() =>
    this.combatLiveState()?.currentTimingManifest ?? null,
  );
  readonly canStartCombat = computed(() =>
    Boolean(this.activeChallenge()) &&
    this.isCombatChallenge() &&
    !this.isEnsuringCombatSession() &&
    !this.isSubmittingCombatAction() &&
    !this.isCombatRunning(),
  );
  readonly canSubmitCombatStrike = computed(() =>
    Boolean(this.activeChallenge()) &&
    this.isCombatChallenge() &&
    this.isCombatRunning() &&
    !this.isSubmittingCombatAction() &&
    this.combatLiveState()?.awaitingPlayerAction === true &&
    this.combatTimingManifest() !== null,
  );
  readonly combatHitWindow = computed(() => {
    const manifest = this.combatTimingManifest();

    return {
      start: manifest?.zoneStartPercent ?? 0,
      end: manifest?.zoneEndPercent ?? 0,
      width: manifest?.zoneWidthPercent ?? 0,
    };
  });
  readonly combatWalkingSpeed = computed(() => this.combatTimingManifest()?.speed ?? 0);
  readonly combatParticipants = computed(() => this.combatLiveState()?.participants ?? []);
  readonly combatEvents = computed(() => this.combatLiveState()?.events ?? []);
  readonly completedCombatLiveState = computed(() => {
    const state = this.combatLiveState();

    return state?.statusKey === 'completed' ? state : null;
  });
  readonly currentCombatActor = computed(() => {
    const state = this.combatLiveState();
    const actorId = state?.currentActorParticipantId;

    return actorId
      ? state.participants.find((participant) => participant.participantId === actorId) ?? null
      : null;
  });
  readonly combatStatusLabel = computed(() =>
    this.combatLiveState()?.statusLabel ?? 'Brak sesji walki',
  );
  readonly combatRoundLabel = computed(() => {
    const state = this.combatLiveState();

    return state
      ? `Runda ${state.currentRoundNumber}, akcja ${state.currentActionIndex}`
      : 'Runda N/D';
  });

  constructor() {
    effect(() => {
      const context = this.overview.currentContext();
      const challenge = this.activeChallenge();

      if (!context) {
        this.resetCombatSession();
        return;
      }

      if (!challenge && this.combatLiveState()?.statusKey === 'completed') {
        return;
      }

      if (!challenge || challenge.minigameKey !== 'combat') {
        this.resetCombatSession();
        return;
      }

      if (this.ensuredChallengeId === challenge.id) {
        return;
      }

      this.ensureCombatSession(context, challenge);
    });

    this.destroyRef.onDestroy(() => this.stopCombatTiming());
  }

  startCombat(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge || !this.isCombatChallenge()) {
      this.feedback.setError(null, 'Brak danych aktywnego Triala/Encountera.');
      return;
    }

    if (!this.canStartCombat()) {
      this.feedback.setError(null, 'Nie można uruchomić walki.');
      return;
    }

    const state = this.combatLiveState();

    if (!state) {
      this.ensureCombatSession(context, challenge);
      return;
    }

    if (state.statusKey === 'completed') {
      this.feedback.setError(null, 'Walka została zakończona i nie przyjmuje kolejnych akcji.');
      return;
    }

    if (!state.awaitingPlayerAction) {
      this.feedback.setError(null, 'Sesja walki nie czeka na akcję gracza.');
      return;
    }

    if (!this.combatTimingManifest()) {
      this.feedback.setError(null, 'DB nie zwróciła manifestu timingu dla aktualnej akcji.');
      return;
    }

    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.isCombatRunning.set(true);
    this.startCombatTiming();
  }

  submitCombatStrike(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();
    const state = this.combatLiveState();

    this.feedback.clear();

    if (!context || !challenge || !this.isCombatChallenge()) {
      this.feedback.setError(null, 'Brak danych aktywnego Triala/Encountera.');
      return;
    }

    if (!state) {
      this.feedback.setError(null, 'Nie udało się odczytać stanu walki.');
      return;
    }

    if (state.statusKey === 'completed') {
      this.feedback.setError(null, 'Walka została zakończona i nie przyjmuje kolejnych akcji.');
      return;
    }

    if (!state.awaitingPlayerAction) {
      this.feedback.setError(null, 'Sesja walki nie czeka na akcję gracza.');
      return;
    }

    if (!this.canSubmitCombatStrike()) {
      this.feedback.setError(null, 'DB odrzuciła akcję gracza: brak aktywnego manifestu timingu.');
      return;
    }

    const token = this.actionToken.next();
    const timingInput: CombatTimingInput = {
      positionPercent: this.walkingPosition(),
    };

    this.stopCombatTiming();
    this.isCombatRunning.set(false);
    this.isSubmittingCombatAction.set(true);
    this.liveCombat
      .submitPlayerAction({
        sessionId: state.sessionId,
        timingInput,
        requestId: this.combatRequestId(challenge.id),
      })
      .pipe(
        finalize(() => {
          if (this.actionToken.isCurrent(token)) {
            this.isSubmittingCombatAction.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (nextState) => {
          if (!this.isCurrentCombatAction(token, context.heroId, context.difficultyKey, challenge.id, state.sessionId)) {
            return;
          }

          this.setCombatLiveState(nextState, true);
          this.handleLiveStateAfterAction(
            context.heroId,
            context.difficultyKey,
            challenge.id,
            nextState,
          );
        },
        error: (error: unknown) => {
          if (!this.isCurrentCombatAction(token, context.heroId, context.difficultyKey, challenge.id, state.sessionId)) {
            return;
          }

          this.feedback.setError(error, 'DB odrzuciła akcję gracza.');
        },
      });
  }

  readonly participantHpLabel = participantHpLabel;
  readonly eventMetaLabel = combatEventMetaLabel;
  readonly timingManifestLabel = combatTimingManifestLabel;

  private ensureCombatSession(
    context: { heroId: string; difficultyKey: string },
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): void {
    const token = this.sessionToken.next();

    this.feedback.clear();
    this.ensuredChallengeId = challenge.id;
    this.isEnsuringCombatSession.set(true);
    this.liveCombat
      .ensureSession({
        challengeAttemptId: challenge.id,
        requestId: this.combatRequestId(challenge.id, 'ensure'),
      })
      .pipe(
        finalize(() => {
          if (this.sessionToken.isCurrent(token)) {
            this.isEnsuringCombatSession.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => {
          if (!this.isCurrentCombatChallenge(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCombatLiveState(state, false);

          if (state.statusKey === 'completed' && state.finalCombatResultId) {
            this.loadCombatResultDetail(state.finalCombatResultId, state.sessionId);
            this.refreshExplorationState(context.heroId, context.difficultyKey, challenge.id);
          }
        },
        error: (error: unknown) => {
          if (!this.isCurrentCombatChallenge(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.ensuredChallengeId = null;
          this.feedback.setError(error, 'Nie udało się rozpocząć sesji walki.');
        },
      });
  }

  private setCombatLiveState(state: CombatLiveStateReadModel, mergeEvents: boolean): void {
    this.combatLiveState.set(
      mergeEvents ? mergeCombatLiveEvents(this.combatLiveState(), state) : state,
    );
  }

  private handleLiveStateAfterAction(
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    state: CombatLiveStateReadModel,
  ): void {
    if (state.statusKey === 'completed') {
      this.feedback.setSuccess('Walka została zakończona przez DB.');

      if (state.finalCombatResultId) {
        this.loadCombatResultDetail(state.finalCombatResultId, state.sessionId);
      }

      this.refreshExplorationState(heroId, difficultyKey, challengeAttemptId);
      return;
    }

    if (state.awaitingPlayerAction) {
      this.walkingPosition.set(0);
      this.walkingDirection.set(1);
      this.isCombatRunning.set(true);
      this.startCombatTiming();
    }
  }

  private refreshExplorationState(
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
  ): void {
    this.explorations
      .getHeroExplorationState({ heroId, difficultyKey })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (!this.overview.isCurrentContext(heroId, difficultyKey)) {
            return;
          }

          const activeChallengeId = state.activeChallenge?.id ?? challengeAttemptId;

          if (activeChallengeId !== challengeAttemptId) {
            return;
          }

          this.overview.setStateFromWorkflow(state);
        },
        error: (error: unknown) => {
          if (!this.overview.isCurrentContext(heroId, difficultyKey)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się odświeżyć eksploracji po walce.');
        },
      });
  }

  private loadCombatResultDetail(combatResultId: string, sessionId: string): void {
    const token = this.detailToken.next();

    this.liveCombat
      .getResultDetail({ combatResultId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (!this.detailToken.isCurrent(token) || this.combatLiveState()?.sessionId !== sessionId) {
            return;
          }

          this.combatResultDetail.set(detail);
        },
        error: (error: unknown) => {
          if (!this.detailToken.isCurrent(token) || this.combatLiveState()?.sessionId !== sessionId) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się odczytać szczegółów wyniku walki.');
        },
      });
  }

  private isCurrentCombatChallenge(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
  ): boolean {
    return (
      this.sessionToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId
    );
  }

  private isCurrentCombatAction(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    sessionId: string,
  ): boolean {
    return (
      this.actionToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId &&
      this.combatLiveState()?.sessionId === sessionId
    );
  }

  private combatRequestId(challengeAttemptId: string, scope = 'action'): string {
    return explorationCombatRequestId(challengeAttemptId, scope);
  }

  private startCombatTiming(): void {
    this.stopCombatTiming();

    this.walkingTimer = window.setInterval(() => {
      const next = advanceWalkingDeadTimingFrame({
        position: this.walkingPosition(),
        direction: this.walkingDirection(),
      }, this.combatWalkingSpeed());

      this.walkingPosition.set(next.position);
      this.walkingDirection.set(next.direction);
    }, 16);
  }

  private stopCombatTiming(): void {
    if (this.walkingTimer !== null) {
      window.clearInterval(this.walkingTimer);
      this.walkingTimer = null;
    }
  }

  private resetCombatSession(): void {
    this.ensuredChallengeId = null;
    this.stopCombatTiming();
    this.isCombatRunning.set(false);
    this.combatLiveState.set(null);
    this.combatResultDetail.set(null);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
  }
}
