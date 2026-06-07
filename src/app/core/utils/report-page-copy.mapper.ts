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

function mapReportsCenter(center: JsonRecord): ReportPageCopy['reportsCenter'] {
  const filters = requiredRecord(read(center, 'filters'), 'reportsCenter.filters');
  const list = requiredRecord(read(center, 'list'), 'reportsCenter.list');

  return {
    header: mapHeader(requiredRecord(read(center, 'header'), 'reportsCenter.header')),
    summary: mapReportsCenterSummary(
      requiredRecord(read(center, 'summary'), 'reportsCenter.summary'),
    ),
    filters: {
      title: requiredText(read(filters, 'title'), 'reportsCenter.filters.title'),
      helperText: requiredText(read(filters, 'helperText'), 'reportsCenter.filters.helperText'),
      searchLabel: requiredText(read(filters, 'searchLabel'), 'reportsCenter.filters.searchLabel'),
      searchPlaceholder: requiredText(
        read(filters, 'searchPlaceholder'),
        'reportsCenter.filters.searchPlaceholder',
      ),
      eventTypeLabel: requiredText(
        read(filters, 'eventTypeLabel'),
        'reportsCenter.filters.eventTypeLabel',
      ),
      readModeLabel: requiredText(
        read(filters, 'readModeLabel'),
        'reportsCenter.filters.readModeLabel',
      ),
      timeRangeLabel: requiredText(
        read(filters, 'timeRangeLabel'),
        'reportsCenter.filters.timeRangeLabel',
      ),
      reportTypeLabel: requiredText(
        read(filters, 'reportTypeLabel'),
        'reportsCenter.filters.reportTypeLabel',
      ),
      unreadOnlyLabel: requiredText(
        read(filters, 'unreadOnlyLabel'),
        'reportsCenter.filters.unreadOnlyLabel',
      ),
      allTypesLabel: requiredText(read(filters, 'allTypesLabel'), 'reportsCenter.filters.allTypesLabel'),
    },
    filterOptions: mapFilterOptions(
      requiredRecord(read(center, 'filterOptions'), 'reportsCenter.filterOptions'),
    ),
    list: {
      title: requiredText(read(list, 'title'), 'reportsCenter.list.title'),
      emptyTitle: requiredText(read(list, 'emptyTitle'), 'reportsCenter.list.emptyTitle'),
      emptyText: requiredText(read(list, 'emptyText'), 'reportsCenter.list.emptyText'),
      openAction: requiredText(read(list, 'openAction'), 'reportsCenter.list.openAction'),
      removeAction: requiredText(read(list, 'removeAction'), 'reportsCenter.list.removeAction'),
      markReadAction: requiredText(read(list, 'markReadAction'), 'reportsCenter.list.markReadAction'),
      unreadLabel: requiredText(read(list, 'unreadLabel'), 'reportsCenter.list.unreadLabel'),
      readLabel: requiredText(read(list, 'readLabel'), 'reportsCenter.list.readLabel'),
      unreadCountTemplate: requiredText(
        read(list, 'unreadCountTemplate'),
        'reportsCenter.list.unreadCountTemplate',
      ),
      rangeTemplate: requiredText(read(list, 'rangeTemplate'), 'reportsCenter.list.rangeTemplate'),
    },
    preview: mapReportsCenterPreview(
      requiredRecord(read(center, 'preview'), 'reportsCenter.preview'),
    ),
    actions: mapReportsCenterActions(
      requiredRecord(read(center, 'actions'), 'reportsCenter.actions'),
    ),
  };
}

function mapHeader(header: JsonRecord): ReportPageCopy['reportsCenter']['header'] {
  return {
    eyebrow: requiredText(read(header, 'eyebrow'), 'header.eyebrow'),
    title: requiredText(read(header, 'title'), 'header.title'),
    intro: requiredText(read(header, 'intro'), 'header.intro'),
  };
}

function mapReportsCenterSummary(
  summary: JsonRecord,
): ReportPageCopy['reportsCenter']['summary'] {
  return {
    totalReportsLabel: requiredText(read(summary, 'totalReportsLabel'), 'reportsCenter.summary.totalReportsLabel'),
    unreadReportsLabel: requiredText(read(summary, 'unreadReportsLabel'), 'reportsCenter.summary.unreadReportsLabel'),
    latestReportLabel: requiredText(read(summary, 'latestReportLabel'), 'reportsCenter.summary.latestReportLabel'),
    latestReportFallback: requiredText(read(summary, 'latestReportFallback'), 'reportsCenter.summary.latestReportFallback'),
    openLatestReportAction: requiredText(read(summary, 'openLatestReportAction'), 'reportsCenter.summary.openLatestReportAction'),
  };
}

