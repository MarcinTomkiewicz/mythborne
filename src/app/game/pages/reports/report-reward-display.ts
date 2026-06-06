import {
  ReportMissingSection,
  ReportRewardEntryRow,
  ReportRewardSection,
} from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportRewardEntries(
  section: ReportRewardSection | ReportMissingSection | null,
): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  if ('missing' in section) {
    return [{
      key: 'reward-missing',
      title: section.title,
      description: section.message,
      chips: [section.sourceLabel],
      lines: [section.summary],
      rows: [],
    }];
  }

  return [
    {
      key: 'reward-summary',
      title: section.title,
      description: section.message ?? section.summary,
      chips: [section.sourceLabel],
      lines: section.narrativeLines,
      rows: [],
    },
    ...section.entries.map(rewardEntry),
  ];
}

function rewardEntry(row: ReportRewardEntryRow): ReportDetailSectionEntry {
  return {
    key: `reward-entry-${row.entryKind}-${row.entryLabel}`,
    title: row.itemDisplayName ?? row.effectLabel ?? row.resourceLabel ?? row.entryLabel,
    description: row.playerSummary ?? row.summary,
    chips: [
      ...(row.displayValue ? [row.displayValue] : []),
      ...(row.amountDisplay ? [row.amountDisplay] : []),
      row.entryLabel,
    ],
    lines: [],
    rows: [],
  };
}
