import { ReportPageCopy } from '../domain/reports/report-page-copy.model';
import { Json } from '../types/database.types';
import { JsonRecord, read, requiredRecord, requiredText } from './json-read';
import { mapReportsCenterCopy } from './reports-center-copy.mapper';

export function mapReportPageCopy(value: Json): ReportPageCopy {
  const root = requiredRecord(value, 'get_report_page_copy');

  return {
    contractVersion: requireReportPageCopyVersion(root),
    reportsCenter: mapReportsCenterCopy(
      requiredRecord(read(root, 'reportsCenter'), 'get_report_page_copy.reportsCenter'),
    ),
    reportShell: mapReportShell(
      requiredRecord(read(root, 'reportShell'), 'get_report_page_copy.reportShell'),
    ),
    detail: mapDetail(requiredRecord(read(root, 'detail'), 'get_report_page_copy.detail')),
    publicReport: mapPublicReport(
      requiredRecord(read(root, 'publicReport'), 'get_report_page_copy.publicReport'),
    ),
    labels: mapLabels(requiredRecord(read(root, 'labels'), 'get_report_page_copy.labels')),
    pagination: mapPaginationCopy(
      requiredRecord(read(root, 'pagination'), 'get_report_page_copy.pagination'),
    ),
  };
}

function requireReportPageCopyVersion(root: JsonRecord): 'report_page_copy_v2' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_report_page_copy.contractVersion',
  );

  if (version !== 'report_page_copy_v2') {
    throw new Error(`get_report_page_copy has unsupported contract version: ${version}.`);
  }

  return version;
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

function mapDetail(detail: JsonRecord): ReportPageCopy['detail'] {
  const header = requiredRecord(read(detail, 'header'), 'detail.header');
  const sections = requiredRecord(read(detail, 'sections'), 'detail.sections');
  const empty = requiredRecord(read(detail, 'empty'), 'detail.empty');

  return {
    header: {
      titleFallback: requiredText(read(header, 'titleFallback'), 'detail.header.titleFallback'),
      backAction: requiredText(read(header, 'backAction'), 'detail.header.backAction'),
      shareAction: requiredText(read(header, 'shareAction'), 'detail.header.shareAction'),
      markReadAction: requiredText(read(header, 'markReadAction'), 'detail.header.markReadAction'),
      removeAction: requiredText(read(header, 'removeAction'), 'detail.header.removeAction'),
    },
    sections: {
      participants: requiredText(read(sections, 'participants'), 'detail.sections.participants'),
      itemReferences: requiredText(read(sections, 'itemReferences'), 'detail.sections.itemReferences'),
      spy: requiredText(read(sections, 'spy'), 'detail.sections.spy'),
      trial: requiredText(read(sections, 'trial'), 'detail.sections.trial'),
      encounter: requiredText(read(sections, 'encounter'), 'detail.sections.encounter'),
      combat: requiredText(read(sections, 'combat'), 'detail.sections.combat'),
      rewards: requiredText(read(sections, 'rewards'), 'detail.sections.rewards'),
      effects: requiredText(read(sections, 'effects'), 'detail.sections.effects'),
      relatedReports: requiredText(read(sections, 'relatedReports'), 'detail.sections.relatedReports'),
    },
    empty: {
      participants: requiredText(read(empty, 'participants'), 'detail.empty.participants'),
      itemReferences: requiredText(read(empty, 'itemReferences'), 'detail.empty.itemReferences'),
      rewards: requiredText(read(empty, 'rewards'), 'detail.empty.rewards'),
      relatedReports: requiredText(read(empty, 'relatedReports'), 'detail.empty.relatedReports'),
    },
  };
}

function mapPublicReport(publicReport: JsonRecord): ReportPageCopy['publicReport'] {
  const header = requiredRecord(read(publicReport, 'header'), 'publicReport.header');
  const privacy = requiredRecord(read(publicReport, 'privacy'), 'publicReport.privacy');

  return {
    header: {
      titleFallback: requiredText(read(header, 'titleFallback'), 'publicReport.header.titleFallback'),
      notFoundTitle: requiredText(read(header, 'notFoundTitle'), 'publicReport.header.notFoundTitle'),
      notFoundText: requiredText(read(header, 'notFoundText'), 'publicReport.header.notFoundText'),
    },
    privacy: {
      publicBoundaryText: requiredText(
        read(privacy, 'publicBoundaryText'),
        'publicReport.privacy.publicBoundaryText',
      ),
    },
  };
}

function mapLabels(labels: JsonRecord): ReportPageCopy['labels'] {
  return {
    createdAt: requiredText(read(labels, 'createdAt'), 'labels.createdAt'),
    reportType: requiredText(read(labels, 'reportType'), 'labels.reportType'),
    source: requiredText(read(labels, 'source'), 'labels.source'),
    participants: requiredText(read(labels, 'participants'), 'labels.participants'),
    rewards: requiredText(read(labels, 'rewards'), 'labels.rewards'),
    status: requiredText(read(labels, 'status'), 'labels.status'),
    publicLink: requiredText(read(labels, 'publicLink'), 'labels.publicLink'),
    readState: requiredText(read(labels, 'readState'), 'labels.readState'),
  };
}

function mapPaginationCopy(pagination: JsonRecord): ReportPageCopy['pagination'] {
  return {
    rangeTemplate: requiredText(read(pagination, 'rangeTemplate'), 'pagination.rangeTemplate'),
  };
}
