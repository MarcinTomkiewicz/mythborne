import { Json } from '../../types/database.types';
import { KeyLabel } from '../common/key-label.model';
import {
  ReportContentKind as CanonicalReportContentKind,
  ReportDomainKey as CanonicalReportDomainKey,
} from './report-detail.model';

export interface ReportsCenterPageContext {
  contractVersion: 'reports_center_page_context_v3';
  eventTypeContract: ReportsCenterEventTypeContract;
  reports: ReportsCenterListRow[];
  selectedPreview: ReportsCenterPreview | null;
  pagination: ReportsCenterPagination;
  summary: ReportsCenterSummary;
  counts: ReportsCenterCounts;
  filters: ReportsCenterFilters;
  actions: ReportsCenterActions;
  capabilities: ReportsCenterCapabilities;
}

export interface ReportsCenterEventTypeContract {
  canonicalPath: 'reports[].eventType.key';
  removedDuplicatePaths: [
    'reports[].preview.eventType',
    'reports[].marker.eventTypeKey',
  ];
  copyPath: 'get_report_page_copy(locale).reportsCenter.eventTypes.byKey[eventType.key]';
  fallbackPolicy: string;
  policy: string;
}

export interface ReportsCenterListRow {
  contractVersion: 'reports_center_list_row_v2' | string;
  reportId: string;
  publicToken: string | null;
  reportTypeKey: string;
  sourceEntityType: string;
  sourceEntityId: string;
  reportDomainKey: CanonicalReportDomainKey | string;
  contentKind: CanonicalReportContentKind | string;
  resultKind: string | null;
  source: KeyLabel;
  eventType: ReportsCenterEventTypeMachine;
  title: string;
  summary: string | null;
  createdAt: string;
  reportDate: ReportsCenterReportDate;
  accessRole: ReportsCenterAccessRole;
  readAt: string | null;
  isUnread: boolean;
  marker: ReportsCenterMarker;
  preview: ReportsCenterPreview;
  visibilityPolicy: ReportsCenterVisibilityPolicy;
}

export interface ReportsCenterEventTypeMachine {
  key: string;
  label: string | null;
  tone: string | null;
  iconKey: string | null;
}

export interface ReportsCenterPreview {
  contractVersion: 'reports_center_preview_v1';
  reportId: string;
  title: string;
  summary: string | null;
  source: KeyLabel;
  reportDate: ReportsCenterReportDate;
  outcomeStatus: ReportsCenterOutcomeStatus;
  opponentTarget: ReportsCenterOpponentTarget;
  address: ReportsCenterAddress;
  combat: ReportsCenterCombatPreview;
  reward: ReportsCenterRewardPreview;
  access: ReportsCenterAccessPreview;
  publicAccess: ReportsCenterPublicAccess;
  marker: ReportsCenterMarker;
  diagnostics: ReportsCenterPreviewDiagnostics;
}

export interface ReportsCenterPagination {
  limit: number;
  offset: number;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  hasNextPage: boolean;
  displayLabel: string;
}

export interface ReportsCenterSummary {
  totalReports: ReportsCenterSummaryMetric;
  unreadReports: ReportsCenterSummaryMetric;
  latestReport: ReportsCenterLatestReport;
  notifications: ReportsCenterNotificationsSummary;
}

export interface ReportsCenterCounts {
  totalReports: number;
  unreadReports: number;
  matchingReports: number;
  matchingUnreadReports: number;
}

export interface ReportsCenterFilters {
  applied: ReportsCenterAppliedFilters;
  options: ReportsCenterFilterOptions;
}

export interface ReportsCenterActions {
  markAllRead: ReportsCenterMarkAllReadAction;
}

export interface ReportsCenterCapabilities {
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

export interface MarkAllReportsReadResult {
  contractVersion: 'mark_all_reports_read_result_v1';
  heroId: string;
  requestId: string | null;
  matchingUnreadCountBefore: number;
  markedCount: number;
  remainingUnreadCount: number;
  filters: ReportsCenterAppliedFilters;
}

export interface ReportsCenterReportDate {
  value: string;
  displayValue: string | null;
}

export interface ReportsCenterOutcomeStatus {
  key: string | null;
  label: string | null;
  tone: ReportsCenterTone;
}

export interface ReportsCenterOpponentTarget {
  name: string | null;
  roleKey: string | null;
}

export interface ReportsCenterAddress {
  displayValue: string | null;
  districtCode: string | null;
  addressNumber: number | null;
}

export interface ReportsCenterCombatPreview {
  combatResultId: string | null;
  turnCount: number | null;
  attackCount: number;
}

export interface ReportsCenterRewardPreview {
  summary: string | null;
  entryCount: number;
  resourcesSummary: string | null;
}

export interface ReportsCenterAccessPreview {
  visibility: 'private' | string;
  accessRole: ReportsCenterAccessRole;
  isUnread: boolean;
  readAt: string | null;
}

export interface ReportsCenterPublicAccess {
  hasPublicToken: boolean;
  publicToken: string | null;
  publicPath: string | null;
  privatePath: string;
}

export interface ReportsCenterMarker {
  markerKey: string;
  markerLabel: string;
  iconKey: string;
  domainKey: CanonicalReportDomainKey | string;
}

export interface ReportsCenterPreviewDiagnostics {
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

export interface ReportsCenterVisibilityPolicy {
  isPrimaryListEntry: boolean;
  isChildCombatReport: boolean | null;
  parentReportId: string | null;
}

export interface ReportsCenterSummaryMetric {
  label: string;
  value: number;
}

export interface ReportsCenterLatestReport {
  label: string;
  fallbackLabel: string;
  reportId: string | null;
  title: string | null;
  createdAt: string | null;
  publicToken: string | null;
  openActionLabel: string;
  privatePath: string | null;
}

export interface ReportsCenterNotificationsSummary {
  included: false;
  reasonKey: string;
  label: string | null;
  latestNotification: null;
}

export interface ReportsCenterAppliedFilters {
  query: string | null;
  reportAreaKey: ReportsCenterEventTypeFilterKey;
  readModeKey: ReportsCenterReadModeKey;
  timeRangeKey: ReportsCenterTimeRangeKey;
}

export interface ReportsCenterFilterOptions {
  eventTypes: ReportsCenterFilterOption[];
  readModes: ReportsCenterFilterOption[];
  timeRanges: ReportsCenterFilterOption[];
}

export interface ReportsCenterFilterOption {
  key: string;
  label: string;
  enabled: boolean;
}

export interface ReportsCenterMarkAllReadAction {
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
