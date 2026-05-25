import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
  CombatResultDetailReadModel,
  CombatTimingInput,
} from '../../../core/domain/combat/combat-live.model';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeCompletionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { ExplorationLiveCombat } from '../../../core/services/combat/exploration-live-combat';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { advanceWalkingDeadTimingFrame } from '../../../core/utils/combat-walking-dead';
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { RequestToken } from '../../../core/utils/request-token';
import { environment } from '../../../../environments/environment';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import {
  combatEventMetaLabel,
  combatTimelineRows,
  combatTimingManifestLabel,
  explorationCombatRequestId,
  participantHpLabel,
} from './exploration-live-combat-labels';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationLiveCombatState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly liveCombat = inject(ExplorationLiveCombat);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewardState = inject(ExplorationRewardState);
  private readonly step = inject(ExplorationStepState);
  private readonly sessionToken = new RequestToken();
  private readonly previewToken = new RequestToken();
  private readonly actionToken = new RequestToken();
  private readonly detailToken = new RequestToken();
  private readonly recoveryToken = new RequestToken();
  private walkingTimer: number | null = null;
  private ensuredChallengeId: string | null = null;
  private previewChallengeId: string | null = null;

  readonly isEnsuringCombatSession = signal(false);
  readonly isLoadingCombatPreview = signal(false);
  readonly combatResolutionPreviewFailed = signal(false);
  readonly isRecoveringCombatState = signal(false);
  readonly isSubmittingCombatAction = signal(false);
  readonly isCombatRunning = signal(false);
  readonly walkingPosition = signal(0);
  readonly walkingDirection = signal<1 | -1>(1);
  readonly combatLiveState = signal<CombatLiveStateReadModel | null>(null);
  readonly combatResolutionPreview = signal<CombatResolutionPreviewReadModel | null>(null);
  readonly combatResultDetail = signal<CombatResultDetailReadModel | null>(null);
  readonly completedCombatChallenge = signal<HeroExplorationChallengeAttemptReadModel | null>(null);
  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly isCombatChallenge = computed(() =>
    this.activeChallenge()?.minigameKey === ENCOUNTER_KIND.combat,
  );
  readonly combatTimingManifest = computed(() =>
    this.combatLiveState()?.currentTimingManifest ?? null,
  );
  readonly canStartCombat = computed(() =>
    Boolean(this.activeChallenge()) &&
    this.isCombatChallenge() &&
    (
      this.combatLiveState() !== null ||
      this.combatResolutionPreview()?.canStartManual === true
    ) &&
    !this.isEnsuringCombatSession() &&
    !this.isLoadingCombatPreview() &&
    !this.isRecoveringCombatState() &&
    !this.isSubmittingCombatAction() &&
    !this.isCombatRunning(),
  );
  readonly canShowCombatStartAction = computed(() => {
    if (!this.canStartCombat()) {
      return false;
    }

    const state = this.combatLiveState();

    return (
      !state ||
      (
        state.statusKey !== 'completed' &&
        (!state.awaitingPlayerAction || !this.combatTimingManifest())
      )
    );
  });
  readonly canShowCombatTimingAction = computed(() => {
    const state = this.combatLiveState();

    return (
      this.canStartCombat() &&
      state?.statusKey !== 'completed' &&
      state?.awaitingPlayerAction === true &&
      this.combatTimingManifest() !== null
    );
  });
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
  readonly combatParticipants = computed(() =>
    this.combatLiveState()?.participants ??
    this.combatResolutionPreview()?.participants ??
    [],
  );
  readonly combatEvents = computed(() => this.combatLiveState()?.events ?? []);
  readonly combatTimelineRows = computed(() =>
    combatTimelineRows(this.combatEvents()),
  );
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
  readonly combatPlayerActionStatusLabel = computed(() => {
    if (this.isEnsuringCombatSession()) {
      return 'Przygotowanie sesji walki.';
    }

    if (this.isSubmittingCombatAction()) {
      return 'Rozstrzyganie akcji bohatera.';
    }

    const state = this.combatLiveState();

    if (!state) {
      return 'Sesja walki jest przygotowywana.';
    }

    if (state.statusKey === 'completed') {
      return 'Walka została zakończona.';
    }

    if (!state.awaitingPlayerAction) {
      return 'Walka rozstrzyga obecną turę. Poczekaj na kolejny moment działania.';
    }

    if (!this.combatTimingManifest()) {
      return 'Walka czeka na kolejne okno akcji.';
    }

    return 'Możesz rozpocząć akcję bohatera.';
  });

  constructor() {
    effect(() => {
      const context = this.overview.currentContext();
      const challenge = this.activeChallenge();
      const stepResult = this.step.currentStepResult();

      if (!context) {
        this.resetCombatSession();
        return;
      }

      if (
        this.overview.state()?.activeStep ||
        (
          this.combatLiveState() &&
          stepResult &&
          stepResult.challengeAttemptId !== this.combatLiveState()?.sourceEntityId
        )
      ) {
        this.resetCombatSession();
        return;
      }

      if (!challenge && this.combatLiveState()?.statusKey === 'completed') {
        return;
      }

      if (!challenge || challenge.minigameKey !== ENCOUNTER_KIND.combat) {
        this.resetCombatSession();
        return;
      }

      if (this.combatResolutionPreview()?.sourceEntityId !== challenge.id) {
        this.combatResolutionPreview.set(null);
        this.combatResolutionPreviewFailed.set(false);
      }

      if (
        !this.combatLiveState() &&
        !this.combatResolutionPreview() &&
        this.previewChallengeId !== challenge.id &&
        !this.isLoadingCombatPreview()
      ) {
        this.loadCombatResolutionPreview(context, challenge);
      }
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
      this.startManualCombatSession(context, challenge);
      return;
    }

    if (state.statusKey === 'completed') {
      this.feedback.setError(null, 'Walka została zakończona i nie przyjmuje kolejnych akcji.');
      return;
    }

    if (!state.awaitingPlayerAction) {
      this.recoverCombatState(context.heroId, context.difficultyKey, challenge.id, state);
      return;
    }

    if (!this.combatTimingManifest()) {
      this.recoverCombatState(context.heroId, context.difficultyKey, challenge.id, state);
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
      this.feedback.setError(null, 'Nie udało się wykonać akcji gracza: brak aktywnego okna timingu.');
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

          this.feedback.setError(error, 'Nie udało się wykonać akcji gracza.');
        },
      });
  }

  readonly participantHpLabel = participantHpLabel;
  readonly eventMetaLabel = combatEventMetaLabel;
  readonly timingManifestLabel = combatTimingManifestLabel;

  acceptAutoResolvedCombatCompletion(
    challenge: HeroExplorationChallengeAttemptReadModel,
    result: HeroExplorationChallengeCompletionReadModel,
  ): void {
    if (!result.combatResultId) {
      return;
    }

    const sessionId = result.combatSessionId ?? `auto:${result.combatResultId}`;

    this.ensuredChallengeId = challenge.id;
    this.stopCombatTiming();
    this.isCombatRunning.set(false);
    this.isEnsuringCombatSession.set(false);
    this.isRecoveringCombatState.set(false);
    this.isSubmittingCombatAction.set(false);
    this.completedCombatChallenge.set(challenge);
    this.combatLiveState.set({
      sessionId,
      serverId: challenge.serverId,
      sourceType: 'exploration',
      sourceEntityType: 'challenge_attempt',
      sourceEntityId: challenge.id,
      statusKey: 'completed',
      statusLabel: 'Walka została zakończona.',
      currentRoundNumber: 0,
      currentActionIndex: 0,
      currentActorParticipantId: null,
      awaitingPlayerAction: false,
      currentTimingManifest: null,
      participants: [],
      events: [],
      finalCombatResultId: result.combatResultId,
      eventCount: result.finalEventCount ?? 0,
      updatedAt: challenge.completedAt ?? challenge.updatedAt,
      rawJson: {},
    });
    this.loadCombatResultDetail(result.combatResultId, sessionId);
  }

  private startManualCombatSession(
    context: { heroId: string; difficultyKey: string },
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): void {
    const token = this.sessionToken.next();
    const requestId = this.combatRequestId(challenge.id, 'manual-start');

    this.feedback.clear();
    this.ensuredChallengeId = challenge.id;
    this.isEnsuringCombatSession.set(true);
    this.liveCombat
      .startManualSession({
        challengeAttemptId: challenge.id,
        requestId,
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

          this.handleStartedManualCombatSession(
            context.heroId,
            context.difficultyKey,
            challenge.id,
            state,
          );
        },
        error: (error: unknown) => {
          if (!this.isCurrentCombatChallenge(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.logCombatRpcError('start_manual_combat_session', {
            p_source_entity_type: 'exploration_challenge_attempt',
            p_source_entity_id: challenge.id,
            p_request_id: requestId,
          }, error);
          this.ensuredChallengeId = null;
          this.feedback.setError(error, 'Nie udało się rozpocząć sesji walki.');
        },
      });
  }

  private loadCombatResolutionPreview(
    context: { heroId: string; difficultyKey: string },
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): void {
    const token = this.previewToken.next();

    this.previewChallengeId = challenge.id;
    this.combatResolutionPreviewFailed.set(false);
    this.isLoadingCombatPreview.set(true);
    this.liveCombat
      .getResolutionPreview({
        challengeAttemptId: challenge.id,
        localeKey: 'pl',
      })
      .pipe(
        finalize(() => {
          if (this.previewToken.isCurrent(token)) {
            this.isLoadingCombatPreview.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (preview) => {
          if (!this.isCurrentCombatPreview(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.combatResolutionPreview.set(preview);
          this.combatResolutionPreviewFailed.set(false);
        },
        error: (error: unknown) => {
          if (!this.isCurrentCombatPreview(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.combatResolutionPreviewFailed.set(true);
          this.logCombatRpcError('get_combat_resolution_preview', {
            projectUrl: environment.supabaseUrl,
            p_source_entity_type: 'exploration_challenge_attempt',
            p_source_entity_id: challenge.id,
            p_locale_key: 'pl',
          }, error);
          this.feedback.setError(error, 'Nie udało się odczytać podglądu walki.');
        },
      });
  }

  private handleStartedManualCombatSession(
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    state: CombatLiveStateReadModel,
  ): void {
    if (this.handleCompletedCombatState(heroId, difficultyKey, challengeAttemptId, state)) {
      return;
    }

    if (state.awaitingPlayerAction && this.combatTimingManifest()) {
      this.startPlayerCombatTiming();
      return;
    }

    this.logNonActionableCombatState('startManualSession', challengeAttemptId, state);
    this.recoverCombatState(heroId, difficultyKey, challengeAttemptId, state);
  }

  private recoverCombatState(
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    state: CombatLiveStateReadModel,
  ): void {
    const token = this.recoveryToken.next();

    this.isRecoveringCombatState.set(true);
    this.liveCombat
      .getState({
        sessionId: state.sessionId,
        sinceEventIndex: state.eventCount,
      })
      .pipe(
        finalize(() => {
          if (this.recoveryToken.isCurrent(token)) {
            this.isRecoveringCombatState.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (nextState) => {
          if (!this.isCurrentCombatRecovery(
            token,
            heroId,
            difficultyKey,
            challengeAttemptId,
            state.sessionId,
          )) {
            return;
          }

          this.setCombatLiveState(nextState, true);

          if (this.handleCompletedCombatState(heroId, difficultyKey, challengeAttemptId, nextState)) {
            return;
          }

          if (nextState.awaitingPlayerAction && this.combatTimingManifest()) {
            this.startPlayerCombatTiming();
            return;
          }

          this.logNonActionableCombatState('getState recovery', challengeAttemptId, nextState);
          this.feedback.setError(null, 'Nie udało się przygotować akcji walki.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentCombatRecovery(
            token,
            heroId,
            difficultyKey,
            challengeAttemptId,
            state.sessionId,
          )) {
            return;
          }

          this.logCombatRpcError('get_combat_live_state', {
            p_session_id: state.sessionId,
            p_since_event_index: state.eventCount,
          }, error);
          this.feedback.setError(error, 'Nie udało się odczytać stanu walki.');
        },
      });
  }

  private logNonActionableCombatState(
    source: 'startManualSession' | 'getState recovery',
    challengeAttemptId: string,
    state: CombatLiveStateReadModel,
  ): void {
    if (!this.canLogDiagnostics()) {
      return;
    }

    console.warn('[Exploration live combat] Non-actionable combat state', {
      source,
      challengeAttemptId,
      sessionId: state.sessionId,
      sourceEntityId: state.sourceEntityId,
      statusKey: state.statusKey,
      statusLabel: state.statusLabel,
      awaitingPlayerAction: state.awaitingPlayerAction,
      finalCombatResultId: state.finalCombatResultId,
      eventCount: state.eventCount,
      currentRoundNumber: state.currentRoundNumber,
      currentActionIndex: state.currentActionIndex,
      currentTimingManifest: state.currentTimingManifest,
      combatTimingManifest: this.combatTimingManifest(),
      canShowCombatStartAction: this.canShowCombatStartAction(),
      canShowCombatTimingAction: this.canShowCombatTimingAction(),
      isCombatRunning: this.isCombatRunning(),
      canStartCombat: this.canStartCombat(),
      canSubmitCombatStrike: this.canSubmitCombatStrike(),
      settledBranchFlags: this.settledCombatBranchFlags(state),
      rawJson: state.rawJson,
    });
  }

  private logCombatRpcError(
    rpc: 'get_combat_resolution_preview' | 'start_manual_combat_session' | 'get_combat_live_state',
    args: Record<string, unknown>,
    error: unknown,
  ): void {
    if (!this.canLogDiagnostics()) {
      return;
    }

    console.error('[Exploration live combat] RPC error', {
      rpc,
      args,
      error: this.safeRpcError(error),
    });
  }

  private safeRpcError(error: unknown): {
    message: string | null;
    code: string | null;
    details: string | null;
    hint: string | null;
    status: number | null;
    statusText: string | null;
  } {
    if (!error || typeof error !== 'object') {
      return {
        message: typeof error === 'string' ? error : null,
        code: null,
        details: null,
        hint: null,
        status: null,
        statusText: null,
      };
    }

    const record = error as Record<string, unknown>;

    return {
      message: typeof record['message'] === 'string' ? record['message'] : null,
      code: typeof record['code'] === 'string' ? record['code'] : null,
      details: typeof record['details'] === 'string' ? record['details'] : null,
      hint: typeof record['hint'] === 'string' ? record['hint'] : null,
      status: typeof record['status'] === 'number' ? record['status'] : null,
      statusText: typeof record['statusText'] === 'string' ? record['statusText'] : null,
    };
  }

  private settledCombatBranchFlags(state: CombatLiveStateReadModel): {
    canShowCombatStartAction: boolean;
    canShowCombatTimingAction: boolean;
    isCombatRunning: boolean;
    canStartCombat: boolean;
    canSubmitCombatStrike: boolean;
  } {
    const canStartCombat =
      Boolean(this.activeChallenge()) &&
      this.isCombatChallenge() &&
      !this.isSubmittingCombatAction() &&
      !this.isCombatRunning();
    const hasManifest = state.currentTimingManifest !== null;

    return {
      canShowCombatStartAction: canStartCombat &&
        state.statusKey !== 'completed' &&
        (!state.awaitingPlayerAction || !hasManifest),
      canShowCombatTimingAction: canStartCombat &&
        state.statusKey !== 'completed' &&
        state.awaitingPlayerAction === true &&
        hasManifest,
      isCombatRunning: this.isCombatRunning(),
      canStartCombat,
      canSubmitCombatStrike: Boolean(this.activeChallenge()) &&
        this.isCombatChallenge() &&
        this.isCombatRunning() &&
        !this.isSubmittingCombatAction() &&
        state.awaitingPlayerAction === true &&
        hasManifest,
    };
  }

  private handleCompletedCombatState(
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    state: CombatLiveStateReadModel,
  ): boolean {
    if (state.statusKey !== 'completed' || !state.finalCombatResultId) {
      return false;
    }

    this.captureCompletedCombatChallenge(challengeAttemptId);
    this.rewardState.preferCompletedChallengeReward(
      this.overview.state()?.exploration?.id ?? null,
      challengeAttemptId,
    );
    this.loadCombatResultDetail(state.finalCombatResultId, state.sessionId);
    this.refreshExplorationState(heroId, difficultyKey, challengeAttemptId);
    return true;
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
    if (this.handleCompletedCombatState(heroId, difficultyKey, challengeAttemptId, state)) {
      return;
    }

    if (state.awaitingPlayerAction) {
      this.startPlayerCombatTiming();
      return;
    }

    this.recoverCombatState(heroId, difficultyKey, challengeAttemptId, state);
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

  private captureCompletedCombatChallenge(challengeAttemptId: string): void {
    const challenge = this.activeChallenge();

    if (challenge?.id === challengeAttemptId) {
      this.completedCombatChallenge.set(challenge);
      return;
    }

    if (this.completedCombatChallenge()?.id === challengeAttemptId) {
      return;
    }

    if (this.canLogDiagnostics()) {
      console.warn('[Exploration live combat] Completed combat source challenge gap', {
        challengeAttemptId,
        activeChallengeId: challenge?.id ?? null,
        completedCombatSourceEntityId: this.completedCombatLiveState()?.sourceEntityId ?? null,
      });
    }
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

  private isCurrentCombatPreview(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
  ): boolean {
    return (
      this.previewToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId &&
      !this.combatLiveState()
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

  private isCurrentCombatRecovery(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
    sessionId: string,
  ): boolean {
    return (
      this.recoveryToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId &&
      this.combatLiveState()?.sessionId === sessionId
    );
  }

  private combatRequestId(challengeAttemptId: string, scope = 'action'): string {
    return explorationCombatRequestId(challengeAttemptId, scope);
  }

  private canLogDiagnostics(): boolean {
    return typeof ngDevMode !== 'undefined' && Boolean(ngDevMode);
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

  private startPlayerCombatTiming(): void {
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.isCombatRunning.set(true);
    this.startCombatTiming();
  }

  private stopCombatTiming(): void {
    if (this.walkingTimer !== null) {
      window.clearInterval(this.walkingTimer);
      this.walkingTimer = null;
    }
  }

  private resetCombatSession(): void {
    this.ensuredChallengeId = null;
    this.previewChallengeId = null;
    this.stopCombatTiming();
    this.isCombatRunning.set(false);
    this.isLoadingCombatPreview.set(false);
    this.combatResolutionPreviewFailed.set(false);
    this.isRecoveringCombatState.set(false);
    this.combatLiveState.set(null);
    this.combatResolutionPreview.set(null);
    this.combatResultDetail.set(null);
    this.completedCombatChallenge.set(null);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
  }
}
