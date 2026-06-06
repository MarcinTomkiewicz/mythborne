import { ReportRelatedReportRow } from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredNullableText,
  requiredText,
} from './json-read';

export function mapRelatedReports(
  rows: readonly JsonRecord[],
  field: string,
): ReportRelatedReportRow[] {
  return rows.map((row, index) => ({
    relationKind: requiredText(read(row, 'relationKind'), `${field}[${index}].relationKind`),
    reportId: optionalNullableText(read(row, 'reportId'), `${field}[${index}].reportId`) ?? undefined,
    publicToken: requiredNullableText(read(row, 'publicToken'), `${field}[${index}].publicToken`),
    reportTypeKey: requiredText(read(row, 'reportTypeKey'), `${field}[${index}].reportTypeKey`),
    reportTypeLabel: requiredText(read(row, 'reportTypeLabel'), `${field}[${index}].reportTypeLabel`),
    title: requiredText(read(row, 'title'), `${field}[${index}].title`),
    sourceEntityType: requiredText(read(row, 'sourceEntityType'), `${field}[${index}].sourceEntityType`),
    createdAt: requiredText(read(row, 'createdAt'), `${field}[${index}].createdAt`),
  }));
}
