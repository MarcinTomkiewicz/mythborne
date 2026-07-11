import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import type {
  CombatSurfaceDecisionDeadline,
  CombatTimingStrikeSnapshot,
} from '../../../core/domain/combat/combat-display.model';
import type { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import type { MinigameSourceRef } from '../../../core/domain/minigame/minigame-completion.model';
import type { CombatHostContextInput } from '../../../core/interfaces/combat-host-runner.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { mapCombatSessionStageView } from '../../../core/utils/combat-stage-display.mapper';
import { sameSourceRef } from '../../../core/utils/source-ref';
import { CombatHostPreviewState } from './combat-host-preview.state';
import { CombatHostSessionRunner } from './combat-host-session-runner';
import { CombatHostTimingState } from './combat-host-timing.state';

@Injectable()
export class CombatHostState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previewState = inject(CombatHostPreviewState);
  private readonly session = inject(CombatHostSessionRunner);
  private readonly timing = inject(CombatHostTimingState);
  private readonly sourceRef = signal<MinigameSourceRef | null>(null);
  private readonly combatLiveSessionId = signal<string | null>(null);
  private readonly contextTitle = signal('');
  private readonly sourcePresentation = signal<CombatSourcePresentation | null>(null);
  private readonly externalDeadline = signal<CombatSurfaceDecisionDeadline | null>(null);

  readonly completion = this.session.completion;
  readonly isFinalizingResult = this.session.isFinalizing;
  readonly previewErrorMessage = this.previewState.error;
  readonly actionErrorMessage = this.session.actionError;
  readonly finalizeErrorMessage = this.session.finalizeError;
  readonly finalizingResultPanel = computed(() =>
    this.sourcePresentation()?.workflow.finalizingResult ?? null,
  );
  readonly finalizeErrorPanel = computed(() => {
    const message = this.session.finalizeError();
    const panel = this.sourcePresentation()?.workflow.finalizeUnavailable ?? null;

    return message && panel ? { title: panel.title, text: message } : null;
  });
  private readonly visibleDeadline = computed(() =>
    this.session.liveState()
    || this.session.completion()
    || this.session.isPreparing()
    || this.session.isAutoResolving()
      ? null
      : this.externalDeadline(),
  );
  readonly stage = computed(() => {
    const sourcePresentation = this.sourcePresentation();

    return sourcePresentation
      ? mapCombatSessionStageView({
          liveState: this.session.liveState(),
          preview: this.previewState.preview(),
          contextTitle: this.contextTitle(),
          isLoadingPreview: this.previewState.isLoading(),
          previewFailed: Boolean(this.previewState.error()),
          isPreparingSession: this.session.isPreparing(),
          isAutoResolving: this.session.isAutoResolving(),
          isSubmittingAction: this.session.isSubmitting(),
          isRecoveringState: this.session.isRecovering(),
          walkingPosition: this.timing.frame().positionPercent,
          canSubmitStrike: this.session.canSubmitStrike(),
          decisionDeadline: this.visibleDeadline(),
          sourcePresentation,
          activeHeroId: this.activeHero.state()?.heroId ?? null,
          activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
        })
      : null;
  });

  constructor() {
    effect(() => {
      const state = this.session.liveState();
      const manifest = state?.currentTimingManifest ?? null;

      if (
        !state
        || state.statusKey === 'completed'
        || state.awaitingPlayerAction !== true
        || !manifest
        || this.session.isSubmitting()
      ) {
        this.timing.stop();
        return;
      }

      this.timing.start(manifest.manifestId, manifest.speedMultiplier);
    });
    effect(() => {
      const sourceRef = this.sourceRef();
      const preview = this.previewState.preview();

      if (sourceRef && preview?.combatSessionId) {
        this.recoverLiveState(sourceRef, preview.combatSessionId);
      }
    });
    this.destroyRef.onDestroy(() => this.timing.stop());
  }

  setContext(input: CombatHostContextInput): void {
    this.contextTitle.set(input.contextTitle);
    this.sourcePresentation.set(input.sourcePresentation);
    const previousSessionId = this.combatLiveSessionId();
    this.combatLiveSessionId.set(input.combatLiveSessionId);

    if (!sameSourceRef(this.sourceRef(), input.sourceRef)) {
      this.sourceRef.set(input.sourceRef);
      this.resetFlow();

      if (input.combatLiveSessionId) {
        this.recoverLiveState(input.sourceRef, input.combatLiveSessionId);
      } else {
        this.previewState.load(
          input.sourceRef,
          () => this.sourceRef(),
          input.sourcePresentation.unavailablePreview.text,
        );
      }

      return;
    }

    if (input.combatLiveSessionId && input.combatLiveSessionId !== previousSessionId) {
      this.resetFlow();
      this.recoverLiveState(input.sourceRef, input.combatLiveSessionId);
    }
  }

  setDecisionDeadline(value: CombatSurfaceDecisionDeadline | null): void {
    this.externalDeadline.set(value);
  }

  clearCompletion(): void {
    this.session.clearCompletion();
  }

  startManualCombat(): void {
    const sourceRef = this.sourceRef();

    if (sourceRef) {
      this.session.startManualCombat(
        sourceRef,
        () => this.sourceRef(),
        this.previewState.preview(),
        this.actionUnavailableText(),
        this.finalizeUnavailableText(),
      );
    }
  }

  autoResolveCombat(): void {
    const sourceRef = this.sourceRef();

    if (sourceRef) {
      this.session.autoResolveCombat(
        sourceRef,
        () => this.sourceRef(),
        this.previewState.preview(),
        this.actionUnavailableText(),
      );
    }
  }

  submitCombatStrike(snapshot: CombatTimingStrikeSnapshot): void {
    const sourceRef = this.sourceRef();

    if (sourceRef) {
      this.session.submitStrike(
        sourceRef,
        () => this.sourceRef(),
        snapshot,
        this.actionUnavailableText(),
        this.finalizeUnavailableText(),
      );
    }
  }

  private recoverLiveState(sourceRef: MinigameSourceRef, sessionId: string): void {
    this.session.recoverLiveState(
      sourceRef,
      () => this.sourceRef(),
      sessionId,
      this.actionUnavailableText(),
      this.finalizeUnavailableText(),
    );
  }

  private resetFlow(): void {
    this.previewState.reset();
    this.session.reset();
    this.timing.resetFrame();
    this.timing.stop();
  }

  private actionUnavailableText(): string | null {
    return this.sourcePresentation()?.workflow.actionUnavailable?.text
      ?? this.sourcePresentation()?.unavailablePreview.text
      ?? null;
  }

  private finalizeUnavailableText(): string | null {
    return this.sourcePresentation()?.workflow.finalizeUnavailable?.text ?? null;
  }
}
