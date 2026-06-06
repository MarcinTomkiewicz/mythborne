import {
  ReportCombatSection,
  ReportEffectSection,
  ReportEncounterSection,
  ReportItemReferenceRow,
  ReportMissingSection,
  ReportParticipantRow,
  ReportRelatedReportRow,
  ReportRewardSection,
  ReportSpySection,
  ReportTrialSection,
} from './report-section.model';

export interface PrivateReportDetailPage {
  contractVersion: 'report_detail_v1';
  access: {
    visibility: 'private';
    heroId: string;
    reportId: string;
    accessRole: string;
    isUnread: boolean;
    readAt: string | null;
  };
  report: ReportDetailCore;
}

export interface ReportDetailCore {
  publicToken: string | null;
  reportTypeKey: string;
  reportTypeLabel: string;
  reportTypeDescription: string | null;
  title: string;
  summary: string | null;
  sourceLabel: string | null;
  sourceEntityType: string | null;
  createdAt: string;
  participantsJson: ReportParticipantRow[];
  itemReferencesJson: ReportItemReferenceRow[];
  spySectionJson: ReportSpySection | ReportMissingSection | null;
  trialSectionJson: ReportTrialSection | ReportMissingSection | null;
  encounterSectionJson: ReportEncounterSection | ReportMissingSection | null;
  combatSectionJson: ReportCombatSection | ReportMissingSection | null;
  rewardSectionJson: ReportRewardSection | ReportMissingSection | null;
  effectSectionJson: ReportEffectSection | null;
  relatedReportsJson: ReportRelatedReportRow[];
}
