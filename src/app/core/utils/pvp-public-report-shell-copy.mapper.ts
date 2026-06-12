import { PvpPublicReportShellCopy } from '../domain/pvp/pvp-public-report-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  requiredArray,
  requiredNullableText,
  requiredNumber,
  requiredText,
  read,
} from './json-read';

export function mapPvpPublicReportShellCopy(
  record: JsonRecord,
  rootPublicToken: string,
): PvpPublicReportShellCopy {
  const shellPublicToken = requiredText(
    read(record, 'publicToken'),
    'get_public_pvp_report_copy.shell.publicToken',
  );

  if (shellPublicToken !== rootPublicToken) {
    throw new Error('get_public_pvp_report_copy.shell.publicToken must match publicToken.');
  }

  return {
    eyebrow: requiredText(read(record, 'eyebrow'), 'get_public_pvp_report_copy.shell.eyebrow'),
    title: requiredText(read(record, 'title'), 'get_public_pvp_report_copy.shell.title'),
    summary: requiredText(read(record, 'summary'), 'get_public_pvp_report_copy.shell.summary'),
    createdAt: requiredText(read(record, 'createdAt'), 'get_public_pvp_report_copy.shell.createdAt'),
    publicToken: shellPublicToken,
    reportTypeLabel: requiredText(read(record, 'reportTypeLabel'), 'get_public_pvp_report_copy.shell.reportTypeLabel'),
    sourceLabel: requiredText(read(record, 'sourceLabel'), 'get_public_pvp_report_copy.shell.sourceLabel'),
    visibilityLabel: requiredText(read(record, 'visibilityLabel'), 'get_public_pvp_report_copy.shell.visibilityLabel'),
    participants: requiredArray(
      read(record, 'participants'),
      'get_public_pvp_report_copy.shell.participants',
    ).map((participant, index) => ({
      participantRole: requiredText(
        read(participant, 'participantRole'),
        `get_public_pvp_report_copy.shell.participants[${index}].participantRole`,
      ),
      sideLabel: requiredNullableText(
        read(participant, 'sideLabel'),
        `get_public_pvp_report_copy.shell.participants[${index}].sideLabel`,
      ),
      displayName: requiredText(
        read(participant, 'displayName'),
        `get_public_pvp_report_copy.shell.participants[${index}].displayName`,
      ),
      levelSnapshot: nullableNumber(
        read(participant, 'levelSnapshot'),
        `get_public_pvp_report_copy.shell.participants[${index}].levelSnapshot`,
      ),
      sortOrder: requiredNumber(
        read(participant, 'sortOrder'),
        `get_public_pvp_report_copy.shell.participants[${index}].sortOrder`,
      ),
    })),
  };
}

function nullableNumber(value: Json | undefined, field: string): number | null {
  return value === null ? null : requiredNumber(value, field);
}
