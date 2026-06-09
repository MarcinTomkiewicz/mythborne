import { ReportPageCopy } from '../domain/reports/report-page-copy.model';
import { Json } from '../types/database.types';
import { JsonRecord, read, requiredRecord, requiredText } from './json-read';
import { mapReportsCenterCopy } from './reports-center-copy.mapper';

export function mapReportPageCopy(value: Json): ReportPageCopy {
  const root = requiredRecord(value, 'get_report_page_copy');

  return {
    contractVersion: requireReportPageCopyVersion(root),
    locale: requiredText(read(root, 'locale'), 'get_report_page_copy.locale'),
    requestedLocale: requiredText(
      read(root, 'requestedLocale'),
      'get_report_page_copy.requestedLocale',
    ),
    fallbackLocale: requireReportPageCopyFallbackLocale(root),
    copyStorage: requireReportPageCopyStorage(root),
    reportsCopyPatchVersion: requiredText(
      read(root, 'reportsCopyPatchVersion'),
      'get_report_page_copy.reportsCopyPatchVersion',
    ),
    reportsCenter: mapReportsCenterCopy(
      requiredRecord(read(root, 'reportsCenter'), 'get_report_page_copy.reportsCenter'),
    ),
    reportShell: mapReportShell(
      requiredRecord(read(root, 'reportShell'), 'get_report_page_copy.reportShell'),
    ),
  };
}

function requireReportPageCopyVersion(root: JsonRecord): 'report_page_copy_v3' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_report_page_copy.contractVersion',
  );

  if (version !== 'report_page_copy_v3') {
    throw new Error(`get_report_page_copy has unsupported contract version: ${version}.`);
  }

  return version;
}

function requireReportPageCopyFallbackLocale(root: JsonRecord): 'en' {
  const fallbackLocale = requiredText(
    read(root, 'fallbackLocale'),
    'get_report_page_copy.fallbackLocale',
  );

  if (fallbackLocale !== 'en') {
    throw new Error(`get_report_page_copy has unsupported fallback locale: ${fallbackLocale}.`);
  }

  return fallbackLocale;
}

function requireReportPageCopyStorage(root: JsonRecord): 'report_page_copy_bundles' {
  const copyStorage = requiredText(
    read(root, 'copyStorage'),
    'get_report_page_copy.copyStorage',
  );

  if (copyStorage !== 'report_page_copy_bundles') {
    throw new Error(`get_report_page_copy has unsupported copy storage: ${copyStorage}.`);
  }

  return copyStorage;
}

function mapReportShell(shell: JsonRecord): ReportPageCopy['reportShell'] {
  const header = requiredRecord(read(shell, 'header'), 'reportShell.header');
  const meta = requiredRecord(read(shell, 'meta'), 'reportShell.meta');
  const publicCopy = requiredRecord(read(shell, 'public'), 'reportShell.public');
  const feedback = requiredRecord(read(shell, 'feedback'), 'reportShell.feedback');

  return {
    header: {
      titleFallback: requiredText(read(header, 'titleFallback'), 'reportShell.header.titleFallback'),
      backAction: requiredText(read(header, 'backAction'), 'reportShell.header.backAction'),
      copyLinkAction: requiredText(read(header, 'copyLinkAction'), 'reportShell.header.copyLinkAction'),
      openFullReportAction: requiredText(
        read(header, 'openFullReportAction'),
        'reportShell.header.openFullReportAction',
      ),
      removeAction: requiredText(read(header, 'removeAction'), 'reportShell.header.removeAction'),
    },
    meta: {
      sourceLabel: requiredText(read(meta, 'sourceLabel'), 'reportShell.meta.sourceLabel'),
      eventTypeLabel: requiredText(read(meta, 'eventTypeLabel'), 'reportShell.meta.eventTypeLabel'),
      reportDateLabel: requiredText(read(meta, 'reportDateLabel'), 'reportShell.meta.reportDateLabel'),
    },
    public: {
      titleFallback: requiredText(read(publicCopy, 'titleFallback'), 'reportShell.public.titleFallback'),
      notFoundTitle: requiredText(read(publicCopy, 'notFoundTitle'), 'reportShell.public.notFoundTitle'),
      notFoundText: requiredText(read(publicCopy, 'notFoundText'), 'reportShell.public.notFoundText'),
    },
    feedback: {
      copyLinkSuccess: requiredText(read(feedback, 'copyLinkSuccess'), 'reportShell.feedback.copyLinkSuccess'),
      removeSuccess: requiredText(read(feedback, 'removeSuccess'), 'reportShell.feedback.removeSuccess'),
      markReadSuccess: requiredText(read(feedback, 'markReadSuccess'), 'reportShell.feedback.markReadSuccess'),
    },
  };
}
