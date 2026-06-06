import { ReportParticipantRow } from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableNumber,
  optionalNullableText,
  read,
  requiredText,
} from './json-read';

export function mapReportParticipants(
  rows: readonly JsonRecord[],
  field: string,
): ReportParticipantRow[] {
  return rows.map((row, index) => ({
    participantRole: optionalNullableText(read(row, 'participantRole'), `${field}[${index}].participantRole`),
    sideLabel: optionalNullableText(read(row, 'sideLabel'), `${field}[${index}].sideLabel`),
    displayName: requiredText(read(row, 'displayName'), `${field}[${index}].displayName`),
    levelSnapshot: optionalNullableNumber(read(row, 'levelSnapshot'), `${field}[${index}].levelSnapshot`),
    sortOrder: optionalNullableNumber(read(row, 'sortOrder'), `${field}[${index}].sortOrder`),
    heroId: optionalNullableText(read(row, 'heroId'), `${field}[${index}].heroId`),
  }));
}
