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

export function pvpCombatSourcePresentationWithKeyFallbacks(
  actionCopy: PvpActionCopy,
  combatCommonCopy: CombatCommonCopy | null,
  pvpCombatCopy: PvpCombatCopy | null,
): CombatSourcePresentation {
  if (combatCommonCopy && pvpCombatCopy) {
    return pvpCombatSourcePresentation(actionCopy, combatCommonCopy, pvpCombatCopy);
  }

  const pvpPresentation = pvpCombatCopy?.sourcePresentation ?? null;
  const workflow = pvpPresentation?.workflow ?? combatCommonCopy?.workflow ?? null;

  return {
    header: pvpPresentation?.header ?? {
      eyebrow: 'pvp.combat.sourcePresentation.header.eyebrow',
      title: 'pvp.combat.sourcePresentation.header.title',
      text: 'pvp.combat.sourcePresentation.header.text',
    },
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
    emptyLog: pvpPresentation?.emptyLog ?? {
      title: 'pvp.combat.sourcePresentation.emptyLog.title',
      text: 'pvp.combat.sourcePresentation.emptyLog.text',
    },
    emptyParticipants: combatCommonCopy?.emptyParticipants ?? {
      loading: {
        leftTitle: 'combat.common.emptyParticipants.loading.leftTitle',
        leftText: 'combat.common.emptyParticipants.loading.leftText',
        rightTitle: 'combat.common.emptyParticipants.loading.rightTitle',
        rightText: 'combat.common.emptyParticipants.loading.rightText',
      },
      unavailable: {
        leftTitle: 'combat.common.emptyParticipants.unavailable.leftTitle',
        leftText: 'combat.common.emptyParticipants.unavailable.leftText',
        rightTitle: 'combat.common.emptyParticipants.unavailable.rightTitle',
        rightText: 'combat.common.emptyParticipants.unavailable.rightText',
      },
    },
    live: {
      contextLabel: null,
      title: pvpPresentation?.live.title ?? 'pvp.combat.sourcePresentation.live.title',
      text: pvpPresentation?.live.text ?? 'pvp.combat.sourcePresentation.live.text',
      helperText: pvpPresentation?.live.helperText ?? 'pvp.combat.sourcePresentation.live.helperText',
      submittingHelperText: combatCommonCopy?.live.submittingHelperText ??
        'combat.common.live.submittingHelperText',
      preparingHelperText: combatCommonCopy?.live.preparingHelperText ??
        'combat.common.live.preparingHelperText',
      completedHelperText: combatCommonCopy?.live.completedHelperText ??
        'combat.common.live.completedHelperText',
      timingActionLabel: combatCommonCopy?.live.timingActionLabel ??
        'combat.common.live.timingActionLabel',
      meterTitle: combatCommonCopy?.live.meterTitle ?? 'combat.common.live.meterTitle',
      meterHelperText: combatCommonCopy?.live.meterHelperText ?? 'combat.common.live.meterHelperText',
      meterEarlyLabel: combatCommonCopy?.live.meterEarlyLabel ?? 'combat.common.live.meterEarlyLabel',
      meterHitZoneLabel: combatCommonCopy?.live.meterHitZoneLabel ??
        'combat.common.live.meterHitZoneLabel',
      meterLateLabel: combatCommonCopy?.live.meterLateLabel ?? 'combat.common.live.meterLateLabel',
    },
    workflow: {
      finalizingResult: workflow?.finalizingResult ?? {
        title: 'combat.common.workflow.finalizingResult.title',
        text: 'combat.common.workflow.finalizingResult.text',
      },
      finalizeUnavailable: workflow?.finalizeUnavailable ?? {
        title: 'combat.common.workflow.finalizeUnavailable.title',
        text: 'combat.common.workflow.finalizeUnavailable.text',
      },
      actionUnavailable: workflow?.actionUnavailable ?? {
        title: 'combat.common.workflow.actionUnavailable.title',
        text: 'combat.common.workflow.actionUnavailable.text',
      },
    },
  };
}
