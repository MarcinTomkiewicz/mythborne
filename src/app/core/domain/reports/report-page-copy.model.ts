import { ReportsCenterCopy } from './reports-center-copy.model';

export interface ReportPageCopy {
  contractVersion: 'report_page_copy_v2';
  reportsCenter: ReportsCenterCopy;
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
