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

export type ReportDomainKey =
  | 'exploration'
  | 'pvp'
  | 'spy'
  | 'combat'
  | 'trade'
  | 'auction'
  | 'siege'
  | 'argonautics'
  | 'unknown';

export type ReportContentKind =
  | 'exploration_trial'
  | 'exploration_encounter'
  | 'exploration_combat_encounter'
  | 'exploration_challenge'
  | 'exploration_step'
  | 'pvp_combat'
  | 'pvp_spy'
  | 'combat'
  | 'trade'
  | 'auction'
  | 'siege'
  | 'argonautics'
  | 'unknown';

export type MissingContextReason =
  | 'report_id_required'
  | 'report_not_found'
  | 'pvp_spy_result_not_found'
  | 'pvp_attack_result_not_found'
  | 'exploration_source_context_not_found'
  | 'combat_result_not_found'
  | 'unsupported_report_domain'
  | string;

export interface ReportDomainFrontendUsage {
  contentAccessMode: 'private_source_context' | 'report_snapshot_only';
  canUsePrivateDomainReads: boolean;
  shouldRenderFromReportSnapshot: boolean;
  sourceIdsRedacted: boolean;
}

export interface ExplorationReportDomainContext {
  explorationId: string | null;
  challengeAttemptId: string | null;
  stepId: string | null;
  combatResultId: string | null;
  rewardSourceKind: 'challenge_attempt' | 'step' | null;
  challengeKind: string | null;
  challengeStatus: string | null;
  challengeSuccess: boolean | null;
  completionMode: string | null;
  stepOutcomeKind: string | null;
}

export interface PvpReportDomainContext {
  pvpActionId: string | null;
  pvpAttackResultId: string | null;
  combatResultId: string | null;
  sourceKind: 'pvp_attack' | 'pvp_spy' | null;
  outcomeKey: string | null;
}

export interface SpyReportDomainContext {
  pvpSpyResultId: string | null;
  pvpActionId: string | null;
  outcomeKey: string | null;
  success: boolean | null;
  detected: boolean | null;
}

export interface CombatReportDomainContext {
  combatResultId: string | null;
  sourceType: string | null;
  sourceEntityId: string | null;
  parentReportId: string | null;
  parentPublicToken: string | null;
  isChildCombatReport: boolean;
}

export interface ReportDomainContextV1 {
  contractVersion: 'report_domain_context_v1';
  reportDomainKey: ReportDomainKey;
  contentKind: ReportContentKind;
  resultKind: string | null;
  gameReportId: string | null;
  publicToken: string | null;
  reportTypeKey: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  frontendUsage: ReportDomainFrontendUsage;
  exploration: ExplorationReportDomainContext | null;
  pvp: PvpReportDomainContext | null;
  spy: SpyReportDomainContext | null;
  combat: CombatReportDomainContext | null;
  missingContextReason: MissingContextReason | null;
}

export interface ReportAccessPrivate {
  visibility: 'private';
  heroId: string;
  reportId: string;
  accessRole: 'owner' | 'participant' | 'viewer' | string;
  isUnread: boolean;
  readAt: string | null;
}

export interface ReportAccessPublicAvailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string;
  isAvailable: true;
}

export interface ReportAccessPublicUnavailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string | null;
  isAvailable: false;
  notFoundKey: 'public_report_not_found';
  notFoundLabel: string;
}

export interface PrivateReportDetailPage {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPrivate;
  domainContextJson: ReportDomainContextV1;
  report: ReportContentSnapshotV1;
}

export interface PublicReportDetailV2Available {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicAvailable;
  domainContextJson: ReportDomainContextV1;
  report: ReportContentSnapshotV1;
}

export interface PublicReportDetailV2Unavailable {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicUnavailable;
  domainContextJson: null;
  report: null;
}

export type PublicReportDetailV2 =
  | PublicReportDetailV2Available
  | PublicReportDetailV2Unavailable;

export type ReportDetailV2 = PrivateReportDetailPage | PublicReportDetailV2Available;

export interface ReportContentSnapshotV1 {
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

export type ReportDetailCore = ReportContentSnapshotV1;
