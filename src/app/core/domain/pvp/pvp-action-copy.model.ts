export type GameCopyLocale = 'pl' | 'en';
export type RichTextTone = 'heading' | 'info' | 'warn' | 'success' | 'danger';

export interface PvpActionCopy {
  contractKey: 'pvp_action_copy';
  contractVersion: 'pvp_action_copy_v1';
  requestedLocale: string;
  locale: GameCopyLocale;
  fallbackLocale: 'en';
  common: PvpActionCommonCopy;
  activeAction: PvpActiveActionCopy;
  combatHandoff: PvpCombatHandoffCopy;
  eligibility: PvpActionEligibilityCopy;
}

export interface PvpActionCommonCopy {
  labels: PvpActionCommonLabelsCopy;
  richText: PvpActionCommonRichTextCopy;
  emptyValues: PvpActionCommonEmptyValuesCopy;
  actionLabels: PvpActionCommonActionLabelsCopy;
  actionTooltips: PvpActionCommonActionTooltipsCopy;
}

export interface PvpActionCommonLabelsCopy {
  combat: string;
  heroCombat: string;
  attack: string;
  attackAction: string;
  spyAction: string;
  spyProgress: string;
  scouting: string;
  siege: string;
  report: string;
  combatReport: string;
  spyReport: string;
  target: string;
  action: string;
  state: string;
  address: string;
  targetAddress: string;
  yourAddress: string;
  protection: string;
  actions: string;
  guild: string;
  level: string;
  rankPosition: string;
  remainingTime: string;
  arrivalTime: string;
  availableFrom: string;
  decisionTime: string;
  combatLog: string;
  result: string;
  battleLoot: string;
  resources: string;
  experience: string;
  glory: string;
  rank: string;
  buildings: string;
  equipment: string;
  stats: string;
  detection: string;
}

export interface PvpActionCommonRichTextCopy {
  gloryLabel: {
    text: string;
    tone: RichTextTone;
  };
}

export interface PvpActionCommonEmptyValuesCopy {
  noData: string;
  noTarget: string;
  noGuild: string;
  noAttackProtection: string;
  noValue: string;
}

export interface PvpActionCommonActionLabelsCopy {
  refresh: string;
  openReport: string;
  resolveManual: string;
  resolveAuto: string;
  enterCombat: string;
  backToVicinity: string;
  attack: string;
  spy: string;
  siege: string;
}

export interface PvpActionCommonActionTooltipsCopy {
  attack: string;
  spy: string;
  siegeUnavailable: string;
  resolveManual: string;
  resolveAuto: string;
  openReport: string;
  refresh: string;
}

export interface PvpActiveActionCopy {
  panel: PvpActiveActionPanelCopy;
  time: PvpActiveActionTimeCopy;
  phaseText: PvpActiveActionPhaseTextCopy;
  loading: PvpActiveActionLoadingCopy;
  readyStates: PvpActiveActionReadyStatesCopy;
}

export interface PvpActiveActionPanelCopy {
  defaultTitle: string;
  attackTitle: string;
  spyTitle: string;
  returnTitle: string;
  attackAriaLabel: string;
  spyAriaLabel: string;
  returnAriaLabel: string;
}

export interface PvpActiveActionTimeCopy {
  remainingTimeLabel: string;
  attackTravelLabel: string;
  spyTravelLabel: string;
  returnTravelLabel: string;
  decisionWindowLabel: string;
}

export interface PvpActiveActionPhaseTextCopy {
  attackTravel: string;
  spyTravel: string;
  attackManualWindow: string;
  attackReturn: string;
  attackResolved: string;
  spyResolved: string;
}

export interface PvpActiveActionLoadingCopy {
  refreshSpyState: string;
  refreshAttackState: string;
  refreshDecisionState: string;
  refreshReturnState: string;
  refreshUnknownState: string;
}

export interface PvpActiveActionReadyStatesCopy {
  decisionReady: string;
  targetReached: string;
  heroReturned: string;
  reportReady: string;
}

export interface PvpCombatHandoffCopy {
  header: PvpCombatHandoffHeaderCopy;
  decisionWindow: PvpCombatDecisionWindowCopy;
  emptyCombatLog: PvpCombatEmptyLogCopy;
}

export interface PvpCombatHandoffHeaderCopy {
  eyebrowCommonKey: 'common.labels.combat';
  titleCommonKey: 'common.labels.heroCombat';
  description: string;
}

export interface PvpCombatDecisionWindowCopy {
  eyebrow: string;
  title: string;
  description: string;
  decisionWindowLabelCommonKey: 'common.labels.decisionTime';
  manualActionCommonKey: 'common.actionLabels.resolveManual';
  autoActionCommonKey: 'common.actionLabels.resolveAuto';
  waitingForDecision: string;
}

export interface PvpCombatEmptyLogCopy {
  titleCommonKey: 'common.labels.combatLog';
  text: string;
}

export interface PvpActionEligibilityCopy {
  statusLabels: PvpActionEligibilityStatusLabelsCopy;
  disabledReasonTooltips: PvpActionDisabledReasonTooltipsCopy;
}

export interface PvpActionEligibilityStatusLabelsCopy {
  available: string;
  unavailable: string;
  actionUnavailable: string;
}

export interface PvpActionDisabledReasonTooltipsCopy {
  targetProtected: string;
  attackerBusy: string;
  targetLevelTooHigh: string;
  targetLevelTooLow: string;
  sameGuild: string;
  actionUnavailable: string;
  dailyAttackLimitReached: string;
  cooldownActive: string;
  siegeNotAvailable: string;
}
