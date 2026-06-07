import { Json } from '../../types/database.types';
import { KeyLabel } from '../common/key-label.model';
import {
  ReportContentKind as CanonicalReportContentKind,
  ReportDomainKey as CanonicalReportDomainKey,
} from './report-detail.model';

export interface ReportsCenterPageContextV2 {
  contractVersion: 'reports_center_page_context_v2';
  reports: ReportsCenterListRowV2[];
  selectedPreview: ReportsCenterPreviewV1 | null;
  pagination: ReportsCenterPaginationV1;
  summary: ReportsCenterSummaryV1;
  counts: ReportsCenterCountsV1;
  filters: ReportsCenterFiltersV1;
  actions: ReportsCenterActionsV1;
  capabilities: ReportsCenterCapabilitiesV1;
}

export interface ReportsCenterListRowV2 {
  contractVersion: 'reports_center_list_row_v2';
  reportId: string;
  publicToken: string;
  reportTypeKey: string;
  sourceEntityType: string;
  sourceEntityId: string;
  reportDomainKey: CanonicalReportDomainKey | string;
  contentKind: CanonicalReportContentKind | string;
  resultKind: string | null;
  source: KeyLabel;
  eventType: KeyLabel;
  title: string;
  summary: string | null;
  createdAt: string;
  reportDate: ReportsCenterReportDateV1;
  accessRole: ReportsCenterAccessRole;
  readAt: string | null;
  isUnread: boolean;
  marker: ReportsCenterMarkerV1;
  preview: ReportsCenterPreviewV1;
  visibilityPolicy: ReportsCenterVisibilityPolicyV1;
}

export interface ReportsCenterPreviewV1 {
  contractVersion: 'reports_center_preview_v1';
  reportId: string;
  title: string;
  summary: string | null;
  source: KeyLabel;
  eventType: KeyLabel;
  reportDate: ReportsCenterReportDateV1;
  outcomeStatus: ReportsCenterOutcomeStatusV1;
  opponentTarget: ReportsCenterOpponentTargetV1;
  address: ReportsCenterAddressV1;
  combat: ReportsCenterCombatPreviewV1;
  reward: ReportsCenterPreviewRewardV1;
  access: ReportsCenterAccessPreviewV1;
  publicAccess: ReportsCenterPublicAccessV1;
  marker: ReportsCenterMarkerV1;
  diagnostics: ReportsCenterPreviewDiagnosticsV1;
}

export interface ReportsCenterPaginationV1 {
  limit: number;
  offset: number;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  hasNextPage: boolean;
  displayLabel: string;
}

export interface ReportsCenterSummaryV1 {
  totalReports: ReportsCenterSummaryMetricV1;
  unreadReports: ReportsCenterSummaryMetricV1;
  latestReport: ReportsCenterLatestReportV1;
  notifications: ReportsCenterNotificationsSummaryV1;
}

export interface ReportsCenterCountsV1 {
  totalReports: number;
  unreadReports: number;
  matchingReports: number;
  matchingUnreadReports: number;
}

export interface ReportsCenterFiltersV1 {
  applied: ReportsCenterAppliedFiltersV1;
  options: ReportsCenterFilterOptionsV1;
}

export interface ReportsCenterActionsV1 {
  markAllRead: ReportsCenterMarkAllReadActionV1;
}

export interface ReportsCenterCapabilitiesV1 {
  filters: {
    search: boolean;
    eventType: boolean;
    readMode: boolean;
    timeRange: boolean;
  };
  preview: {
    rightPreview: boolean;
    usesFullReportDetail: false;
    requiresPrivateDomainRpc: false;
  };
  markAllRead: {
    supported: boolean;
  };
  primaryListPolicy: {
    hidesChildCombatReports: boolean;
  };
  notifications: {
    included: false;
    reasonKey: string;
  };
  unsupportedFilters: Json[];
}

export interface MarkAllReportsReadResultV1 {
  contractVersion: 'mark_all_reports_read_result_v1';
  heroId: string;
  requestId: string | null;
  matchingUnreadCountBefore: number;
  markedCount: number;
  remainingUnreadCount: number;
  filters: ReportsCenterAppliedFiltersV1;
}

