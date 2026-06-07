import {
  ReportsCenterListRowV2,
  ReportsCenterPageContextV2,
  ReportsCenterVisibilityPolicyV1,
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
} from './json-read';
import {
  mapActions,
  mapCapabilities,
} from './reports-center-actions.mapper';
import { mapFilters } from './reports-center-filters.mapper';
import {
  mapKeyLabel,
  mapMarker,
  mapNullablePreview,
  mapPreview,
  mapReportDate,
} from './reports-center-preview.mapper';
import {
  mapCounts,
  mapPagination,
  mapSummary,
} from './reports-center-summary.mapper';

export function mapReportsCenterPageContext(value: Json): ReportsCenterPageContextV2 {
  const root = requiredRecord(value, 'get_reports_center_page_context');

  return {
    contractVersion: requireLiteral(
      requiredText(
        read(root, 'contractVersion'),
        'get_reports_center_page_context.contractVersion',
      ),
      'reports_center_page_context_v2',
      'get_reports_center_page_context.contractVersion',
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

function mapReports(value: Json | undefined): ReportsCenterListRowV2[] {
  return requiredArray(value, 'get_reports_center_page_context.reports')
    .map((row, index) =>
      mapReportRow(row, `get_reports_center_page_context.reports[${index}]`),
    );
}

function mapReportRow(row: JsonRecord, field: string): ReportsCenterListRowV2 {
  return {
    contractVersion: requireLiteral(
      requiredText(read(row, 'contractVersion'), `${field}.contractVersion`),
      'reports_center_list_row_v2',
      `${field}.contractVersion`,
    ),
    reportId: requiredText(read(row, 'reportId'), `${field}.reportId`),
    publicToken: requiredText(read(row, 'publicToken'), `${field}.publicToken`),
    reportTypeKey: requiredText(read(row, 'reportTypeKey'), `${field}.reportTypeKey`),
    sourceEntityType: requiredText(read(row, 'sourceEntityType'), `${field}.sourceEntityType`),
    sourceEntityId: requiredText(read(row, 'sourceEntityId'), `${field}.sourceEntityId`),
    reportDomainKey: requiredText(read(row, 'reportDomainKey'), `${field}.reportDomainKey`),
    contentKind: requiredText(read(row, 'contentKind'), `${field}.contentKind`),
    resultKind: requiredNullableText(read(row, 'resultKind'), `${field}.resultKind`),
    source: mapKeyLabel(requiredRecord(read(row, 'source'), `${field}.source`), `${field}.source`),
    eventType: mapKeyLabel(
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
    preview: mapPreview(
      requiredRecord(read(row, 'preview'), `${field}.preview`),
      `${field}.preview`,
    ),
    visibilityPolicy: mapVisibilityPolicy(
      requiredRecord(read(row, 'visibilityPolicy'), `${field}.visibilityPolicy`),
      `${field}.visibilityPolicy`,
    ),
  };
}

function mapVisibilityPolicy(
  record: JsonRecord,
  field: string,
): ReportsCenterVisibilityPolicyV1 {
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
