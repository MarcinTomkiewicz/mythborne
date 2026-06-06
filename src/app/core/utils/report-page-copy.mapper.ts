import { ReportPageCopy } from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import { JsonRecord, read, requiredRecord, requiredText } from './json-read';

export function mapReportPageCopy(value: Json): ReportPageCopy {
  const root = requiredRecord(value, 'get_report_page_copy');

  return {
    contractVersion: requireReportPageCopyVersion(root),
    reportsCenter: mapReportsCenter(
      requiredRecord(read(root, 'reportsCenter'), 'get_report_page_copy.reportsCenter'),
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

function requireReportPageCopyVersion(root: JsonRecord): 'report_page_copy_v1' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_report_page_copy.contractVersion',
  );

  if (version !== 'report_page_copy_v1') {
    throw new Error(`get_report_page_copy has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapReportsCenter(center: JsonRecord): ReportPageCopy['reportsCenter'] {
  const filters = requiredRecord(read(center, 'filters'), 'reportsCenter.filters');
  const list = requiredRecord(read(center, 'list'), 'reportsCenter.list');

  return {
    header: mapHeader(requiredRecord(read(center, 'header'), 'reportsCenter.header')),
    filters: {
      title: requiredText(read(filters, 'title'), 'reportsCenter.filters.title'),
      helperText: requiredText(read(filters, 'helperText'), 'reportsCenter.filters.helperText'),
      reportTypeLabel: requiredText(
        read(filters, 'reportTypeLabel'),
        'reportsCenter.filters.reportTypeLabel',
      ),
      unreadOnlyLabel: requiredText(
        read(filters, 'unreadOnlyLabel'),
        'reportsCenter.filters.unreadOnlyLabel',
      ),
      searchLabel: requiredText(
        read(filters, 'searchLabel'),
        'reportsCenter.filters.searchLabel',
      ),
      searchPlaceholder: requiredText(
        read(filters, 'searchPlaceholder'),
        'reportsCenter.filters.searchPlaceholder',
      ),
      allTypesLabel: requiredText(
        read(filters, 'allTypesLabel'),
        'reportsCenter.filters.allTypesLabel',
      ),
    },
    list: {
      title: requiredText(read(list, 'title'), 'reportsCenter.list.title'),
      emptyTitle: requiredText(read(list, 'emptyTitle'), 'reportsCenter.list.emptyTitle'),
      emptyText: requiredText(read(list, 'emptyText'), 'reportsCenter.list.emptyText'),
      unreadLabel: requiredText(read(list, 'unreadLabel'), 'reportsCenter.list.unreadLabel'),
      readLabel: requiredText(read(list, 'readLabel'), 'reportsCenter.list.readLabel'),
      openAction: requiredText(read(list, 'openAction'), 'reportsCenter.list.openAction'),
      removeAction: requiredText(read(list, 'removeAction'), 'reportsCenter.list.removeAction'),
    },
  };
}

function mapHeader(header: JsonRecord): ReportPageCopy['reportsCenter']['header'] {
  return {
    eyebrow: requiredText(read(header, 'eyebrow'), 'header.eyebrow'),
    title: requiredText(read(header, 'title'), 'header.title'),
    intro: requiredText(read(header, 'intro'), 'header.intro'),
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
      itemReferences: requiredText(
        read(sections, 'itemReferences'),
        'detail.sections.itemReferences',
      ),
      spy: requiredText(read(sections, 'spy'), 'detail.sections.spy'),
      trial: requiredText(read(sections, 'trial'), 'detail.sections.trial'),
      encounter: requiredText(read(sections, 'encounter'), 'detail.sections.encounter'),
      combat: requiredText(read(sections, 'combat'), 'detail.sections.combat'),
      rewards: requiredText(read(sections, 'rewards'), 'detail.sections.rewards'),
      effects: requiredText(read(sections, 'effects'), 'detail.sections.effects'),
      relatedReports: requiredText(
        read(sections, 'relatedReports'),
        'detail.sections.relatedReports',
      ),
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
