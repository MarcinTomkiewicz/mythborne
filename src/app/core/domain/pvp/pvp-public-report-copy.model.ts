export type PvpPublicReportLocale = 'pl' | 'en';
export type PvpPublicReportKind = 'attack' | 'spy';
export type PvpPublicReportKindOrUnavailable = PvpPublicReportKind | null;
export type PvpPublicViewerRole = 'viewer';
export type PvpPublicSpyOutcomeKey =
  | 'success_undetected'
  | 'success_detected'
  | 'failure_undetected'
  | 'failure_detected';

export interface PvpPublicReportCopy {
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';
  requestedLocale: string;
  locale: PvpPublicReportLocale;
  fallbackLocale: 'en';
  visibility: 'public';
  reportId: null;
  publicToken: string | null;
  reportKind: PvpPublicReportKindOrUnavailable;
  access: PvpPublicReportAccessCopy;
  shell: PvpPublicReportShellCopy | null;
  sections: PvpPublicReportSectionsCopy;
  attackReport: null;
  spyReport: PvpPublicSpyReportCopy | null;
}

export type PvpPublicReportAvailableCopy =
  | PvpPublicAttackReportAvailableCopy
  | PvpPublicSpyReportAvailableCopy;

export interface PvpPublicAttackReportAvailableCopy extends PvpPublicReportCopy {
  publicToken: string;
  reportKind: 'attack';
  access: PvpPublicReportAvailableAccessCopy;
  shell: PvpPublicReportShellCopy;
  attackReport: null;
  spyReport: null;
}

export interface PvpPublicSpyReportAvailableCopy extends PvpPublicReportCopy {
  publicToken: string;
  reportKind: 'spy';
  access: PvpPublicReportAvailableAccessCopy;
  shell: PvpPublicReportShellCopy;
  attackReport: null;
  spyReport: PvpPublicSpyReportCopy;
}

export interface PvpPublicReportUnavailableCopy extends PvpPublicReportCopy {
  reportKind: null;
  access: PvpPublicReportUnavailableAccessCopy;
  shell: null;
  attackReport: null;
  spyReport: null;
}

export type PvpPublicReportAccessCopy =
  | PvpPublicReportAvailableAccessCopy
  | PvpPublicReportUnavailableAccessCopy;

export interface PvpPublicReportAvailableAccessCopy {
  viewerRole: PvpPublicViewerRole;
  isAvailable: true;
}

export interface PvpPublicReportUnavailableAccessCopy {
  viewerRole: PvpPublicViewerRole;
  isAvailable: false;
  notFoundKey: 'public_report_not_found' | 'public_pvp_report_unsupported';
  notFoundLabel: string;
}

export interface PvpPublicReportShellCopy {
  eyebrow: string;
  title: string;
  summary: string;
  createdAt: string;
  publicToken: string;
  reportTypeLabel: string;
  sourceLabel: string;
  visibilityLabel: string;
  participants: PvpPublicReportParticipantCopy[];
}

export interface PvpPublicReportParticipantCopy {
  participantRole: string;
  sideLabel: string | null;
  displayName: string;
  levelSnapshot: number | null;
  sortOrder: number;
}

export interface PvpPublicReportSectionsCopy {
  result: PvpPublicReportBasicSectionCopy;
  combat: PvpPublicReportBasicSectionCopy;
  participants: PvpPublicReportBasicSectionCopy;
  spy: PvpPublicReportBasicSectionCopy;
  resources: PvpPublicReportPrivateOmittedSectionCopy;
  experience: PvpPublicReportPrivateOmittedSectionCopy;
  publicNotice: PvpPublicReportNoticeSectionCopy;
  notFound: PvpPublicReportNoticeSectionCopy;
}

export interface PvpPublicReportBasicSectionCopy {
  label: string;
  emptyLabel: string;
}

export interface PvpPublicReportPrivateOmittedSectionCopy {
  label: string;
  privateOmittedLabel: string;
}

export interface PvpPublicReportNoticeSectionCopy {
  title: string;
  text: string;
}

export interface PvpPublicSpyReportCopy {
  reportKind: 'spy';
  viewerRole: PvpPublicViewerRole;
  outcomeKey: PvpPublicSpyOutcomeKey;
  title: string;
  summary: string;
  emptyStates: PvpPublicSpyEmptyStatesCopy;
  privateDetailsOmitted: true;
  privateDetailsOmittedLabel: string;
}

export interface PvpPublicSpyEmptyStatesCopy {
  noBuildings: string;
  noEquipment: string;
  noResources: string;
  noVisibleData: string;
}
