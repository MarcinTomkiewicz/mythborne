import { ReportRelatedReportRow } from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';
import { toDateTimeLabel } from '../../../core/utils/date-display';

export function reportRelatedReportEntries(
  rows: readonly ReportRelatedReportRow[],
): readonly ReportDetailSectionEntry[] {
  return rows.map((row) => ({
    key: `related-report-${row.reportId ?? row.publicToken ?? row.title}`,
    title: row.title,
    description: toDateTimeLabel(row.createdAt),
    chips: [row.reportTypeLabel],
    lines: [],
    rows: [],
  }));
}