export interface ReportsCenterReportDateV1 {
  value: string;
  displayValue: string | null;
}

export interface ReportsCenterOutcomeStatusV1 {
  key: string | null;
  label: string | null;
  tone: ReportsCenterTone;
}

export interface ReportsCenterOpponentTargetV1 {
  name: string | null;
  roleKey: string | null;
}

export interface ReportsCenterAddressV1 {
  displayValue: string | null;
  districtCode: string | null;
  addressNumber: number | null;
}

export interface ReportsCenterCombatPreviewV1 {
  combatResultId: string | null;
  turnCount: number | null;
  attackCount: number;
}

export interface ReportsCenterPreviewRewardV1 {
  summary: string | null;
  entryCount: number;
  entriesPreview: ReportsCenterPreviewRewardEntryV1[];
  resourcesSummary: string | null;
  resources: {
    summary: string | null;
    rows: ReportsCenterPreviewResourceRowV1[];
  };
}

export interface ReportsCenterPreviewRewardEntryV1 {
  kind: string | null;
  label: string | null;
  displayValue: string;
  amount: number | null;
  amountDisplay: string | null;
  resourceType: string | null;
  sourceKind: string | null;
}

export interface ReportsCenterPreviewResourceRowV1 {
  resourceType: string | null;
  label: string | null;
  displayValue: string;
  amount: number | null;
  gainAmount: number | null;
  lossAmount: number | null;
  sinkAmount: number | null;
}

export interface ReportsCenterAccessPreviewV1 {
  visibility: 'private' | string;
  accessRole: ReportsCenterAccessRole;
  isUnread: boolean;
  readAt: string | null;
}

export interface ReportsCenterPublicAccessV1 {
  hasPublicToken: boolean;
  publicToken: string | null;
  publicPath: string | null;
  privatePath: string;
}

export interface ReportsCenterMarkerV1 {
  markerKey: string;
  markerLabel: string;
  iconKey: string;
  domainKey: CanonicalReportDomainKey | string;
  eventTypeKey: string;
}

export interface ReportsCenterPreviewDiagnosticsV1 {
  previewWarnings: ReportsCenterPreviewWarning[];
  usesFullReportDetail: false;
  usesPrivateDomainRpc: false;
  legacyTitle: string | null;
  legacySummary: string | null;
}

export interface ReportsCenterPreviewWarning {
  key: string;
  message?: string;
}

export interface ReportsCenterVisibilityPolicyV1 {
  isPrimaryListEntry: boolean;
  isChildCombatReport: boolean | null;
  parentReportId: string | null;
}

export interface ReportsCenterSummaryMetricV1 {
  label: string;
  value: number;
}

export interface ReportsCenterLatestReportV1 {
  label: string;
  fallbackLabel: string;
  reportId: string | null;
  title: string | null;
  createdAt: string | null;
  publicToken: string | null;
  openActionLabel: string;
  privatePath: string | null;
}

export interface ReportsCenterNotificationsSummaryV1 {
  included: false;
  reasonKey: string;
  label: string | null;
  latestNotification: null;
}

export interface ReportsCenterAppliedFiltersV1 {
  query: string | null;
  reportAreaKey: ReportsCenterEventTypeFilterKey;
  readModeKey: ReportsCenterReadModeKey;
  timeRangeKey: ReportsCenterTimeRangeKey;
}

export interface ReportsCenterFilterOptionsV1 {
  eventTypes: ReportsCenterFilterOption[];
  readModes: ReportsCenterFilterOption[];
  timeRanges: ReportsCenterFilterOption[];
}

export interface ReportsCenterFilterOption {
  key: string;
  label: string;
  enabled: boolean;
}

export interface ReportsCenterMarkAllReadActionV1 {
  supported: boolean;
  enabled: boolean;
  matchingUnreadCount: number;
  label: string;
  disabledTooltip: string;
}

export type ReportsCenterAccessRole = 'owner' | 'participant' | 'viewer' | string;
export type ReportsCenterTone = 'positive' | 'negative' | 'neutral' | string;
export type ReportsCenterEventTypeFilterKey = string;
export type ReportsCenterReadModeKey = string;
export type ReportsCenterTimeRangeKey = string;
