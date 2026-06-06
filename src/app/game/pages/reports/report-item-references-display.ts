import { ReportItemReferenceRow } from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportItemReferenceEntries(
  rows: readonly ReportItemReferenceRow[],
): readonly ReportDetailSectionEntry[] {
  return rows.flatMap((row) =>
    row.displayNameFallback
      ? [
        {
          key: `item-${row.sourceItemId ?? row.itemReferenceId}`,
          title: row.displayNameFallback,
          description: null,
          chips: [],
          lines: [],
          rows: [],
        },
      ]
      : []
  );
}
