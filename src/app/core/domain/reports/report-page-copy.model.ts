export interface ReportPageCopy {
  contractVersion: 'report_page_copy_v2';
  reportsCenter: ReportsCenterCopyV2;
  reportShell: ReportShellCopyV2;
  detail: {
    header: {
      titleFallback: string;
      backAction: string;
      shareAction: string;
      markReadAction: string;
      removeAction: string;
    };
    sections: {
      participants: string;
      itemReferences: string;
      spy: string;
      trial: string;
      encounter: string;
      combat: string;
      rewards: string;
      effects: string;
      relatedReports: string;
    };
    empty: {
      participants: string;
      itemReferences: string;
      rewards: string;
      relatedReports: string;
    };
  };
  publicReport: {
    header: {
      titleFallback: string;
      notFoundTitle: string;
      notFoundText: string;
    };
    privacy: {
      publicBoundaryText: string;
    };
  };
  labels: {
    createdAt: string;
    reportType: string;
    source: string;
    participants: string;
    rewards: string;
    status: string;
    publicLink: string;
    readState: string;
  };
  pagination: {
    rangeTemplate: string;
  };
}

export interface ReportsCenterCopyV2 {
  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  summary: {
    totalReportsLabel: string;
    unreadReportsLabel: string;
    latestReportLabel: string;
    latestReportFallback: string;
    openLatestReportAction: string;
  };
  filters: {
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
  };
  filterOptions: {
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
  };
  list: {
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
  };
  preview: {
    emptyTitle: string;
    emptyText: string;
    titleFallback: string;
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
    rewardLabel: string;
    openAction: string;
    copyLinkAction: string;
  };
  actions: {
    markAllRead: {
      label: string;
      disabledTooltip: string;
      confirmTitle: string;
      confirmText: string;
      successText: string;
    };
  };
}

export interface ReportShellCopyV2 {
  header: {
    titleFallback: string;
    backAction: string;
    copyLinkAction: string;
    removeAction: string;
  };
  meta: {
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
  };
  public: {
    titleFallback: string;
    notFoundTitle: string;
    notFoundText: string;
  };
  feedback: {
    copyLinkSuccess: string;
    removeSuccess: string;
    markReadSuccess: string;
  };
}
