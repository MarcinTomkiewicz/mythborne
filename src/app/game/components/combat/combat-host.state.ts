import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CombatSurfaceDecisionDeadline,
  CombatTimingStrikeSnapshot,
} from '../../../core/domain/combat/combat-display.model';
import {
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { mapCombatSessionStageView } from '../../../core/utils/combat-stage-display.mapper';
import { RequestToken } from '../../../core/utils/request-token';
import { sameSourceRef } from '../../../core/utils/source-ref';
import { MinigameCompletionEvent, MinigameSourceRef } from '../minigame-host/minigame-host.model';
import { CombatHostPreviewLoader } from './combat-host-preview-loader';
import {
  CombatHostSessionRunner,
  CombatHostSessionRunnerContext,
} from './combat-host-session-runner';
import { CombatHostTimingState } from './combat-host-timing.state';

@Injectable()
export class CombatHostState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previewLoader = inject(CombatHostPreviewLoader);
  private readonly sessionRunner = inject(CombatHostSessionRunner);
  private readonly timingState = inject(CombatHostTimingState);

  private readonly manualStartToken = new RequestToken();
  private readonly autoResolveToken = new RequestToken();
  private readonly submitActionToken = new RequestToken();
  private readonly finalizeResultToken = new RequestToken();
  private readonly sourceRef = signal<MinigameSourceRef | null>(null);
  private readonly contextTitle = signal('');
  private readonly sourcePresentation = signal<CombatSourcePresentation | null>(null);
  private readonly externalDecisionDeadline = signal<CombatSurfaceDecisionDeadline | null>(null);
  private readonly preview = signal<CombatResolutionPreviewReadModel | null>(null);
  private readonly liveState = signal<CombatLiveStateReadModel | null>(null);
  private readonly isLoadingPreview = signal(false);
  private readonly isPreparingSession = signal(false);
  private readonly isAutoResolving = signal(false);
  private readonly isSubmittingAction = signal(false);

  readonly isFinalizingResult = signal(false);
  readonly previewErrorMessage = signal<string | null>(null);
  readonly actionErrorMessage = signal<string | null>(null);
  readonly finalizeErrorMessage = signal<string | null>(null);
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  readonly finalizingResultPanel = computed(() =>
    this.sourcePresentation()?.workflow.finalizingResult ?? null,
  );
  readonly finalizeErrorPanel = computed(() => {
    const message = this.finalizeErrorMessage();
    const panel = this.sourcePresentation()?.workflow.finalizeUnavailable ?? null;

    return message && panel ? { title: panel.title, text: message } : null;
  });
  private readonly visibleDecisionDeadline = computed(() =>
    this.liveState() ||
    this.completion() ||
    this.isPreparingSession() ||
    this.isAutoResolving()
      ? null
      : this.externalDecisionDeadline(),
  );

  readonly stage = computed(() => {
    const sourcePresentation = this.sourcePresentation();

    return sourcePresentation
      ? mapCombatSessionStageView({
          liveState: this.liveState(),
          preview: this.preview(),
          contextTitle: this.contextTitle(),
          isLoadingPreview: this.isLoadingPreview(),
          previewFailed: Boolean(this.previewErrorMessage()),
          isPreparingSession: this.isPreparingSession(),
          isAutoResolving: this.isAutoResolving(),
          isSubmittingAction: this.isSubmittingAction(),
          walkingPosition: this.timingState.frame().positionPercent,
          canSubmitStrike: this.canSubmitStrike(),
          decisionDeadline: this.visibleDecisionDeadline(),
          sourcePresentation,
          activeHeroId: this.activeHero.state()?.heroId ?? null,
          activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
        })
      : null;
  });

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
        this.timingState.stop();
        return;
      }

      this.timingState.start(manifest.manifestId, manifest.speedMultiplier);
    });

    this.destroyRef.onDestroy(() => {
      this.timingState.stop();
    });
  }

  setContext(input: {
    sourceRef: MinigameSourceRef;
    contextTitle: string;
    sourcePresentation: CombatSourcePresentation;
  }): void {
    this.contextTitle.set(input.contextTitle);
    this.sourcePresentation.set(input.sourcePresentation);

    if (!sameSourceRef(this.sourceRef(), input.sourceRef)) {
      this.sourceRef.set(input.sourceRef);
      this.previewLoader.load({
        sourceRef: input.sourceRef,
        currentSourceRef: () => this.sourceRef(),
        unavailableText: () => this.sourcePresentation()?.unavailablePreview.text ?? null,
        resetForPreviewLoad: () => this.resetForPreviewLoad(),
        setPreview: (preview) => this.preview.set(preview),
        setPreviewError: (message) => this.previewErrorMessage.set(message),
        setIsLoadingPreview: (value) => this.isLoadingPreview.set(value),
      });
    }
  }

  setDecisionDeadline(value: CombatSurfaceDecisionDeadline | null): void {
    this.externalDecisionDeadline.set(value);
  }

  clearCompletion(): void {
    this.completion.set(null);
  }

  startManualCombat(): void {
    this.sessionRunner.startManualCombat(this.sessionContext());
  }

  autoResolveCombat(): void {
    this.sessionRunner.autoResolveCombat(this.sessionContext());
  }

  submitCombatStrike(snapshot: CombatTimingStrikeSnapshot): void {
    this.sessionRunner.submitCombatStrike(this.sessionContext(), snapshot);
  }

  private resetForPreviewLoad(): void {
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
    this.timingState.resetFrame();
    this.timingState.stop();
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

  private actionUnavailableText(): string | null {
    return this.sourcePresentation()?.workflow.actionUnavailable?.text ??
      this.sourcePresentation()?.unavailablePreview.text ??
      null;
  }

  private finalizeUnavailableText(): string | null {
    return this.sourcePresentation()?.workflow.finalizeUnavailable?.text ?? null;
  }

  private sessionContext(): CombatHostSessionRunnerContext {
    return {
      sourceRef: () => this.sourceRef(),
      preview: () => this.preview(),
      liveState: () => this.liveState(),
      completion: () => this.completion(),
      isPreparingSession: () => this.isPreparingSession(),
      isAutoResolving: () => this.isAutoResolving(),
      isSubmittingAction: () => this.isSubmittingAction(),
      isFinalizingResult: () => this.isFinalizingResult(),
      actionUnavailableText: () => this.actionUnavailableText(),
      finalizeUnavailableText: () => this.finalizeUnavailableText(),
      tokens: {
        manualStart: this.manualStartToken,
        autoResolve: this.autoResolveToken,
        submitAction: this.submitActionToken,
        finalizeResult: this.finalizeResultToken,
      },
      setLiveState: (state: CombatLiveStateReadModel) => this.liveState.set(state),
      setCompletion: (completion: MinigameCompletionEvent) => this.completion.set(completion),
      setActionError: (message: string | null) => this.actionErrorMessage.set(message),
      setFinalizeError: (message: string | null) => this.finalizeErrorMessage.set(message),
      setIsPreparingSession: (value: boolean) => this.isPreparingSession.set(value),
      setIsAutoResolving: (value: boolean) => this.isAutoResolving.set(value),
      setIsSubmittingAction: (value: boolean) => this.isSubmittingAction.set(value),
      setIsFinalizingResult: (value: boolean) => this.isFinalizingResult.set(value),
    };
  }
}
