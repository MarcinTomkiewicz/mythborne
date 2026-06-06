import { PrivateReportDetailPage } from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapReportDetailCore } from './report-detail-core.mapper';

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
    readAt: requiredNullableText(read(access, 'readAt'), 'get_report_detail.access.readAt'),
  };
}
