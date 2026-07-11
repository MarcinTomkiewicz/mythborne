import { Injectable, computed, inject, signal } from '@angular/core';
import type { CombatTimingStrikeSnapshot } from '../../../core/domain/combat/combat-display.model';
import type {
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
} from '../../../core/domain/combat/combat-live.model';
import {
  MINIGAME_KEY,
  type MinigameCompletionEvent,
  type MinigameSourceRef,
} from '../../../core/domain/minigame/minigame-completion.model';
import { CombatSessions } from '../../../core/services/combat/combat-sessions';
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';
import { sameSourceRef } from '../../../core/utils/source-ref';
import { CombatHostRequestRunner } from './combat-host-request-runner';

@Injectable()
export class CombatHostSessionRunner {
  private readonly combatSessions = inject(CombatSessions);
  private readonly requestRunner = inject(CombatHostRequestRunner);
  private readonly manualStartToken = new RequestToken();
  private readonly autoResolveToken = new RequestToken();
  private readonly submitActionToken = new RequestToken();
  private readonly finalizeResultToken = new RequestToken();
  private readonly recoverStateToken = new RequestToken();

  readonly liveState = signal<CombatLiveStateReadModel | null>(null);
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly finalizeError = signal<string | null>(null);
  readonly isPreparing = signal(false);
  readonly isAutoResolving = signal(false);
  readonly isSubmitting = signal(false);
  readonly isFinalizing = signal(false);
  readonly isRecovering = signal(false);
  readonly canSubmitStrike = computed(() => {
    const state = this.liveState();

    return Boolean(
      state?.statusKey !== 'completed'
      && state?.awaitingPlayerAction
      && state.currentTimingManifest
      && !this.isSubmitting()
      && !this.isPreparing()
      && !this.isAutoResolving(),
    );
  });

