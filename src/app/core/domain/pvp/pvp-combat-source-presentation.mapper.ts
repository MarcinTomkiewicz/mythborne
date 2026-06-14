import { CombatSourcePresentation } from '../combat/combat-source-presentation.model';
import { CombatCommonCopy } from '../combat/combat-common-copy.model';
import { PvpActionCopy } from './pvp-action-copy.model';
import { PvpCombatCopy } from './pvp-combat-copy.model';

export function pvpCombatSourcePresentation(
  actionCopy: PvpActionCopy,
  combatCommonCopy: CombatCommonCopy,
  pvpCombatCopy: PvpCombatCopy,
): CombatSourcePresentation {
  const pvpPresentation = pvpCombatCopy.sourcePresentation;
  const workflow = pvpPresentation.workflow ?? combatCommonCopy.workflow;

  return {
    header: pvpPresentation.header,
    decision: {
      eyebrow: actionCopy.combatHandoff.decisionWindow.eyebrow,
      title: actionCopy.combatHandoff.decisionWindow.title,
      description: actionCopy.combatHandoff.decisionWindow.description,
      manualActionLabel: actionCopy.common.actionLabels.resolveManual,
      manualActionTooltip: actionCopy.common.actionTooltips.resolveManual,
      autoActionLabel: actionCopy.common.actionLabels.resolveAuto,
      autoActionTooltip: actionCopy.common.actionTooltips.resolveAuto,
      waitingForDecision: actionCopy.combatHandoff.decisionWindow.waitingForDecision,
    },
    loadingPreview: {
      title: actionCopy.combatHandoff.decisionWindow.waitingForDecision,
      text: actionCopy.activeAction.loading.refreshDecisionState,
    },
    unavailablePreview: {
      title: actionCopy.common.emptyValues.noData,
      text: actionCopy.activeAction.loading.refreshUnknownState,
    },
    emptyLog: pvpPresentation.emptyLog,
    emptyParticipants: combatCommonCopy.emptyParticipants,
    live: {
      contextLabel: null,
      title: pvpPresentation.live.title,
      text: pvpPresentation.live.text,
      helperText: pvpPresentation.live.helperText,
      submittingHelperText: combatCommonCopy.live.submittingHelperText,
      preparingHelperText: combatCommonCopy.live.preparingHelperText,
      completedHelperText: combatCommonCopy.live.completedHelperText,
      timingActionLabel: combatCommonCopy.live.timingActionLabel,
      meterTitle: combatCommonCopy.live.meterTitle,
      meterHelperText: combatCommonCopy.live.meterHelperText,
      meterEarlyLabel: combatCommonCopy.live.meterEarlyLabel,
      meterHitZoneLabel: combatCommonCopy.live.meterHitZoneLabel,
      meterLateLabel: combatCommonCopy.live.meterLateLabel,
    },
    workflow: {
      finalizingResult: workflow.finalizingResult,
      finalizeUnavailable: workflow.finalizeUnavailable,
      actionUnavailable: workflow.actionUnavailable,
    },
  };
}
