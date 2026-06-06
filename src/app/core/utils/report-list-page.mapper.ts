import {
  ReportListPage,
  ReportListRow,
  ReportPagination,
} from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalText,
  read,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapReportListPage(value: Json): ReportListPage {
  const root = requiredRecord(value, 'get_report_list_page');

  return {
    contractVersion: requireReportListPageVersion(root),
    reports: requiredReportsArray(read(root, 'reports')),
    unreadCount: requiredNumber(read(root, 'unreadCount'), 'get_report_list_page.unreadCount'),
    pagination: mapReportPagination(
      requiredRecord(read(root, 'pagination'), 'get_report_list_page.pagination'),
    ),
    appliedFilters: mapAppliedFilters(
      requiredRecord(read(root, 'appliedFilters'), 'get_report_list_page.appliedFilters'),
    ),
  };
}

function requireReportListPageVersion(root: JsonRecord): 'report_list_page_v1' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_report_list_page.contractVersion',
  );

  if (version !== 'report_list_page_v1') {
    throw new Error(`get_report_list_page has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapReportListRow(row: JsonRecord, field: string): ReportListRow {
  return {
    reportId: requiredText(read(row, 'reportId'), `${field}.reportId`),
    publicToken: nullableText(read(row, 'publicToken'), `${field}.publicToken`),
    reportTypeKey: requiredText(read(row, 'reportTypeKey'), `${field}.reportTypeKey`),
    reportTypeLabel: requiredText(read(row, 'reportTypeLabel'), `${field}.reportTypeLabel`),
    title: requiredText(read(row, 'title'), `${field}.title`),
    summary: nullableText(read(row, 'summary'), `${field}.summary`),
    sourceEntityType: nullableText(read(row, 'sourceEntityType'), `${field}.sourceEntityType`),
    sourceEntityId: nullableText(read(row, 'sourceEntityId'), `${field}.sourceEntityId`),
    accessRole: requiredText(read(row, 'accessRole'), `${field}.accessRole`),
    createdAt: requiredText(read(row, 'createdAt'), `${field}.createdAt`),
    readAt: nullableText(read(row, 'readAt'), `${field}.readAt`),
    isUnread: requiredBoolean(read(row, 'isUnread'), `${field}.isUnread`),
    participantsJson: requiredJsonArray(read(row, 'participantsJson'), `${field}.participantsJson`),
    itemReferencesCount: requiredNumber(
      read(row, 'itemReferencesCount'),
      `${field}.itemReferencesCount`,
    ),
  };
}

function requiredReportsArray(value: Json | undefined): ReportListRow[] {
  if (!Array.isArray(value)) {
    throw new Error('get_report_list_page.reports must be an array.');
  }

  return value.map((entry, index) => {
    const field = `get_report_list_page.reports[${index}]`;
    const row = requiredRecord(entry, field);

    return mapReportListRow(row, field);
  });
}

function mapReportPagination(pagination: JsonRecord): ReportPagination {
  return {
    limit: requiredNumber(read(pagination, 'limit'), 'pagination.limit'),
    offset: requiredNumber(read(pagination, 'offset'), 'pagination.offset'),
    totalCount: requiredNumber(read(pagination, 'totalCount'), 'pagination.totalCount'),
    hasNextPage: requiredBoolean(read(pagination, 'hasNextPage'), 'pagination.hasNextPage'),
    rangeStart: requiredNumber(read(pagination, 'rangeStart'), 'pagination.rangeStart'),
    rangeEnd: requiredNumber(read(pagination, 'rangeEnd'), 'pagination.rangeEnd'),
    rangeTotal: requiredNumber(read(pagination, 'rangeTotal'), 'pagination.rangeTotal'),
    rangeTemplate: requiredText(read(pagination, 'rangeTemplate'), 'pagination.rangeTemplate'),
    displayLabel: requiredText(read(pagination, 'displayLabel'), 'pagination.displayLabel'),
  };
}

function mapAppliedFilters(
  filters: JsonRecord,
): ReportListPage['appliedFilters'] {
  return {
    reportTypeKey: nullableText(read(filters, 'reportTypeKey'), 'appliedFilters.reportTypeKey'),
    unreadOnly: requiredBoolean(read(filters, 'unreadOnly'), 'appliedFilters.unreadOnly'),
  };
}

function nullableText(value: Json | undefined, field: string): string | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  if (value === null) {
    return null;
  }

  const text = optionalText(value);

  if (text === null) {
    throw new Error(`${field} must be a string or null.`);
  }

  return text;
}

function requiredJsonArray(value: Json | undefined, field: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value;
}
