import {
  ReportsCenterActionsCopy,
  ReportsCenterBulkActionCopy,
  ReportsCenterCopy,
  ReportsCenterDeleteOneActionCopy,
  ReportsCenterEventTypeCopy,
  ReportsCenterEventTypeCopyBundle,
  ReportsCenterFilterOptionsCopy,
  ReportsCenterHeaderCopy,
  ReportsCenterMarkAllReadActionCopy,
  ReportsCenterPreviewCopy,
  ReportsCenterRowActionCopy,
  ReportsCenterSelectReportRowActionCopy,
  ReportsCenterSimpleActionCopy,
  ReportsCenterSummaryCopy,
} from '../domain/reports/reports-center-copy.model';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
  requiredTextRecord,
  requiredTextArray,
} from './json-read';

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
    eventTypes: mapReportsCenterEventTypes(
      requiredRecord(read(center, 'eventTypes'), 'reportsCenter.eventTypes'),
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
      ...requiredTextRecord(eventTypes, 'reportsCenter.filterOptions.eventTypes'),
    },
    readModes: requiredTextRecord(readModes, 'reportsCenter.filterOptions.readModes'),
    timeRanges: requiredTextRecord(timeRanges, 'reportsCenter.filterOptions.timeRanges'),
  };
}

function mapReportsCenterEventTypes(
  eventTypes: JsonRecord,
): ReportsCenterEventTypeCopyBundle {
  const byKey = requiredRecord(read(eventTypes, 'byKey'), 'reportsCenter.eventTypes.byKey');

  return {
    contractVersion: requireReportsCenterEventTypeCopyVersion(eventTypes),
    policy: requiredText(read(eventTypes, 'policy'), 'reportsCenter.eventTypes.policy'),
    keys: requiredTextArray(read(eventTypes, 'keys'), 'reportsCenter.eventTypes.keys'),
    byKey: Object.fromEntries(
      Object.entries(byKey).map(([key, value]) => [
        key,
        mapReportsCenterEventTypeCopy(
          requiredRecord(value, `reportsCenter.eventTypes.byKey.${key}`),
          `reportsCenter.eventTypes.byKey.${key}`,
        ),
      ]),
    ),
  };
}