  startManualCombat(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    preview: CombatResolutionPreviewReadModel | null,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    if (
      !preview?.canStartManual
      || this.liveState()
      || this.isRecovering()
      || this.isPreparing()
      || this.isAutoResolving()
    ) {
      return;
    }

    this.actionError.set(null);
    this.isPreparing.set(true);
    this.requestRunner.run({
      requestToken: this.manualStartToken,
      currentSourceRef,
      sourceRef,
      request: this.combatSessions.startManualCombatSession({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:manual-start:${sourceRef.sourceEntityId}`,
        ),
      }),
      onSuccess: (state) => {
        this.liveState.set(state);
        this.completeIfNeeded(
          sourceRef,
          currentSourceRef,
          state,
          actionUnavailableText,
          finalizeUnavailableText,
        );
        this.recoverManualStart(
          sourceRef,
          currentSourceRef,
          state,
          actionUnavailableText,
          finalizeUnavailableText,
        );
      },
      onError: () => this.actionError.set(actionUnavailableText),
      onFinalize: () => this.isPreparing.set(false),
    });
  }

  autoResolveCombat(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    preview: CombatResolutionPreviewReadModel | null,
    actionUnavailableText: string | null,
  ): void {
    if (
      !preview?.canAutoResolve
      || this.liveState()
      || this.isRecovering()
      || this.isPreparing()
      || this.isAutoResolving()
    ) {
      return;
    }

    this.actionError.set(null);
    this.finalizeError.set(null);
    this.isAutoResolving.set(true);
    this.requestRunner.run({
      requestToken: this.autoResolveToken,
      currentSourceRef,
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
      onError: () => this.actionError.set(actionUnavailableText),
      onFinalize: () => this.isAutoResolving.set(false),
    });
  }

  recoverLiveState(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    combatSessionId: string,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    if (this.liveState() || this.isRecovering()) {
      return;
    }

    this.recoverSession(
      sourceRef,
      currentSourceRef,
      combatSessionId,
      () => !this.liveState(),
      actionUnavailableText,
      finalizeUnavailableText,
    );
  }

  submitStrike(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    snapshot: CombatTimingStrikeSnapshot,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    const state = this.liveState();
    const manifestId = state?.currentTimingManifest?.manifestId ?? null;

    if (!state || !this.canSubmitStrike() || !manifestId || snapshot.manifestId !== manifestId) {
      return;
    }

    const sessionId = state.sessionId;
    const actionIndex = state.currentActionIndex;
    let acceptedResponse = false;

    this.actionError.set(null);
    this.isSubmitting.set(true);
    this.requestRunner.run({
      requestToken: this.submitActionToken,
      currentSourceRef,
      sourceRef,
      request: this.combatSessions.submitCombatPlayerAction({
        combatSessionId: sessionId,
        positionPercent: snapshot.positionPercent,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:submit-action:${sourceRef.sourceEntityId}`,
        ),
      }),
      isCurrent: () => {
        if (acceptedResponse) {
          return true;
        }

        const current = this.liveState();

        return current?.sessionId === sessionId
          && current.currentActionIndex === actionIndex
          && current.currentTimingManifest?.manifestId === manifestId;
      },
      onSuccess: (nextState) => {
        acceptedResponse = true;
        this.liveState.set(mergeCombatLiveEvents(this.liveState(), nextState));
        this.completeIfNeeded(
          sourceRef,
          currentSourceRef,
          nextState,
          actionUnavailableText,
          finalizeUnavailableText,
        );
      },
      onError: () => this.actionError.set(actionUnavailableText),
      onFinalize: () => this.isSubmitting.set(false),
    });
  }

  clearCompletion(): void {
    this.completion.set(null);
  }

  reset(): void {
    this.manualStartToken.next();
    this.autoResolveToken.next();
    this.submitActionToken.next();
    this.finalizeResultToken.next();
    this.recoverStateToken.next();
    this.liveState.set(null);
    this.completion.set(null);
    this.actionError.set(null);
    this.finalizeError.set(null);
    this.isPreparing.set(false);
    this.isAutoResolving.set(false);
    this.isSubmitting.set(false);
    this.isFinalizing.set(false);
    this.isRecovering.set(false);
  }

  private recoverManualStart(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    state: CombatLiveStateReadModel,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    if (
      state.statusKey === 'completed'
      || this.isRecovering()
      || state.awaitingPlayerAction && state.currentTimingManifest
    ) {
      return;
    }

    this.recoverSession(
      sourceRef,
      currentSourceRef,
      state.sessionId,
      () => this.liveState()?.sessionId === state.sessionId,
      actionUnavailableText,
      finalizeUnavailableText,
    );
  }

  private recoverSession(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    combatSessionId: string,
    isCurrent: () => boolean,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    this.actionError.set(null);
    this.isRecovering.set(true);
    this.requestRunner.run({
      requestToken: this.recoverStateToken,
      currentSourceRef,
      sourceRef,
      request: this.combatSessions.getCombatLiveState({ combatSessionId }),
      isCurrent,
      onSuccess: (nextState) => {
        this.liveState.set(nextState);
        this.completeIfNeeded(
          sourceRef,
          currentSourceRef,
          nextState,
          actionUnavailableText,
          finalizeUnavailableText,
        );
      },
      onError: () => this.actionError.set(actionUnavailableText),
      onFinalize: () => this.isRecovering.set(false),
    });
  }

  private completeIfNeeded(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    state: CombatLiveStateReadModel,
    actionUnavailableText: string | null,
    finalizeUnavailableText: string | null,
  ): void {
    if (
      state.statusKey !== 'completed'
      || !state.finalCombatResultId
      || this.isFinalizing()
      || this.completion()
      || !sameSourceRef(sourceRef, {
        sourceEntityType: state.sourceEntityType,
        sourceEntityId: state.sourceEntityId,
      })
    ) {
      return;
    }

    this.finalizeError.set(null);
    this.isFinalizing.set(true);
    this.requestRunner.run({
      requestToken: this.finalizeResultToken,
      currentSourceRef,
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
      onError: () => this.finalizeError.set(
        finalizeUnavailableText ?? actionUnavailableText,
      ),
      onFinalize: () => this.isFinalizing.set(false),
    });
  }
}
