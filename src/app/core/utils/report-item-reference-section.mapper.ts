import { ReportItemReferenceRow } from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableNumber,
  optionalNullableText,
  read,
  requiredText,
} from './json-read';

export function mapReportItemReferences(
  rows: readonly JsonRecord[],
  field: string,
): ReportItemReferenceRow[] {
  return rows.map((row, index) => ({
    itemReferenceId: requiredText(read(row, 'itemReferenceId'), `${field}[${index}].itemReferenceId`),
    sourceKind: requiredText(read(row, 'sourceKind'), `${field}[${index}].sourceKind`),
    sourceItemId: optionalNullableText(read(row, 'sourceItemId'), `${field}[${index}].sourceItemId`),
    displayNameFallback: optionalNullableText(read(row, 'displayNameFallback'), `${field}[${index}].displayNameFallback`),
    qualityKey: optionalNullableText(read(row, 'qualityKey'), `${field}[${index}].qualityKey`),
    baseId: optionalNullableText(read(row, 'baseId'), `${field}[${index}].baseId`),
    prefixAffixId: optionalNullableText(read(row, 'prefixAffixId'), `${field}[${index}].prefixAffixId`),
    suffixAffixId: optionalNullableText(read(row, 'suffixAffixId'), `${field}[${index}].suffixAffixId`),
    sortOrder: optionalNullableNumber(read(row, 'sortOrder'), `${field}[${index}].sortOrder`),
  }));
}
