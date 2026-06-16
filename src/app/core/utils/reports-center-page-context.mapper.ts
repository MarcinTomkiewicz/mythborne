import {
  ReportsCenterEventTypeContract,
  ReportsCenterEventTypeMachine,
  ReportsCenterFilterOptionsContract,
  ReportsCenterListRow,
  ReportsCenterPageContext,
  ReportsCenterVisibilityPolicy,
} from '../domain/reports/reports-center.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
  requireLiteral,
  requiredTextArray,
} from './json-read';
import {
  mapActions,
  mapCapabilities,
} from './reports-center-actions.mapper';
import { mapFilters } from './reports-center-filters.mapper';
import {
  mapMarker,
  mapNullablePreview,
  mapPreview,
  mapReportDate,
  mapKeyLabel,
} from './reports-center-preview.mapper';
import {
  mapCounts,
  mapPagination,
  mapSummary,
} from './reports-center-summary.mapper';

export function mapReportsCenterPageContext(value: Json): ReportsCenterPageContext {
  const root = requiredRecord(value, 'get_reports_center_page_context');

  return {
    contractVersion: requireLiteral(
      requiredText(
        read(root, 'contractVersion'),
        'get_reports_center_page_context.contractVersion',
      ),
      'reports_center_page_context_v4',
      'get_reports_center_page_context.contractVersion',
    ),
    eventTypeContract: mapEventTypeContract(
      requiredRecord(
        read(root, 'eventTypeContract'),
        'get_reports_center_page_context.eventTypeContract',
      ),
      'get_reports_center_page_context.eventTypeContract',
    ),
    filterOptionsContract: mapFilterOptionsContract(
      requiredRecord(
        read(root, 'filterOptionsContract'),
        'get_reports_center_page_context.filterOptionsContract',
      ),
      'get_reports_center_page_context.filterOptionsContract',
    ),
    reports: mapReports(read(root, 'reports')),
    selectedPreview: mapNullablePreview(
      read(root, 'selectedPreview'),
      'get_reports_center_page_context.selectedPreview',
    ),
    pagination: mapPagination(
      requiredRecord(
        read(root, 'pagination'),
        'get_reports_center_page_context.pagination',
      ),
      'get_reports_center_page_context.pagination',
    ),
    summary: mapSummary(
      requiredRecord(read(root, 'summary'), 'get_reports_center_page_context.summary'),
      'get_reports_center_page_context.summary',
    ),
    counts: mapCounts(
      requiredRecord(read(root, 'counts'), 'get_reports_center_page_context.counts'),
      'get_reports_center_page_context.counts',
    ),
    filters: mapFilters(
      requiredRecord(read(root, 'filters'), 'get_reports_center_page_context.filters'),
      'get_reports_center_page_context.filters',
    ),
    actions: mapActions(
      requiredRecord(read(root, 'actions'), 'get_reports_center_page_context.actions'),
      'get_reports_center_page_context.actions',
    ),
    capabilities: mapCapabilities(
      requiredRecord(
        read(root, 'capabilities'),
        'get_reports_center_page_context.capabilities',
      ),
      'get_reports_center_page_context.capabilities',
    ),
  };
}

function mapEventTypeContract(
  record: JsonRecord,
  field: string,
): ReportsCenterEventTypeContract {
  return {
    canonicalPath: requireLiteral(
      requiredText(read(record, 'canonicalPath'), `${field}.canonicalPath`),
      'reports[].eventType.key',
      `${field}.canonicalPath`,
    ),
    removedDuplicatePaths: mapRemovedDuplicatePaths(
      requiredTextArray(read(record, 'removedDuplicatePaths'), `${field}.removedDuplicatePaths`),
      `${field}.removedDuplicatePaths`,
    ),
    copyPath: requireLiteral(
      requiredText(read(record, 'copyPath'), `${field}.copyPath`),
      'get_report_page_copy(locale).reportsCenter.eventTypes.byKey[eventType.key]',
      `${field}.copyPath`,
    ),
    fallbackPolicy: requiredText(read(record, 'fallbackPolicy'), `${field}.fallbackPolicy`),
    policy: requiredText(read(record, 'policy'), `${field}.policy`),
  };
}

function mapFilterOptionsContract(
  record: JsonRecord,
  field: string,
): ReportsCenterFilterOptionsContract {
  return {
    contractVersion: requireLiteral(
      requiredText(read(record, 'contractVersion'), `${field}.contractVersion`),
      'reports_center_filter_options_v2',
      `${field}.contractVersion`,
    ),
  };
}

