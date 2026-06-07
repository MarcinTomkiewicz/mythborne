export interface ReportsCenterCopy {
  header: ReportsCenterHeaderCopy;
  summary: ReportsCenterSummaryCopy;
  filters: ReportsCenterFiltersCopy;
  filterOptions: ReportsCenterFilterOptionsCopy;
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
  eventTypes: {
    all: string;
    exploration: string;
    combat: string;
    spy: string;
    trade: string;
    auction: string;
    siege: string;
  };
  readModes: {
    unreadFirst: string;
    all: string;
    unreadOnly: string;
    readOnly: string;
  };
  timeRanges: {
    last7Days: string;
    last30Days: string;
    allTime: string;
  };
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
  rewardLabel: string;
  openAction: string;
  copyLinkAction: string;
}

export interface ReportsCenterActionsCopy {
  markAllRead: {
    label: string;
    disabledTooltip: string;
    confirmTitle: string;
    confirmText: string;
    successText: string;
  };
}
