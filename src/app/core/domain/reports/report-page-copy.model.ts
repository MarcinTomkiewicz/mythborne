export interface ReportPageCopy {
  contractVersion: 'report_page_copy_v1';
  reportsCenter: {
    header: {
      eyebrow: string;
      title: string;
      intro: string;
    };
    filters: {
      title: string;
      helperText: string;
      reportTypeLabel: string;
      unreadOnlyLabel: string;
      searchLabel: string;
      searchPlaceholder: string;
      allTypesLabel: string;
    };
    list: {
      title: string;
      emptyTitle: string;
      emptyText: string;
      unreadLabel: string;
      readLabel: string;
      openAction: string;
      removeAction: string;
    };
  };
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
