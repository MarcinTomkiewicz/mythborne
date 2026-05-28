import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import {
  ActivePvpActionOffer,
} from '../../../core/domain/pvp/pvp.model';
import {
  CombatSurfaceDecisionDeadline,
} from '../../../core/domain/combat/combat-display.model';
import {
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { CombatSessions } from '../../../core/services/combat/combat-sessions';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { mapCombatSessionStageView } from '../../../core/utils/combat-stage-display.mapper';
import { advanceWalkingDeadTimingFrame } from '../../../core/utils/combat-walking-dead';
import {
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../core/utils/pending-timer';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';
import {
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../minigame-host/minigame-host.model';

const PVP_DECISION_DEADLINE_REFRESH_INTERVAL_MS = 5000;

@Injectable()
export class CombatHostState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly combatSessions = inject(CombatSessions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly previewToken = new RequestToken();
  private readonly manualStartToken = new RequestToken();
  private readonly autoResolveToken = new RequestToken();
  private readonly submitActionToken = new RequestToken();
  private readonly pvpActionOfferToken = new RequestToken();
  private readonly sourceRef = signal<MinigameSourceRef | null>(null);
  private readonly contextTitle = signal('');
  private readonly contextLabel = signal('Walka');
  private readonly nowMs = signal(Date.now());
  private walkingTimer: number | null = null;
  private walkingManifestId: string | null = null;
  private walkingTimerSpeed: number | null = null;
  private pvpDecisionDeadlineRefreshKey: string | null = null;
  private lastPvpDecisionDeadlineRefreshMs = 0;

  private readonly preview = signal<CombatResolutionPreviewReadModel | null>(null);
  private readonly liveState = signal<CombatLiveStateReadModel | null>(null);
  private readonly pvpActionOffer = signal<ActivePvpActionOffer | null>(null);
  private readonly isLoadingPvpActionOffer = signal(false);
  private readonly isLoadingPreview = signal(false);
  private readonly isPreparingSession = signal(false);
  private readonly isAutoResolving = signal(false);
  private readonly isSubmittingAction = signal(false);
  private readonly walkingPosition = signal(0);
  readonly previewErrorMessage = signal<string | null>(null);
  readonly actionErrorMessage = signal<string | null>(null);
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  private readonly walkingDirection = signal<1 | -1>(1);

  readonly stage = computed(() => mapCombatSessionStageView({
    liveState: this.liveState(),
    preview: this.preview(),
    contextLabel: this.contextLabel(),
    contextTitle: this.contextTitle(),
    isLoadingPreview: this.isLoadingPreview(),
    previewFailed: Boolean(this.previewErrorMessage()),
    isPreparingSession: this.isPreparingSession(),
    isAutoResolving: this.isAutoResolving(),
    isSubmittingAction: this.isSubmittingAction(),
    walkingPosition: this.walkingPosition(),
    canSubmitStrike: this.canSubmitStrike(),
    decisionDeadline: this.decisionDeadline(),
    activeHeroId: this.activeHero.state()?.heroId ?? null,
    activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
  }));
  private readonly decisionDeadline = computed<CombatSurfaceDecisionDeadline | null>(() => {
    const sourceRef = this.sourceRef();
    const offer = this.pvpActionOffer();

    if (
      !sourceRef ||
      sourceRef.sourceEntityType !== MINIGAME_SOURCE_ENTITY_TYPE.pvpAction ||
      !offer ||
      offer.pvpActionId !== sourceRef.sourceEntityId ||
      offer.actionKind !== 'attack' ||
      !offer.isManualWindow ||
      offer.isResolved ||
      this.liveState() ||
      this.completion() ||
      this.isPreparingSession() ||
      this.isAutoResolving()
    ) {
      return null;
    }

    const resolvesAt = pvpDecisionDeadlineAt(offer);

    if (!resolvesAt) {
      return null;
    }

    const timer = pendingTimerDisplay({
      subjectId: offer.pvpActionId,
      startedAt: pvpDecisionStartedAt(offer),
      resolvesAt,
      nowMs: this.nowMs(),
      isLoading: this.isLoadingPvpActionOffer(),
    });

    return {
      label: 'Okno decyzji',
      countdownLabel: timer.countdownLabel,
      progressPercent: timer.isCoherent ? Math.max(0, 100 - timer.progressPercent) : 0,
      isUpdating: this.isLoadingPvpActionOffer() || timer.isReady,
    };
  });

  constructor() {
    const decisionTimer = setInterval(() => this.nowMs.set(Date.now()), 1000);

    effect(() => {
      const state = this.liveState();
      const manifest = state?.currentTimingManifest ?? null;

      if (
        !state ||
        state.statusKey === 'completed' ||
        state.awaitingPlayerAction !== true ||
        !manifest ||
        this.isSubmittingAction()
      ) {
        this.stopCombatTiming();
        return;
      }

      this.startCombatTiming(manifest.manifestId, manifest.speed);
    });

    effect(() => {
      const sourceRef = this.sourceRef();
      const offer = this.pvpActionOffer();
      const nowMs = this.nowMs();
      const resolvesAt = offer ? pvpDecisionDeadlineAt(offer) : null;

      if (
        !sourceRef ||
        sourceRef.sourceEntityType !== MINIGAME_SOURCE_ENTITY_TYPE.pvpAction ||
        !offer ||
        offer.pvpActionId !== sourceRef.sourceEntityId ||
        offer.actionKind !== 'attack' ||
        !offer.isManualWindow ||
        offer.isResolved ||
        !resolvesAt ||
        !pendingTimerHasElapsed({ resolvesAt, nowMs }) ||
        this.isLoadingPvpActionOffer()
      ) {
        return;
      }

      const refreshKey = `${offer.pvpActionId}:${resolvesAt}`;

      if (
        this.pvpDecisionDeadlineRefreshKey === refreshKey &&
        nowMs - this.lastPvpDecisionDeadlineRefreshMs < PVP_DECISION_DEADLINE_REFRESH_INTERVAL_MS
      ) {
        return;
      }

      this.pvpDecisionDeadlineRefreshKey = refreshKey;
      this.lastPvpDecisionDeadlineRefreshMs = nowMs;
      queueMicrotask(() => this.loadPvpActionOffer(sourceRef));
    });

    this.destroyRef.onDestroy(() => {
      clearInterval(decisionTimer);
      this.stopCombatTiming();
    });
  }

  setContext(input: { sourceRef: MinigameSourceRef; contextTitle: string; contextLabel: string }): void {
    this.contextTitle.set(input.contextTitle);
    this.contextLabel.set(input.contextLabel);

    if (!this.sameSourceRef(this.sourceRef(), input.sourceRef)) {
      this.sourceRef.set(input.sourceRef);
      this.loadPreview(input.sourceRef);
    }
  }

  clearCompletion(): void {
    this.completion.set(null);
  }

  submitCombatStrike(): void {
    const state = this.liveState();
    const sourceRef = this.sourceRef();

    if (!sourceRef || !state || !this.canSubmitStrike()) {
      return;
    }

    const sessionId = state.sessionId;
    const actionIndex = state.currentActionIndex;
    const manifestId = state.currentTimingManifest?.manifestId ?? null;
    const positionPercent = this.walkingPosition();
    let acceptedSubmitResponse = false;

    this.actionErrorMessage.set(null);
    this.isSubmittingAction.set(true);
    this.runSourceRequest({
      requestToken: this.submitActionToken,
      sourceRef,
      request: this.combatSessions.submitCombatPlayerAction({
        combatSessionId: sessionId,
        positionPercent,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:submit-action:${sourceRef.sourceEntityId}`,
        ),
      }),
      isCurrent: () => {
        if (acceptedSubmitResponse) {
          return true;
        }

        const current = this.liveState();

        return current?.sessionId === sessionId &&
          current.currentActionIndex === actionIndex &&
          current.currentTimingManifest?.manifestId === manifestId;
      },
      onSuccess: (nextState) => {
        acceptedSubmitResponse = true;
        this.setLiveState(nextState, true);
        this.completeManualCombatIfNeeded(nextState);
      },
      onError: () => this.actionErrorMessage.set('Nie udało się wykonać akcji walki.'),
      onFinalize: () => this.isSubmittingAction.set(false),
    });
  }

  private loadPreview(sourceRef: MinigameSourceRef): void {
    this.manualStartToken.next();
    this.autoResolveToken.next();
    this.submitActionToken.next();
    this.preview.set(null);
    this.liveState.set(null);
    this.pvpActionOffer.set(null);
    this.pvpDecisionDeadlineRefreshKey = null;
    this.lastPvpDecisionDeadlineRefreshMs = 0;
    this.previewErrorMessage.set(null);
    this.actionErrorMessage.set(null);
    this.completion.set(null);
    this.isPreparingSession.set(false);
    this.isAutoResolving.set(false);
    this.isSubmittingAction.set(false);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.stopCombatTiming();
    this.isLoadingPreview.set(true);
    this.loadPvpActionOffer(sourceRef);

    this.runSourceRequest({
      requestToken: this.previewToken,
      sourceRef,
      request: this.combatSessions.getCombatResolutionPreview({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        localeKey: 'pl',
      }),
      onSuccess: (preview) => this.preview.set(preview),
      onError: () => this.previewErrorMessage.set('Nie udało się odczytać podglądu walki.'),
      onFinalize: () => this.isLoadingPreview.set(false),
    });
  }

  private loadPvpActionOffer(sourceRef: MinigameSourceRef): void {
    if (sourceRef.sourceEntityType !== MINIGAME_SOURCE_ENTITY_TYPE.pvpAction) {
      this.pvpActionOfferToken.next();
      this.pvpActionOffer.set(null);
      this.isLoadingPvpActionOffer.set(false);
      return;
    }

    const token = this.pvpActionOfferToken.next();
    this.isLoadingPvpActionOffer.set(true);

    this.playerPvp.getActivePvpActionOffer()
      .pipe(
        finalize(() => {
          if (
            this.pvpActionOfferToken.isCurrent(token) &&
            this.sameSourceRef(this.sourceRef(), sourceRef)
          ) {
            this.isLoadingPvpActionOffer.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (offer) => {
          if (
            !this.pvpActionOfferToken.isCurrent(token) ||
            !this.sameSourceRef(this.sourceRef(), sourceRef)
          ) {
            return;
          }

          this.pvpActionOffer.set(
            offer?.pvpActionId === sourceRef.sourceEntityId ? offer : null,
          );
        },
        error: () => {
          if (
            this.pvpActionOfferToken.isCurrent(token) &&
            this.sameSourceRef(this.sourceRef(), sourceRef)
          ) {
            this.pvpActionOffer.set(null);
          }
        },
      });
  }

  startManualCombat(): void {
    const preview = this.preview();
    const sourceRef = this.sourceRef();

    if (
      !sourceRef ||
      !preview?.canStartManual ||
      this.liveState() ||
      this.isPreparingSession() ||
      this.isAutoResolving()
    ) {
      return;
    }

    this.actionErrorMessage.set(null);
    this.isPreparingSession.set(true);
    this.runSourceRequest({
      requestToken: this.manualStartToken,
      sourceRef,
      request: this.combatSessions.startManualCombatSession({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:manual-start:${sourceRef.sourceEntityId}`,
        ),
      }),
      onSuccess: (state) => {
        this.setLiveState(state, false);
        this.completeManualCombatIfNeeded(state);
      },
      onError: () => this.actionErrorMessage.set('Nie udało się rozpocząć ręcznej walki.'),
      onFinalize: () => this.isPreparingSession.set(false),
    });
  }

  autoResolveCombat(): void {
    const preview = this.preview();
    const sourceRef = this.sourceRef();

    if (
      !sourceRef ||
      !preview?.canAutoResolve ||
      this.liveState() ||
      this.isPreparingSession() ||
      this.isAutoResolving()
    ) {
      return;
    }

    this.actionErrorMessage.set(null);
    this.isAutoResolving.set(true);
    this.runSourceRequest({
      requestToken: this.autoResolveToken,
      sourceRef,
      request: this.combatSessions.autoResolveCombatSession({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:auto-resolve:${sourceRef.sourceEntityId}`,
        ),
      }),
      onSuccess: (result) => this.completion.set({
        minigameKey: MINIGAME_KEY.combat,
        sourceEntityId: result.sourceEntityId,
        resultId: result.sourceResultId ?? result.combatResultId,
        reportId: result.gameReportId,
      }),
      onError: () => this.actionErrorMessage.set('Nie udało się automatycznie rozstrzygnąć walki.'),
      onFinalize: () => this.isAutoResolving.set(false),
    });
  }

  private runSourceRequest<T>(input: {
    requestToken: RequestToken;
    sourceRef: MinigameSourceRef;
    request: Observable<T>;
    onSuccess: (result: T) => void;
    onError: () => void;
    onFinalize?: () => void;
    isCurrent?: () => boolean;
  }): void {
    const token = input.requestToken.next();
    const isCurrent = () =>
      input.requestToken.isCurrent(token) &&
      this.sameSourceRef(this.sourceRef(), input.sourceRef) &&
      (input.isCurrent?.() ?? true);

    input.request
      .pipe(
        finalize(() => {
          if (isCurrent()) {
            input.onFinalize?.();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (isCurrent()) {
            input.onSuccess(result);
          }
        },
        error: () => {
          if (isCurrent()) {
            input.onError();
          }
        },
      });
  }

  private canSubmitStrike(): boolean {
    const state = this.liveState();

    return Boolean(state?.statusKey !== 'completed' &&
      state?.awaitingPlayerAction &&
      state.currentTimingManifest &&
      !this.isSubmittingAction() &&
      !this.isPreparingSession() &&
      !this.isAutoResolving());
  }

  private setLiveState(state: CombatLiveStateReadModel, mergeEvents: boolean): void {
    this.liveState.set(mergeEvents ? mergeCombatLiveEvents(this.liveState(), state) : state);
  }

  private completeManualCombatIfNeeded(state: CombatLiveStateReadModel): void {
    const sourceRef = this.sourceRef();

    if (
      state.statusKey !== 'completed' ||
      !state.finalCombatResultId ||
      !sourceRef ||
      !this.sameSourceRef(sourceRef, {
        sourceEntityType: state.sourceEntityType,
        sourceEntityId: state.sourceEntityId,
      })
    ) {
      return;
    }

    this.completion.set({
      minigameKey: MINIGAME_KEY.combat,
      sourceEntityId: state.sourceEntityId,
      resultId: state.finalCombatResultId,
      reportId: null,
    });
  }

  private sameSourceRef(
    current: { sourceEntityType: string; sourceEntityId: string } | null,
    next: { sourceEntityType: string; sourceEntityId: string },
  ): boolean {
    return current?.sourceEntityType === next.sourceEntityType &&
      current.sourceEntityId === next.sourceEntityId;
  }

  private startCombatTiming(manifestId: string, speed: number): void {
    if (
      this.walkingTimer !== null &&
      this.walkingManifestId === manifestId &&
      this.walkingTimerSpeed === speed
    ) {
      return;
    }

    this.stopCombatTiming();
    this.walkingManifestId = manifestId;
    this.walkingTimerSpeed = speed;
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.walkingTimer = window.setInterval(() => {
      const next = advanceWalkingDeadTimingFrame({
        position: this.walkingPosition(),
        direction: this.walkingDirection(),
      }, speed);

      this.walkingPosition.set(next.position);
      this.walkingDirection.set(next.direction);
    }, 16);
  }

  private stopCombatTiming(): void {
    if (this.walkingTimer !== null) {
      window.clearInterval(this.walkingTimer);
      this.walkingTimer = null;
    }

    this.walkingManifestId = null;
    this.walkingTimerSpeed = null;
  }
}

function pvpDecisionDeadlineAt(offer: ActivePvpActionOffer): string | null {
  return offer.manualDeadlineAt ?? offer.expiresAt;
}

function pvpDecisionStartedAt(offer: ActivePvpActionOffer): string {
  return offer.arrivesAt ?? offer.availableAt ?? offer.startedAt;
}