function mapFilterOptions(
  filterOptions: JsonRecord,
): ReportPageCopy['reportsCenter']['filterOptions'] {
  const eventTypes = requiredRecord(read(filterOptions, 'eventTypes'), 'reportsCenter.filterOptions.eventTypes');
  const readModes = requiredRecord(read(filterOptions, 'readModes'), 'reportsCenter.filterOptions.readModes');
  const timeRanges = requiredRecord(read(filterOptions, 'timeRanges'), 'reportsCenter.filterOptions.timeRanges');

  return {
    eventTypes: {
      all: requiredText(read(eventTypes, 'all'), 'reportsCenter.filterOptions.eventTypes.all'),
      exploration: requiredText(read(eventTypes, 'exploration'), 'reportsCenter.filterOptions.eventTypes.exploration'),
      combat: requiredText(read(eventTypes, 'combat'), 'reportsCenter.filterOptions.eventTypes.combat'),
      spy: requiredText(read(eventTypes, 'spy'), 'reportsCenter.filterOptions.eventTypes.spy'),
      trade: requiredText(read(eventTypes, 'trade'), 'reportsCenter.filterOptions.eventTypes.trade'),
      auction: requiredText(read(eventTypes, 'auction'), 'reportsCenter.filterOptions.eventTypes.auction'),
      siege: requiredText(read(eventTypes, 'siege'), 'reportsCenter.filterOptions.eventTypes.siege'),
    },
    readModes: {
      unreadFirst: requiredText(read(readModes, 'unreadFirst'), 'reportsCenter.filterOptions.readModes.unreadFirst'),
      all: requiredText(read(readModes, 'all'), 'reportsCenter.filterOptions.readModes.all'),
      unreadOnly: requiredText(read(readModes, 'unreadOnly'), 'reportsCenter.filterOptions.readModes.unreadOnly'),
      readOnly: requiredText(read(readModes, 'readOnly'), 'reportsCenter.filterOptions.readModes.readOnly'),
    },
    timeRanges: {
      last7Days: requiredText(read(timeRanges, 'last7Days'), 'reportsCenter.filterOptions.timeRanges.last7Days'),
      last30Days: requiredText(read(timeRanges, 'last30Days'), 'reportsCenter.filterOptions.timeRanges.last30Days'),
      allTime: requiredText(read(timeRanges, 'allTime'), 'reportsCenter.filterOptions.timeRanges.allTime'),
    },
  };
}

function mapReportsCenterPreview(
  preview: JsonRecord,
): ReportPageCopy['reportsCenter']['preview'] {
  return {
    emptyTitle: requiredText(read(preview, 'emptyTitle'), 'reportsCenter.preview.emptyTitle'),
    emptyText: requiredText(read(preview, 'emptyText'), 'reportsCenter.preview.emptyText'),
    titleFallback: requiredText(read(preview, 'titleFallback'), 'reportsCenter.preview.titleFallback'),
    sourceLabel: requiredText(read(preview, 'sourceLabel'), 'reportsCenter.preview.sourceLabel'),
    eventTypeLabel: requiredText(read(preview, 'eventTypeLabel'), 'reportsCenter.preview.eventTypeLabel'),
    reportDateLabel: requiredText(read(preview, 'reportDateLabel'), 'reportsCenter.preview.reportDateLabel'),
    rewardLabel: requiredText(read(preview, 'rewardLabel'), 'reportsCenter.preview.rewardLabel'),
    openAction: requiredText(read(preview, 'openAction'), 'reportsCenter.preview.openAction'),
    copyLinkAction: requiredText(read(preview, 'copyLinkAction'), 'reportsCenter.preview.copyLinkAction'),
  };
}

function mapReportsCenterActions(
  actions: JsonRecord,
): ReportPageCopy['reportsCenter']['actions'] {
  const markAllRead = requiredRecord(read(actions, 'markAllRead'), 'reportsCenter.actions.markAllRead');

  return {
    markAllRead: {
      label: requiredText(read(markAllRead, 'label'), 'reportsCenter.actions.markAllRead.label'),
      disabledTooltip: requiredText(
        read(markAllRead, 'disabledTooltip'),
        'reportsCenter.actions.markAllRead.disabledTooltip',
      ),
      confirmTitle: requiredText(
        read(markAllRead, 'confirmTitle'),
        'reportsCenter.actions.markAllRead.confirmTitle',
      ),
      confirmText: requiredText(
        read(markAllRead, 'confirmText'),
        'reportsCenter.actions.markAllRead.confirmText',
      ),
      successText: requiredText(
        read(markAllRead, 'successText'),
        'reportsCenter.actions.markAllRead.successText',
      ),
    },
  };
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
