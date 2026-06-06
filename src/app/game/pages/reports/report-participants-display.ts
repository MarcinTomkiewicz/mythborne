import { ReportParticipantRow } from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportParticipantEntries(
  rows: readonly ReportParticipantRow[],
): readonly ReportDetailSectionEntry[] {
  return rows.map((row) => ({
    key: `participant-${row.displayName}`,
    title: row.displayName,
    description: null,
    chips: [
      ...(row.participantRole ? [row.participantRole] : []),
      ...(row.sideLabel ? [row.sideLabel] : []),
    ],
    lines: [],
    rows: [],
  }));
}
