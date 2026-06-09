export interface ReportsCenterCopy {
  header: ReportsCenterHeaderCopy;
  summary: ReportsCenterSummaryCopy;
  filters: ReportsCenterFiltersCopy;
  filterOptions: ReportsCenterFilterOptionsCopy;
  eventTypes: ReportsCenterEventTypeCopyBundle;
  list: ReportsCenterListCopy;
  preview: ReportsCenterPreviewCopy;
  actions: ReportsCenterActionsCopy;
}

export interface ReportsCenterHeaderCopy {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface ReportsCenterSummaryCopy {
  totalReportsLabel: string;
  unreadReportsLabel: string;
  latestReportLabel: string;
  latestReportFallback: string;
  openLatestReportAction: string;
}

export interface ReportsCenterFiltersCopy {
  title: string;
  helperText: string;
  searchLabel: string;
  searchPlaceholder: string;
  eventTypeLabel: string;
  readModeLabel: string;
  timeRangeLabel: string;
  reportTypeLabel: string;
  unreadOnlyLabel: string;
  allTypesLabel: string;
}

export interface ReportsCenterFilterOptionsCopy {
  eventTypes: Record<string, string>;
  readModes: Record<string, string>;
  timeRanges: Record<string, string>;
}

export interface ReportsCenterEventTypeCopyBundle {
  contractVersion: 'reports_center_event_type_copy_v1';
  policy: string;
  keys: string[];
  byKey: Record<string, ReportsCenterEventTypeCopy>;
}

export interface ReportsCenterEventTypeCopy {
  label: string;
  tone: 'success' | 'danger' | 'warn' | 'info' | 'neutral';
  iconKey: string;
}

export interface ReportsCenterListCopy {
  title: string;
  emptyTitle: string;
  emptyText: string;
  openAction: string;
  removeAction: string;
  markReadAction: string;
  unreadLabel: string;
  readLabel: string;
  unreadCountTemplate: string;
  rangeTemplate: string;
}

export interface ReportsCenterPreviewCopy {
  emptyTitle: string;
  emptyText: string;
  titleFallback: string;
  sourceLabel: string;
  eventTypeLabel: string;
  reportDateLabel: string;
  accessLabel: string;
  rewardLabel: string;
  resourcesLabel: string;
  turnCountLabel: string;
  opponentTargetLabel: string;
  addressLabel: string;
  openAction: string;
  copyLinkAction: string;
  copyLinkShortAction: string;
}

export interface ReportsCenterActionsCopy {
  markAllRead: ReportsCenterMarkAllReadActionCopy;
  selectAllVisible: ReportsCenterSimpleActionCopy;
  clearSelection: ReportsCenterSimpleActionCopy;
  markSelectedRead: ReportsCenterBulkActionCopy;
  deleteSelected: ReportsCenterBulkActionCopy;
  markOneRead: ReportsCenterRowActionCopy;
  deleteOne: ReportsCenterDeleteOneActionCopy;
  selectReportRow: ReportsCenterSelectReportRowActionCopy;
}

export interface ReportsCenterMarkAllReadActionCopy {
  label: string;
  disabledTooltip: string;
  confirmTitle: string;
  confirmText: string;
  successText: string;
}

export interface ReportsCenterSimpleActionCopy {
  label: string;
  ariaLabel: string;
  tooltip: string;
}

export interface ReportsCenterBulkActionCopy {
  label: string;
  ariaLabel: string;
  confirmTitle: string;
  confirmText: string;
  successText: string;
  disabledTooltip: string;
}

export interface ReportsCenterRowActionCopy {
  label: string;
  ariaLabel: string;
  tooltip: string;
  successText: string;
}

export interface ReportsCenterDeleteOneActionCopy extends ReportsCenterRowActionCopy {
  confirmTitle: string;
  confirmText: string;
}

export interface ReportsCenterSelectReportRowActionCopy {
  ariaLabelTemplate: string;
  selectedAriaLabelTemplate: string;
  fallbackAriaLabel: string;
  selectedFallbackAriaLabel: string;
}

export function reportsCenterEventTypeCopyByKey(
  eventTypes: ReportsCenterEventTypeCopyBundle,
  key: string,
): ReportsCenterEventTypeCopy {
  const copy = eventTypes.byKey[key];

  if (!copy) {
    throw new Error(`reportsCenter.eventTypes.byKey.${key} is missing.`);
  }

  return copy;
}
