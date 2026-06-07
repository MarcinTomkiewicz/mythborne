import {
  ReportsCenterCountsV1,
  ReportsCenterLatestReportV1,
  ReportsCenterNotificationsSummaryV1,
  ReportsCenterPaginationV1,
  ReportsCenterSummaryMetricV1,
  ReportsCenterSummaryV1,
} from '../domain/reports/reports-center.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredBoolean,
  requiredNullableText,
  requiredNumber,
  requiredRecord,
  requiredText,
  requireFalse,
  requireNull,
} from './json-read';

export function mapPagination(record: JsonRecord, field: string): ReportsCenterPaginationV1 {
  return {
    limit: requiredNumber(read(record, 'limit'), `${field}.limit`),
    offset: requiredNumber(read(record, 'offset'), `${field}.offset`),
    totalCount: requiredNumber(read(record, 'totalCount'), `${field}.totalCount`),
    rangeStart: requiredNumber(read(record, 'rangeStart'), `${field}.rangeStart`),
    rangeEnd: requiredNumber(read(record, 'rangeEnd'), `${field}.rangeEnd`),
    hasNextPage: requiredBoolean(read(record, 'hasNextPage'), `${field}.hasNextPage`),
    displayLabel: requiredText(read(record, 'displayLabel'), `${field}.displayLabel`),
  };
}

export function mapSummary(record: JsonRecord, field: string): ReportsCenterSummaryV1 {
  return {
    totalReports: mapMetric(
      requiredRecord(read(record, 'totalReports'), `${field}.totalReports`),
      `${field}.totalReports`,
    ),
    unreadReports: mapMetric(
      requiredRecord(read(record, 'unreadReports'), `${field}.unreadReports`),
      `${field}.unreadReports`,
    ),
    latestReport: mapLatestReport(
      requiredRecord(read(record, 'latestReport'), `${field}.latestReport`),
      `${field}.latestReport`,
    ),
    notifications: mapNotificationsSummary(
      requiredRecord(read(record, 'notifications'), `${field}.notifications`),
      `${field}.notifications`,
    ),
  };
}

export function mapCounts(record: JsonRecord, field: string): ReportsCenterCountsV1 {
  return {
    totalReports: requiredNumber(read(record, 'totalReports'), `${field}.totalReports`),
    unreadReports: requiredNumber(read(record, 'unreadReports'), `${field}.unreadReports`),
    matchingReports: requiredNumber(read(record, 'matchingReports'), `${field}.matchingReports`),
    matchingUnreadReports: requiredNumber(
      read(record, 'matchingUnreadReports'),
      `${field}.matchingUnreadReports`,
    ),
  };
}

function mapMetric(record: JsonRecord, field: string): ReportsCenterSummaryMetricV1 {
  return {
    label: requiredText(read(record, 'label'), `${field}.label`),
    value: requiredNumber(read(record, 'value'), `${field}.value`),
  };
}

function mapLatestReport(record: JsonRecord, field: string): ReportsCenterLatestReportV1 {
  return {
    label: requiredText(read(record, 'label'), `${field}.label`),
    fallbackLabel: requiredText(read(record, 'fallbackLabel'), `${field}.fallbackLabel`),
    reportId: requiredNullableText(read(record, 'reportId'), `${field}.reportId`),
    title: requiredNullableText(read(record, 'title'), `${field}.title`),
    createdAt: requiredNullableText(read(record, 'createdAt'), `${field}.createdAt`),
    publicToken: requiredNullableText(read(record, 'publicToken'), `${field}.publicToken`),
    openActionLabel: requiredText(read(record, 'openActionLabel'), `${field}.openActionLabel`),
    privatePath: requiredNullableText(read(record, 'privatePath'), `${field}.privatePath`),
  };
}

function mapNotificationsSummary(
  record: JsonRecord,
  field: string,
): ReportsCenterNotificationsSummaryV1 {
  return {
    included: requireFalse(read(record, 'included'), `${field}.included`),
    reasonKey: requiredText(read(record, 'reasonKey'), `${field}.reasonKey`),
    label: requiredNullableText(read(record, 'label'), `${field}.label`),
    latestNotification: requireNull(read(record, 'latestNotification'), `${field}.latestNotification`),
  };
}