function requireReportsCenterEventTypeCopyVersion(
  eventTypes: JsonRecord,
): 'reports_center_event_type_copy_v1' {
  const version = requiredText(
    read(eventTypes, 'contractVersion'),
    'reportsCenter.eventTypes.contractVersion',
  );

  if (version !== 'reports_center_event_type_copy_v1') {
    throw new Error(`reportsCenter.eventTypes has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapReportsCenterEventTypeCopy(
  eventType: JsonRecord,
  field: string,
): ReportsCenterEventTypeCopy {
  return {
    label: requiredText(read(eventType, 'label'), `${field}.label`),
    tone: requireReportsCenterEventTypeTone(eventType, field),
    iconKey: requiredText(read(eventType, 'iconKey'), `${field}.iconKey`),
  };
}

function requireReportsCenterEventTypeTone(
  eventType: JsonRecord,
  field: string,
): ReportsCenterEventTypeCopy['tone'] {
  const tone = requiredText(read(eventType, 'tone'), `${field}.tone`);

  if (
    tone !== 'success'
    && tone !== 'danger'
    && tone !== 'warn'
    && tone !== 'info'
    && tone !== 'neutral'
  ) {
    throw new Error(`${field}.tone has unsupported value: ${tone}.`);
  }

  return tone;
}

function mapReportsCenterPreview(preview: JsonRecord): ReportsCenterPreviewCopy {
  return {
    emptyTitle: requiredText(read(preview, 'emptyTitle'), 'reportsCenter.preview.emptyTitle'),
    emptyText: requiredText(read(preview, 'emptyText'), 'reportsCenter.preview.emptyText'),
    titleFallback: requiredText(read(preview, 'titleFallback'), 'reportsCenter.preview.titleFallback'),
    sourceLabel: requiredText(read(preview, 'sourceLabel'), 'reportsCenter.preview.sourceLabel'),
    eventTypeLabel: requiredText(read(preview, 'eventTypeLabel'), 'reportsCenter.preview.eventTypeLabel'),
    reportDateLabel: requiredText(read(preview, 'reportDateLabel'), 'reportsCenter.preview.reportDateLabel'),
    accessLabel: requiredText(read(preview, 'accessLabel'), 'reportsCenter.preview.accessLabel'),
    rewardLabel: requiredText(read(preview, 'rewardLabel'), 'reportsCenter.preview.rewardLabel'),
    resourcesLabel: requiredText(read(preview, 'resourcesLabel'), 'reportsCenter.preview.resourcesLabel'),
    turnCountLabel: requiredText(read(preview, 'turnCountLabel'), 'reportsCenter.preview.turnCountLabel'),
    opponentTargetLabel: requiredText(
      read(preview, 'opponentTargetLabel'),
      'reportsCenter.preview.opponentTargetLabel',
    ),
    addressLabel: requiredText(read(preview, 'addressLabel'), 'reportsCenter.preview.addressLabel'),
    openAction: requiredText(read(preview, 'openAction'), 'reportsCenter.preview.openAction'),
    copyLinkAction: requiredText(read(preview, 'copyLinkAction'), 'reportsCenter.preview.copyLinkAction'),
    copyLinkShortAction: requiredText(
      read(preview, 'copyLinkShortAction'),
      'reportsCenter.preview.copyLinkShortAction',
    ),
  };
}

function mapReportsCenterActions(actions: JsonRecord): ReportsCenterActionsCopy {
  return {
    markAllRead: mapMarkAllReadAction(actions),
    selectAllVisible: mapSimpleAction(actions, 'selectAllVisible'),
    clearSelection: mapSimpleAction(actions, 'clearSelection'),
    markSelectedRead: mapBulkAction(actions, 'markSelectedRead'),
    deleteSelected: mapBulkAction(actions, 'deleteSelected'),
    markOneRead: mapRowAction(actions, 'markOneRead'),
    deleteOne: mapDeleteOneAction(actions),
    selectReportRow: mapSelectReportRowAction(actions),
  };
}

function mapMarkAllReadAction(actions: JsonRecord): ReportsCenterMarkAllReadActionCopy {
  const field = 'reportsCenter.actions.markAllRead';
  const action = requiredRecord(read(actions, 'markAllRead'), field);

  return {
    label: requiredText(read(action, 'label'), `${field}.label`),
    disabledTooltip: requiredText(read(action, 'disabledTooltip'), `${field}.disabledTooltip`),
    confirmTitle: requiredText(read(action, 'confirmTitle'), `${field}.confirmTitle`),
    confirmText: requiredText(read(action, 'confirmText'), `${field}.confirmText`),
    successText: requiredText(read(action, 'successText'), `${field}.successText`),
  };
}

function mapSimpleAction(
  actions: JsonRecord,
  actionKey: 'selectAllVisible' | 'clearSelection',
): ReportsCenterSimpleActionCopy {
  const field = `reportsCenter.actions.${actionKey}`;
  const action = requiredRecord(read(actions, actionKey), field);

  return {
    label: requiredText(read(action, 'label'), `${field}.label`),
    ariaLabel: requiredText(read(action, 'ariaLabel'), `${field}.ariaLabel`),
    tooltip: requiredText(read(action, 'tooltip'), `${field}.tooltip`),
  };
}

function mapBulkAction(
  actions: JsonRecord,
  actionKey: 'markSelectedRead' | 'deleteSelected',
): ReportsCenterBulkActionCopy {
  const field = `reportsCenter.actions.${actionKey}`;
  const action = requiredRecord(read(actions, actionKey), field);

  return {
    label: requiredText(read(action, 'label'), `${field}.label`),
    ariaLabel: requiredText(read(action, 'ariaLabel'), `${field}.ariaLabel`),
    confirmTitle: requiredText(read(action, 'confirmTitle'), `${field}.confirmTitle`),
    confirmText: requiredText(read(action, 'confirmText'), `${field}.confirmText`),
    successText: requiredText(read(action, 'successText'), `${field}.successText`),
    disabledTooltip: requiredText(read(action, 'disabledTooltip'), `${field}.disabledTooltip`),
  };
}

function mapRowAction(
  actions: JsonRecord,
  actionKey: 'markOneRead' | 'deleteOne',
): ReportsCenterRowActionCopy {
  const field = `reportsCenter.actions.${actionKey}`;
  const action = requiredRecord(read(actions, actionKey), field);

  return {
    label: requiredText(read(action, 'label'), `${field}.label`),
    ariaLabel: requiredText(read(action, 'ariaLabel'), `${field}.ariaLabel`),
    tooltip: requiredText(read(action, 'tooltip'), `${field}.tooltip`),
    successText: requiredText(read(action, 'successText'), `${field}.successText`),
  };
}

function mapDeleteOneAction(actions: JsonRecord): ReportsCenterDeleteOneActionCopy {
  const field = 'reportsCenter.actions.deleteOne';
  const action = requiredRecord(read(actions, 'deleteOne'), field);

  return {
    ...mapRowAction(actions, 'deleteOne'),
    confirmTitle: requiredText(read(action, 'confirmTitle'), `${field}.confirmTitle`),
    confirmText: requiredText(read(action, 'confirmText'), `${field}.confirmText`),
  };
}

function mapSelectReportRowAction(
  actions: JsonRecord,
): ReportsCenterSelectReportRowActionCopy {
  const field = 'reportsCenter.actions.selectReportRow';
  const action = requiredRecord(read(actions, 'selectReportRow'), field);

  return {
    ariaLabelTemplate: requiredText(read(action, 'ariaLabelTemplate'), `${field}.ariaLabelTemplate`),
    selectedAriaLabelTemplate: requiredText(
      read(action, 'selectedAriaLabelTemplate'),
      `${field}.selectedAriaLabelTemplate`,
    ),
    fallbackAriaLabel: requiredText(read(action, 'fallbackAriaLabel'), `${field}.fallbackAriaLabel`),
    selectedFallbackAriaLabel: requiredText(
      read(action, 'selectedFallbackAriaLabel'),
      `${field}.selectedFallbackAriaLabel`,
    ),
  };
}
