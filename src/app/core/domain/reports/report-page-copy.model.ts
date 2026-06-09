import { ReportsCenterCopy } from './reports-center-copy.model';

export interface ReportPageCopy {
  contractVersion: 'report_page_copy_v3';
  locale: string;
  requestedLocale: string;
  fallbackLocale: 'en';
  copyStorage: 'report_page_copy_bundles';
  reportsCopyPatchVersion: string;
  reportsCenter: ReportsCenterCopy;
  reportShell: ReportShellCopy;
}

export interface ReportShellCopy {
  header: {
    titleFallback: string;
    backAction: string;
    copyLinkAction: string;
    openFullReportAction: string;
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
