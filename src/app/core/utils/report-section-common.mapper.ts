import {
  ReportMissingSection,
} from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
  optionalNullableText,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapNullableReportSection<T>(
  value: Json | undefined,
  field: string,
  mapper: (record: JsonRecord, field: string) => T,
): T | ReportMissingSection | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  if (value === null) {
    return null;
  }

  const record = requiredRecord(value, field);

  return optionalBoolean(read(record, 'missing')) === true
    ? mapMissingSection(record, field)
    : mapper(record, field);
}

function mapMissingSection(record: JsonRecord, field: string): ReportMissingSection {
  return {
    missing: true,
    sourceEntityType: optionalNullableText(read(record, 'sourceEntityType'), `${field}.sourceEntityType`),
    sectionKind: optionalNullableText(read(record, 'sectionKind'), `${field}.sectionKind`),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    message: requiredText(read(record, 'message'), `${field}.message`),
  };
}
