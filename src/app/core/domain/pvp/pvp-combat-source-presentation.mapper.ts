import { CombatSourcePresentation } from '../combat/combat-source-presentation.model';
import { PvpActionCopy } from './pvp-action-copy.model';

export function pvpCombatSourcePresentation(copy: PvpActionCopy): CombatSourcePresentation {
  return {
    decision: {
      eyebrow: copy.combatHandoff.decisionWindow.eyebrow,
      title: copy.combatHandoff.decisionWindow.title,
      description: copy.combatHandoff.decisionWindow.description,
      manualActionLabel: copy.common.actionLabels.resolveManual,
      manualActionTooltip: copy.common.actionTooltips.resolveManual,
      autoActionLabel: copy.common.actionLabels.resolveAuto,
      autoActionTooltip: copy.common.actionTooltips.resolveAuto,
      waitingForDecision: copy.combatHandoff.decisionWindow.waitingForDecision,
    },
    loadingPreview: {
      title: copy.combatHandoff.decisionWindow.waitingForDecision,
      text: copy.activeAction.loading.refreshDecisionState,
    },
    unavailablePreview: {
      title: copy.common.emptyValues.noData,
      text: copy.activeAction.loading.refreshUnknownState,
    },
    emptyLog: {
      title: copy.common.labels.combatLog,
      text: copy.combatHandoff.emptyCombatLog.text,
    },
    emptyParticipants: {
      loading: null,
      unavailable: {
        leftTitle: copy.common.emptyValues.noData,
        leftText: copy.activeAction.loading.refreshUnknownState,
        rightTitle: copy.common.emptyValues.noData,
        rightText: copy.activeAction.loading.refreshUnknownState,
      },
    },
    live: {
      contextLabel: null,
      title: null,
      helperText: null,
      submittingHelperText: null,
      preparingHelperText: copy.activeAction.loading.refreshDecisionState,
      completedHelperText: copy.activeAction.readyStates.reportReady,
      timingActionLabel: null,
      meterTitle: null,
      meterHelperText: null,
      meterEarlyLabel: null,
      meterHitZoneLabel: null,
      meterLateLabel: null,
    },
    workflow: {
      finalizingResult: null,
      finalizeUnavailable: null,
      actionUnavailable: {
        title: copy.common.emptyValues.noData,
        text: copy.activeAction.loading.refreshUnknownState,
      },
    },
  };
}
