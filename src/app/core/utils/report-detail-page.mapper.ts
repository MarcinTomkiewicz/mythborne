import { PrivateReportDetailPage, ReportDetailCore } from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalText,
  read,
  requiredBoolean,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapReportDetailPage(
  value: Json,
  expected: { heroId: string; reportId: string },
): PrivateReportDetailPage {
  const root = requiredRecord(value, 'get_report_detail');

  return {
    contractVersion: requireReportDetailVersion(root),
    access: mapPrivateAccess(
      requiredRecord(read(root, 'access'), 'get_report_detail.access'),
      expected,
    ),
    report: mapReportDetailCore(
      requiredRecord(read(root, 'report'), 'get_report_detail.report'),
    ),
  };
}

function requireReportDetailVersion(root: JsonRecord): 'report_detail_v1' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_report_detail.contractVersion',
  );

  if (version !== 'report_detail_v1') {
    throw new Error(`get_report_detail has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapPrivateAccess(
  access: JsonRecord,
  expected: { heroId: string; reportId: string },
): PrivateReportDetailPage['access'] {
  const visibility = requiredText(read(access, 'visibility'), 'get_report_detail.access.visibility');
  const heroId = requiredText(read(access, 'heroId'), 'get_report_detail.access.heroId');
  const reportId = requiredText(read(access, 'reportId'), 'get_report_detail.access.reportId');

  if (visibility !== 'private') {
    throw new Error(`get_report_detail.access.visibility must be private.`);
  }

  if (heroId !== expected.heroId) {
    throw new Error('get_report_detail.access.heroId does not match requested heroId.');
  }

  if (reportId !== expected.reportId) {
    throw new Error('get_report_detail.access.reportId does not match requested reportId.');
  }

  return {
    visibility,
    heroId,
    reportId,
    accessRole: requiredText(read(access, 'accessRole'), 'get_report_detail.access.accessRole'),
    isUnread: requiredBoolean(read(access, 'isUnread'), 'get_report_detail.access.isUnread'),
    readAt: nullableText(read(access, 'readAt'), 'get_report_detail.access.readAt'),
  };
}

function mapReportDetailCore(report: JsonRecord): ReportDetailCore {
  return {
    publicToken: nullableText(read(report, 'publicToken'), 'get_report_detail.report.publicToken'),
    reportTypeKey: requiredText(
      read(report, 'reportTypeKey'),
      'get_report_detail.report.reportTypeKey',
    ),
    reportTypeLabel: requiredText(
      read(report, 'reportTypeLabel'),
      'get_report_detail.report.reportTypeLabel',
    ),
    reportTypeDescription: nullableText(
      read(report, 'reportTypeDescription'),
      'get_report_detail.report.reportTypeDescription',
    ),
    title: requiredText(read(report, 'title'), 'get_report_detail.report.title'),
    summary: nullableText(read(report, 'summary'), 'get_report_detail.report.summary'),
    sourceLabel: nullableText(read(report, 'sourceLabel'), 'get_report_detail.report.sourceLabel'),
    sourceEntityType: nullableText(
      read(report, 'sourceEntityType'),
      'get_report_detail.report.sourceEntityType',
    ),
    createdAt: requiredText(read(report, 'createdAt'), 'get_report_detail.report.createdAt'),
    participantsJson: requiredJsonArray(
      read(report, 'participantsJson'),
      'get_report_detail.report.participantsJson',
    ),
    itemReferencesJson: requiredJsonArray(
      read(report, 'itemReferencesJson'),
      'get_report_detail.report.itemReferencesJson',
    ),
    spySectionJson: nullableJson(
      read(report, 'spySectionJson'),
      'get_report_detail.report.spySectionJson',
    ),
    trialSectionJson: nullableJson(
      read(report, 'trialSectionJson'),
      'get_report_detail.report.trialSectionJson',
    ),
    encounterSectionJson: nullableJson(
      read(report, 'encounterSectionJson'),
      'get_report_detail.report.encounterSectionJson',
    ),
    combatSectionJson: nullableJson(
      read(report, 'combatSectionJson'),
      'get_report_detail.report.combatSectionJson',
    ),
    rewardSectionJson: nullableJson(
      read(report, 'rewardSectionJson'),
      'get_report_detail.report.rewardSectionJson',
    ),
    effectSectionJson: nullableJson(
      read(report, 'effectSectionJson'),
      'get_report_detail.report.effectSectionJson',
    ),
    relatedReportsJson: requiredJsonArray(
      read(report, 'relatedReportsJson'),
      'get_report_detail.report.relatedReportsJson',
    ),
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

function nullableJson(value: Json | undefined, field: string): Json | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  return value;
}

function requiredJsonArray(value: Json | undefined, field: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value;
}