function mapRemovedDuplicatePaths(
  paths: string[],
  field: string,
): ReportsCenterEventTypeContract['removedDuplicatePaths'] {
  if (
    paths.length !== 2 ||
    paths[0] !== 'reports[].preview.eventType' ||
    paths[1] !== 'reports[].marker.eventTypeKey'
  ) {
    throw new Error(`${field} has unsupported removed duplicate paths.`);
  }

  return [
    'reports[].preview.eventType',
    'reports[].marker.eventTypeKey',
  ];
}

function mapReports(value: Json | undefined): ReportsCenterListRow[] {
  return requiredArray(value, 'get_reports_center_page_context.reports')
    .map((row, index) =>
      mapReportRow(row, `get_reports_center_page_context.reports[${index}]`),
    );
}

function mapReportRow(row: JsonRecord, field: string): ReportsCenterListRow {
  const reportId = requiredText(read(row, 'reportId'), `${field}.reportId`);
  const preview = mapPreview(
    requiredRecord(read(row, 'preview'), `${field}.preview`),
    `${field}.preview`,
  );

  if (preview.reportId !== reportId) {
    throw new Error(`${field}.preview.reportId must match ${field}.reportId.`);
  }

  return {
    contractVersion: requiredText(read(row, 'contractVersion'), `${field}.contractVersion`),
    reportId,
    publicToken: requiredNullableText(read(row, 'publicToken'), `${field}.publicToken`),
    reportTypeKey: requiredText(read(row, 'reportTypeKey'), `${field}.reportTypeKey`),
    sourceEntityType: requiredText(read(row, 'sourceEntityType'), `${field}.sourceEntityType`),
    sourceEntityId: requiredText(read(row, 'sourceEntityId'), `${field}.sourceEntityId`),
    reportDomainKey: requiredText(read(row, 'reportDomainKey'), `${field}.reportDomainKey`),
    contentKind: requiredText(read(row, 'contentKind'), `${field}.contentKind`),
    resultKind: requiredNullableText(read(row, 'resultKind'), `${field}.resultKind`),
    source: mapKeyLabel(requiredRecord(read(row, 'source'), `${field}.source`), `${field}.source`),
    eventType: mapEventTypeMachine(
      requiredRecord(read(row, 'eventType'), `${field}.eventType`),
      `${field}.eventType`,
    ),
    title: requiredText(read(row, 'title'), `${field}.title`),
    summary: requiredNullableText(read(row, 'summary'), `${field}.summary`),
    createdAt: requiredText(read(row, 'createdAt'), `${field}.createdAt`),
    reportDate: mapReportDate(
      requiredRecord(read(row, 'reportDate'), `${field}.reportDate`),
      `${field}.reportDate`,
    ),
    accessRole: requiredText(read(row, 'accessRole'), `${field}.accessRole`),
    readAt: requiredNullableText(read(row, 'readAt'), `${field}.readAt`),
    isUnread: requiredBoolean(read(row, 'isUnread'), `${field}.isUnread`),
    marker: mapMarker(requiredRecord(read(row, 'marker'), `${field}.marker`), `${field}.marker`),
    preview,
    visibilityPolicy: mapVisibilityPolicy(
      requiredRecord(read(row, 'visibilityPolicy'), `${field}.visibilityPolicy`),
      `${field}.visibilityPolicy`,
    ),
  };
}

function mapEventTypeMachine(
  record: JsonRecord,
  field: string,
): ReportsCenterEventTypeMachine {
  return {
    key: requiredText(read(record, 'key'), `${field}.key`),
    label: optionalNullableText(read(record, 'label'), `${field}.label`),
    tone: optionalNullableText(read(record, 'tone'), `${field}.tone`),
    iconKey: optionalNullableText(read(record, 'iconKey'), `${field}.iconKey`),
  };
}

function mapVisibilityPolicy(
  record: JsonRecord,
  field: string,
): ReportsCenterVisibilityPolicy {
  return {
    isPrimaryListEntry: requiredBoolean(
      read(record, 'isPrimaryListEntry'),
      `${field}.isPrimaryListEntry`,
    ),
    isChildCombatReport: optionalNullableBoolean(
      read(record, 'isChildCombatReport'),
      `${field}.isChildCombatReport`,
    ),
    parentReportId: optionalNullableText(read(record, 'parentReportId'), `${field}.parentReportId`),
  };
}
