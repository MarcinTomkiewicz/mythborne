import {
  CombatSurfaceAction,
  CombatSurfaceCenterPanel,
} from '../domain/combat/combat-display.model';
import { CombatLiveCenterPanelInput } from '../domain/combat/combat-stage.model';

export function mapLiveCombatCenterPanel(
  input: CombatLiveCenterPanelInput,
): CombatSurfaceCenterPanel | null {
  const footerAction = autoResolveButton(input);

  if (input.loading.isLoadingPreview) {
    const loading = input.sourcePresentation.loadingPreview;

    return {
      state: 'loading',
      contextLabel: actionContextLabel(input),
      title: loading.title,
      helperText: loading.text,
      footerAction,
    };
  }

  if (input.loading.previewFailed) {
    const unavailable = input.sourcePresentation.unavailablePreview;

    return {
      state: 'error',
      contextLabel: actionContextLabel(input),
      title: unavailable.title,
      helperText: unavailable.text,
      footerAction,
    };
  }

  if (input.timing.isCombatRunning && input.timingManifest) {
    const live = input.sourcePresentation.live;

    return {
      state: 'live_manual',
      contextLabel: actionContextLabel(input),
      title: currentActionTitle(input),
      helperText: currentActionHelper(input),
      meter: {
        manifestId: input.timingManifest.manifestId,
        position: input.timing.walkingPosition,
        zoneStart: input.timing.hitWindow.start,
        zoneEnd: input.timing.hitWindow.end,
        disabled: !input.timing.canSubmitStrike,
        actionLabel: live.timingActionLabel,
        actionLoading: input.loading.isSubmittingAction,
        title: live.meterTitle,
        helperText: live.meterHelperText,
        earlyLabel: live.meterEarlyLabel,
        hitZoneLabel: live.meterHitZoneLabel,
        lateLabel: live.meterLateLabel,
      },
    };
  }

  if (input.actions.canShowStartAction) {
    const decision = input.sourcePresentation.decision;

    return {
      state: 'decision',
      contextLabel: actionContextLabel(input),
      title: decision.title,
      helperText: decision.description,
      primaryAction: {
        id: 'start-combat',
        label: decision.manualActionLabel,
        loading: input.loading.isPreparingSession || input.loading.isRecoveringState,
        disabled: !input.actions.canStartAction,
        helperText: decision.manualActionTooltip,
      },
      secondaryAction: autoResolveButton(input),
      decisionDeadline: input.decisionDeadline,
    };
  }

  return null;
}

function actionContextLabel(input: CombatLiveCenterPanelInput): string | null {
  if (isDecisionPreview(input)) {
    return input.sourcePresentation.decision.eyebrow;
  }

  return input.sourcePresentation.live.contextLabel ?? input.roundLabel;
}

function currentActionTitle(input: CombatLiveCenterPanelInput): string | null {
  if (isDecisionPreview(input)) {
    return input.sourcePresentation.decision.title;
  }

  return input.timingManifest?.label ?? input.sourcePresentation.live.title;
}

function currentActionHelper(input: CombatLiveCenterPanelInput): string | null {
  if (isDecisionPreview(input)) {
    return input.sourcePresentation.decision.description;
  }

  const live = input.sourcePresentation.live;

  if (input.loading.isSubmittingAction) {
    return live.submittingHelperText;
  }

  if (input.loading.isPreparingSession || input.loading.isRecoveringState) {
    return live.preparingHelperText;
  }

  if (input.liveStatusKey === 'completed') {
    return live.completedHelperText;
  }

  return live.helperText;
}

function isDecisionPreview(input: CombatLiveCenterPanelInput): boolean {
  return input.liveStatusKey === null && input.previewStatus === 'decision_preview';
}

function autoResolveButton(input: CombatLiveCenterPanelInput): CombatSurfaceAction | null {
  const decision = input.sourcePresentation.decision;

  if (input.timing.isCombatRunning || !input.actions.canShowAutoResolveAction) {
    return null;
  }

  return {
    id: 'auto-resolve',
    label: decision.autoActionLabel,
    severity: 'secondary',
    loading: input.actions.isAutoResolving,
    disabled: !input.actions.canAutoResolveAction,
    helperText: decision.autoActionTooltip,
  };
}
