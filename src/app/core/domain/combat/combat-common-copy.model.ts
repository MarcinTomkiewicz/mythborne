export type CombatCommonCopyLocale = 'pl' | 'en';

export interface CombatCommonCopy {
  contractKey: 'combat_common_copy';
  contractVersion: 'combat_common_copy_v1';
  gameCopyKind: 'player.combat.common';
  requestedLocale: string;
  locale: CombatCommonCopyLocale;
  fallbackLocale: 'en';
  live: CombatCommonLiveCopy;
  emptyLog: CombatCommonMessageCopy;
  emptyParticipants: CombatCommonEmptyParticipantsCopy;
  workflow: CombatCommonWorkflowCopy;
}

export interface CombatCommonLiveCopy {
  helperText: string;
  submittingHelperText: string;
  preparingHelperText: string;
  completedHelperText: string;
  timingActionLabel: string;
  meterTitle: string;
  meterHelperText: string;
  meterEarlyLabel: string;
  meterHitZoneLabel: string;
  meterLateLabel: string;
}

export interface CombatCommonMessageCopy {
  title: string;
  text: string;
}

export interface CombatCommonEmptyParticipantsCopy {
  loading: CombatCommonParticipantPlaceholderCopy;
  unavailable: CombatCommonParticipantPlaceholderCopy;
}

export interface CombatCommonParticipantPlaceholderCopy {
  leftTitle: string;
  leftText: string;
  rightTitle: string;
  rightText: string;
}

export interface CombatCommonWorkflowCopy {
  finalizingResult: CombatCommonMessageCopy;
  finalizeUnavailable: CombatCommonMessageCopy;
  actionUnavailable: CombatCommonMessageCopy;
}
