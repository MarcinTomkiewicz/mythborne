import {
  ReportsCenterActionsCopy,
  ReportsCenterCopy,
  ReportsCenterFilterOptionsCopy,
  ReportsCenterHeaderCopy,
  ReportsCenterPreviewCopy,
  ReportsCenterSummaryCopy,
} from '../domain/reports/reports-center-copy.model';
import { JsonRecord, read, requiredRecord, requiredText } from './json-read';

export function mapReportsCenterCopy(center: JsonRecord): ReportsCenterCopy {
  const filters = requiredRecord(read(center, 'filters'), 'reportsCenter.filters');
  const list = requiredRecord(read(center, 'list'), 'reportsCenter.list');

  return {
    header: mapReportsCenterHeader(
      requiredRecord(read(center, 'header'), 'reportsCenter.header'),
    ),
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
    filterOptions: mapReportsCenterFilterOptions(
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

function mapReportsCenterHeader(header: JsonRecord): ReportsCenterHeaderCopy {
  return {
    eyebrow: requiredText(read(header, 'eyebrow'), 'header.eyebrow'),
    title: requiredText(read(header, 'title'), 'header.title'),
    intro: requiredText(read(header, 'intro'), 'header.intro'),
  };
}

function mapReportsCenterSummary(summary: JsonRecord): ReportsCenterSummaryCopy {
  return {
    totalReportsLabel: requiredText(read(summary, 'totalReportsLabel'), 'reportsCenter.summary.totalReportsLabel'),
    unreadReportsLabel: requiredText(read(summary, 'unreadReportsLabel'), 'reportsCenter.summary.unreadReportsLabel'),
    latestReportLabel: requiredText(read(summary, 'latestReportLabel'), 'reportsCenter.summary.latestReportLabel'),
    latestReportFallback: requiredText(read(summary, 'latestReportFallback'), 'reportsCenter.summary.latestReportFallback'),
    openLatestReportAction: requiredText(read(summary, 'openLatestReportAction'), 'reportsCenter.summary.openLatestReportAction'),
  };
}

function mapReportsCenterFilterOptions(
  filterOptions: JsonRecord,
): ReportsCenterFilterOptionsCopy {
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

function mapReportsCenterPreview(preview: JsonRecord): ReportsCenterPreviewCopy {
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

function mapReportsCenterActions(actions: JsonRecord): ReportsCenterActionsCopy {
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
