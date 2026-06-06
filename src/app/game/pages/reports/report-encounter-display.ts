import {
  ReportEncounterSection,
  ReportMissingSection,
} from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportEncounterEntries(
  section: ReportEncounterSection | ReportMissingSection | null,
): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  if ('missing' in section) {
    return [{
      key: 'encounter-missing',
      title: section.title,
      description: section.message,
      chips: [section.sourceLabel],
      lines: [section.summary],
      rows: [],
    }];
  }

  return [{
    key: 'encounter-summary',
    title: section.title,
    description: section.summary,
    chips: [section.encounterLabel, section.sourceLabel, section.outcomeLabel],
    lines: [...section.narrativeLines, ...section.descriptionLines],
    rows: [],
  }];
}
