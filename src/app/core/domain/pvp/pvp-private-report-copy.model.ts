import type { RichTextFragment } from '../rich-text/rich-text.model';

export type PvpPrivateReportLocale = 'pl' | 'en';
export type PvpPrivateReportKind = 'attack' | 'spy';
export type PvpPrivateAttackOutcomeKey =
  'attacker_victory' | 'defender_victory' | 'draw' | string;
export type PvpPrivateSpyOutcomeKey =
  'success_undetected' | 'success_detected' | 'failure_undetected' | 'failure_detected' | string;
export type PvpPrivateAttackViewerRole = 'attacker' | 'defender' | 'viewer';
export type PvpPrivateSpyViewerRole = 'spy_owner' | 'target' | 'viewer';
export type PvpPrivateViewerRole =
  | PvpPrivateAttackViewerRole
  | PvpPrivateSpyViewerRole;

export type PvpPrivateReportCopy =
  | PvpPrivateAttackReportAvailableCopy
  | PvpPrivateSpyReportAvailableCopy;

export interface PvpPrivateReportCopyBase {
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';
  requestedLocale: string;
  locale: PvpPrivateReportLocale;
  fallbackLocale: 'en';
  visibility: 'private';
  reportId: string;
  publicToken: string | null;
  reportKind: PvpPrivateReportKind;
  access: PvpPrivateReportAccessCopy;
  shell: PvpPrivateReportShellCopy;
  sections: PvpPrivateReportSectionsCopy;
}

export interface PvpPrivateAttackReportAvailableCopy extends PvpPrivateReportCopyBase {
  reportKind: 'attack';
  access: PvpPrivateAttackReportAccessCopy;
  sections: PvpPrivateAttackReportSectionsCopy;
  attackReport: PvpPrivateAttackReportCopy;
  spyReport: null;
}

export interface PvpPrivateSpyReportAvailableCopy extends PvpPrivateReportCopyBase {
  reportKind: 'spy';
  access: PvpPrivateSpyReportAccessCopy;
  sections: PvpPrivateSpyReportSectionsCopy;
  attackReport: null;
  spyReport: PvpPrivateSpyReportCopy;
}

export type PvpPrivateReportAccessCopy =
  | PvpPrivateAttackReportAccessCopy
  | PvpPrivateSpyReportAccessCopy;

export interface PvpPrivateAttackReportAccessCopy {
  heroId: string;
  accessRole: string;
  viewerRole: PvpPrivateAttackViewerRole;
}

export interface PvpPrivateSpyReportAccessCopy {
  heroId: string;
  accessRole: string;
  viewerRole: PvpPrivateSpyViewerRole;
}

export interface PvpPrivateReportShellCopy {
  eyebrow: string;
  sourceLabel: string;
  eventTypeLabel: string;
  title: string;
  summary: string;
}

export interface PvpPrivateReportSectionsCopy {
  result: string;
}

export interface PvpPrivateAttackReportSectionsCopy extends PvpPrivateReportSectionsCopy {
  battleLoot: string;
  resources: string;
  experience: string;
  glory: string;
  combat: string;
}

export interface PvpPrivateSpyReportSectionsCopy extends PvpPrivateReportSectionsCopy {
  spy: string;
  resources: string;
  buildings: string;
  equipment: string;
  stats: string;
  detection: string;
}

export interface PvpPrivateAttackReportCopy {
  outcomeKey: PvpPrivateAttackOutcomeKey;
  viewerRole: PvpPrivateAttackViewerRole;
  result: PvpPrivateAttackResultCopy;
  experience: PvpPrivateExperienceCopy;
  resources: PvpPrivateResourcesCopy;
  glory: PvpPrivateGloryCopy;
}

export interface PvpPrivateAttackResultCopy {
  title: string;
  narrativePlainText: string;
}

export interface PvpPrivateExperienceCopy {
  rows: PvpPrivateExperienceRow[];
  lines: PvpPrivateExperienceLine[];
}

export interface PvpPrivateExperienceRow {
  recipientHeroId: string;
  amount: number;
  label: string;
  displayValue: string;
}

export interface PvpPrivateExperienceLine {
  key: 'ownExperience' | 'opponentExperience' | string;
  recipient: 'viewer' | 'opponent' | string;
  amount: number;
  text: string;
}

export interface PvpPrivateResourcesCopy {
  line: string;
  gainRows: PvpPrivateResourceRow[];
  lossRows: PvpPrivateResourceRow[];
}

export interface PvpPrivateResourceRow {
  key: string;
  resourceType: string;
  label: string;
  amount: number;
  displayValue: string;
}

export interface PvpPrivateGloryCopy {
  variantKey: 'majorGain' | 'minorGain' | 'noChange' | 'minorLoss' | 'majorLoss' | 'unavailable';
  linePlainText: string;
  lineRichText: RichTextFragment[];
}

export interface PvpPrivateSpyReportCopy {
  outcomeKey: PvpPrivateSpyOutcomeKey;
  viewerRole: PvpPrivateSpyViewerRole;
  success: boolean;
  detected: boolean;
  result: PvpPrivateSpyResultCopy;
  emptyStates: PvpPrivateSpyEmptyStatesCopy;
}

export interface PvpPrivateSpyResultCopy {
  title: string;
  summary: string;
}

export interface PvpPrivateSpyEmptyStatesCopy {
  noResources: string;
  noBuildings: string;
  noEquipment: string;
  noVisibleData: string;
}
