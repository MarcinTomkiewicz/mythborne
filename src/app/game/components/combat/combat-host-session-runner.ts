import { Injectable, inject } from '@angular/core';
import { CombatTimingStrikeSnapshot } from '../../../core/domain/combat/combat-display.model';
import { CombatLiveStateReadModel } from '../../../core/domain/combat/combat-live.model';
import { CombatSessions } from '../../../core/services/combat/combat-sessions';
import { mergeCombatLiveEvents } from '../../../core/utils/combat-live-mappers';
import { createRequestId } from '../../../core/utils/request-id';
import { sameSourceRef } from '../../../core/utils/source-ref';
import { MINIGAME_KEY } from '../minigame-host/minigame-host.model';
import { CombatHostRequestRunner } from './combat-host-request-runner';
import { CombatHostSessionRunnerContext } from './combat-host-session-runner-context.model';

@Injectable()
export class CombatHostSessionRunner {
  private readonly combatSessions = inject(CombatSessions);
  private readonly requestRunner = inject(CombatHostRequestRunner);

  startManualCombat(context: CombatHostSessionRunnerContext): void {
    const preview = context.preview();
    const sourceRef = context.sourceRef();

    if (
      !sourceRef ||
      !preview?.canStartManual ||
      context.liveState() ||
      context.isRecoveringState() ||
      context.isPreparingSession() ||
      context.isAutoResolving()
    ) {
      return;
    }

    context.setActionError(null);
    context.setIsPreparingSession(true);
    this.requestRunner.run({
      requestToken: context.tokens.manualStart,
      currentSourceRef: context.sourceRef,
      sourceRef,
      request: this.combatSessions.startManualCombatSession({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:manual-start:${sourceRef.sourceEntityId}`,
        ),
      }),
      onSuccess: (state) => {
        context.setLiveState(state);
        this.completeManualCombatIfNeeded(context, state);
      },
      onError: () => context.setActionError(context.actionUnavailableText()),
      onFinalize: () => context.setIsPreparingSession(false),
    });
  }

  autoResolveCombat(context: CombatHostSessionRunnerContext): void {
    const preview = context.preview();
    const sourceRef = context.sourceRef();

    if (
      !sourceRef ||
      !preview?.canAutoResolve ||
      context.liveState() ||
      context.isRecoveringState() ||
      context.isPreparingSession() ||
      context.isAutoResolving()
    ) {
      return;
    }

    context.setActionError(null);
    context.setFinalizeError(null);
    context.setIsAutoResolving(true);
    this.requestRunner.run({
      requestToken: context.tokens.autoResolve,
      currentSourceRef: context.sourceRef,
      sourceRef,
      request: this.combatSessions.autoResolveCombatSession({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:auto-resolve:${sourceRef.sourceEntityId}`,
        ),
      }),
      onSuccess: (result) => context.setCompletion({
        minigameKey: MINIGAME_KEY.combat,
        sourceEntityId: result.sourceEntityId,
        resultId: result.sourceResultId ?? result.combatResultId,
        reportId: result.gameReportId,
        rewardGrantId: result.rewardGrantId,
      }),
      onError: () => context.setActionError(context.actionUnavailableText()),
      onFinalize: () => context.setIsAutoResolving(false),
    });
  }

  recoverCombatLiveState(
    context: CombatHostSessionRunnerContext,
    combatSessionId: string | null,
  ): void {
    const sourceRef = context.sourceRef();

    if (
      !sourceRef ||
      !combatSessionId ||
      context.liveState() ||
      context.isRecoveringState()
    ) {
      return;
    }

    context.setActionError(null);
    context.setIsRecoveringState(true);
    this.requestRunner.run({
      requestToken: context.tokens.recoverState,
      currentSourceRef: context.sourceRef,
      sourceRef,
      request: this.combatSessions.getCombatLiveState({
        combatSessionId,
      }),
      isCurrent: () => !context.liveState(),
      onSuccess: (state) => {
        context.setLiveState(state);
        this.completeManualCombatIfNeeded(context, state);
      },
      onError: () => context.setActionError(context.actionUnavailableText()),
      onFinalize: () => context.setIsRecoveringState(false),
    });
  }

  submitCombatStrike(
    context: CombatHostSessionRunnerContext,
    snapshot: CombatTimingStrikeSnapshot,
  ): void {
    const state = context.liveState();
    const sourceRef = context.sourceRef();

    if (!sourceRef || !state || !canSubmitStrike(context)) {
      return;
    }

    const sessionId = state.sessionId;
    const actionIndex = state.currentActionIndex;
    const manifestId = state.currentTimingManifest?.manifestId ?? null;

    if (!manifestId || snapshot.manifestId !== manifestId) {
      return;
    }

    let acceptedSubmitResponse = false;

    context.setActionError(null);
    context.setIsSubmittingAction(true);
    this.requestRunner.run({
      requestToken: context.tokens.submitAction,
      currentSourceRef: context.sourceRef,
      sourceRef,
      request: this.combatSessions.submitCombatPlayerAction({
        combatSessionId: sessionId,
        positionPercent: snapshot.positionPercent,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:submit-action:${sourceRef.sourceEntityId}`,
        ),
      }),
      isCurrent: () => {
        if (acceptedSubmitResponse) {
          return true;
        }

        const current = context.liveState();

        return current?.sessionId === sessionId &&
          current.currentActionIndex === actionIndex &&
          current.currentTimingManifest?.manifestId === manifestId;
      },
      onSuccess: (nextState) => {
        acceptedSubmitResponse = true;
        context.setLiveState(mergeCombatLiveEvents(context.liveState(), nextState));
        this.completeManualCombatIfNeeded(context, nextState);
      },
      onError: () => context.setActionError(context.actionUnavailableText()),
      onFinalize: () => context.setIsSubmittingAction(false),
    });
  }

  private completeManualCombatIfNeeded(
    context: CombatHostSessionRunnerContext,
    state: CombatLiveStateReadModel,
  ): void {
    const sourceRef = context.sourceRef();

    if (
      state.statusKey !== 'completed' ||
      !state.finalCombatResultId ||
      !sourceRef ||
      context.isFinalizingResult() ||
      context.completion() ||
      !sameSourceRef(sourceRef, {
        sourceEntityType: state.sourceEntityType,
        sourceEntityId: state.sourceEntityId,
      })
    ) {
      return;
    }

    context.setFinalizeError(null);
    context.setIsFinalizingResult(true);
    this.requestRunner.run({
      requestToken: context.tokens.finalizeResult,
      currentSourceRef: context.sourceRef,
      sourceRef,
      request: this.combatSessions.finalizeCombatSourceResult({
        combatSessionId: state.sessionId,
        requestId: createRequestId(
          `combat:${sourceRef.sourceEntityType}:finalize:${sourceRef.sourceEntityId}`,
        ),
        resolutionMode: 'manual',
      }),
      isCurrent: () => context.liveState()?.sessionId === state.sessionId,
      onSuccess: (result) => context.setCompletion({
        minigameKey: MINIGAME_KEY.combat,
        sourceEntityId: result.sourceEntityId,
        resultId: result.sourceResultId ?? result.combatResultId,
        reportId: result.gameReportId,
        rewardGrantId: result.rewardGrantId,
      }),
      onError: () => context.setFinalizeError(
        context.finalizeUnavailableText() ?? context.actionUnavailableText(),
      ),
      onFinalize: () => context.setIsFinalizingResult(false),
    });
  }
}

function canSubmitStrike(context: CombatHostSessionRunnerContext): boolean {
  const state = context.liveState();

  return Boolean(state?.statusKey !== 'completed' &&
    state?.awaitingPlayerAction &&
    state.currentTimingManifest &&
    !context.isSubmittingAction() &&
    !context.isPreparingSession() &&
    !context.isAutoResolving());
}
