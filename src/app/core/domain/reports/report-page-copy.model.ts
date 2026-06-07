import { ReportsCenterCopy } from './reports-center-copy.model';

export interface ReportPageCopy {
  contractVersion: 'report_page_copy_v2';
  reportsCenter: ReportsCenterCopy;
  reportShell: ReportShellCopyV2;
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
