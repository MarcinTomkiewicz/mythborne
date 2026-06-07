import {
  MarkAllReportsReadResultV1,
  ReportsCenterActionsV1,
  ReportsCenterCapabilitiesV1,
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
  requireJsonArray,
  requireLiteral,
} from './json-read';
import { mapAppliedFilters } from './reports-center-filters.mapper';

export function mapMarkAllReportsReadResult(value: Json): MarkAllReportsReadResultV1 {
  const root = requiredRecord(value, 'mark_all_reports_read');

  return {
    contractVersion: requireLiteral(
      requiredText(read(root, 'contractVersion'), 'mark_all_reports_read.contractVersion'),
      'mark_all_reports_read_result_v1',
      'mark_all_reports_read.contractVersion',
    ),
    heroId: requiredText(read(root, 'heroId'), 'mark_all_reports_read.heroId'),
    requestId: requiredNullableText(read(root, 'requestId'), 'mark_all_reports_read.requestId'),
    matchingUnreadCountBefore: requiredNumber(
      read(root, 'matchingUnreadCountBefore'),
      'mark_all_reports_read.matchingUnreadCountBefore',
    ),
    markedCount: requiredNumber(read(root, 'markedCount'), 'mark_all_reports_read.markedCount'),
    remainingUnreadCount: requiredNumber(
      read(root, 'remainingUnreadCount'),
      'mark_all_reports_read.remainingUnreadCount',
    ),
    filters: mapAppliedFilters(
      requiredRecord(read(root, 'filters'), 'mark_all_reports_read.filters'),
      'mark_all_reports_read.filters',
    ),
  };
}

export function mapActions(record: JsonRecord, field: string): ReportsCenterActionsV1 {
  const markAllRead = requiredRecord(read(record, 'markAllRead'), `${field}.markAllRead`);

  return {
    markAllRead: {
      supported: requiredBoolean(read(markAllRead, 'supported'), `${field}.markAllRead.supported`),
      enabled: requiredBoolean(read(markAllRead, 'enabled'), `${field}.markAllRead.enabled`),
      matchingUnreadCount: requiredNumber(
        read(markAllRead, 'matchingUnreadCount'),
        `${field}.markAllRead.matchingUnreadCount`,
      ),
      label: requiredText(read(markAllRead, 'label'), `${field}.markAllRead.label`),
      disabledTooltip: requiredText(
        read(markAllRead, 'disabledTooltip'),
        `${field}.markAllRead.disabledTooltip`,
      ),
    },
  };
}

export function mapCapabilities(record: JsonRecord, field: string): ReportsCenterCapabilitiesV1 {
  const filters = requiredRecord(read(record, 'filters'), `${field}.filters`);
  const preview = requiredRecord(read(record, 'preview'), `${field}.preview`);
  const markAllRead = requiredRecord(read(record, 'markAllRead'), `${field}.markAllRead`);
  const primaryListPolicy = requiredRecord(
    read(record, 'primaryListPolicy'),
    `${field}.primaryListPolicy`,
  );
  const notifications = requiredRecord(read(record, 'notifications'), `${field}.notifications`);

  return {
    filters: {
      search: requiredBoolean(read(filters, 'search'), `${field}.filters.search`),
      eventType: requiredBoolean(read(filters, 'eventType'), `${field}.filters.eventType`),
      readMode: requiredBoolean(read(filters, 'readMode'), `${field}.filters.readMode`),
      timeRange: requiredBoolean(read(filters, 'timeRange'), `${field}.filters.timeRange`),
    },
    preview: {
      rightPreview: requiredBoolean(read(preview, 'rightPreview'), `${field}.preview.rightPreview`),
      usesFullReportDetail: requireFalse(
        read(preview, 'usesFullReportDetail'),
        `${field}.preview.usesFullReportDetail`,
      ),
      requiresPrivateDomainRpc: requireFalse(
        read(preview, 'requiresPrivateDomainRpc'),
        `${field}.preview.requiresPrivateDomainRpc`,
      ),
    },
    markAllRead: {
      supported: requiredBoolean(read(markAllRead, 'supported'), `${field}.markAllRead.supported`),
    },
    primaryListPolicy: {
      hidesChildCombatReports: requiredBoolean(
        read(primaryListPolicy, 'hidesChildCombatReports'),
        `${field}.primaryListPolicy.hidesChildCombatReports`,
      ),
    },
    notifications: {
      included: requireFalse(
        read(notifications, 'included'),
        `${field}.notifications.included`,
      ),
      reasonKey: requiredText(read(notifications, 'reasonKey'), `${field}.notifications.reasonKey`),
    },
    unsupportedFilters: requireJsonArray(read(record, 'unsupportedFilters'), `${field}.unsupportedFilters`),
  };
}
