import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
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
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { mapCombatSessionStageView } from '../../../core/utils/combat-stage-display.mapper';
import { advanceWalkingDeadTimingFrame } from '../../../core/utils/combat-walking-dead';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';
import {
  MINIGAME_KEY,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../minigame-host/minigame-host.model';

@Injectable()
export class CombatHostState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly combatSessions = inject(CombatSessions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previewToken = new RequestToken();
  private readonly manualStartToken = new RequestToken();
  private readonly autoResolveToken = new RequestToken();
  private readonly submitActionToken = new RequestToken();
  private readonly finalizeResultToken = new RequestToken();
  private readonly sourceRef = signal<MinigameSourceRef | null>(null);
  private readonly contextTitle = signal('');
  private readonly contextLabel = signal('Walka');
  private readonly externalDecisionDeadline = signal<CombatSurfaceDecisionDeadline | null>(null);
  private walkingTimer: number | null = null;
  private walkingManifestId: string | null = null;
  private walkingTimerSpeed: number | null = null;

  private readonly preview = signal<CombatResolutionPreviewReadModel | null>(null);
  private readonly liveState = signal<CombatLiveStateReadModel | null>(null);
  private readonly isLoadingPreview = signal(false);
  private readonly isPreparingSession = signal(false);
  private readonly isAutoResolving = signal(false);
  private readonly isSubmittingAction = signal(false);
  readonly isFinalizingResult = signal(false);
  private readonly walkingPosition = signal(0);
  readonly previewErrorMessage = signal<string | null>(null);
  readonly actionErrorMessage = signal<string | null>(null);
  readonly finalizeErrorMessage = signal<string | null>(null);
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  private readonly walkingDirection = signal<1 | -1>(1);
  private readonly visibleDecisionDeadline = computed(() =>
    this.liveState() ||
    this.completion() ||
    this.isPreparingSession() ||
    this.isAutoResolving()
      ? null
      : this.externalDecisionDeadline(),
  );

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
    decisionDeadline: this.visibleDecisionDeadline(),
    activeHeroId: this.activeHero.state()?.heroId ?? null,
    activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
  }));

  constructor() {
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

    this.destroyRef.onDestroy(() => {
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

  setDecisionDeadline(value: CombatSurfaceDecisionDeadline | null): void {
    this.externalDecisionDeadline.set(value);
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
    const requestId = createRequestId(
      `combat:${sourceRef.sourceEntityType}:submit-action:${sourceRef.sourceEntityId}`,
    );
    let acceptedSubmitResponse = false;

    this.actionErrorMessage.set(null);
    this.isSubmittingAction.set(true);
    this.runSourceRequest({
      requestToken: this.submitActionToken,
      sourceRef,
      request: this.combatSessions.submitCombatPlayerAction({
        combatSessionId: sessionId,
        positionPercent,
        requestId,
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
    this.finalizeResultToken.next();
    this.preview.set(null);
    this.liveState.set(null);
    this.previewErrorMessage.set(null);
    this.actionErrorMessage.set(null);
    this.finalizeErrorMessage.set(null);
    this.completion.set(null);
    this.isPreparingSession.set(false);
    this.isAutoResolving.set(false);
    this.isSubmittingAction.set(false);
    this.isFinalizingResult.set(false);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.stopCombatTiming();
    this.isLoadingPreview.set(true);

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
    this.finalizeErrorMessage.set(null);
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
        rewardGrantId: result.rewardGrantId,
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
        error: (error: unknown) => {
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
      this.isFinalizingResult() ||
      this.completion() ||
      !this.sameSourceRef(sourceRef, {
        sourceEntityType: state.sourceEntityType,
        sourceEntityId: state.sourceEntityId,
      })
    ) {
      return;
    }

    this.finalizeErrorMessage.set(null);
    this.isFinalizingResult.set(true);
    this.runSourceRequest({
      requestToken: this.finalizeResultToken,
      sourceRef,
      request: this.combatSessions.finalizeCombatSourceResult({
        combatSessionId: state.sessionId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:finalize:${sourceRef.sourceEntityId}`,
        ),
        resolutionMode: 'manual',
      }),
      isCurrent: () => this.liveState()?.sessionId === state.sessionId,
      onSuccess: (result) => this.completion.set({
        minigameKey: MINIGAME_KEY.combat,
        sourceEntityId: result.sourceEntityId,
        resultId: result.sourceResultId ?? result.combatResultId,
        reportId: result.gameReportId,
        rewardGrantId: result.rewardGrantId,
      }),
      onError: () => this.finalizeErrorMessage.set(
        'Walka została zakończona, ale nie udało się przygotować przejścia do raportu.',
      ),
      onFinalize: () => this.isFinalizingResult.set(false),
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
