import {
  ReportMissingSection,
  ReportTrialSection,
} from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportTrialEntries(
  section: ReportTrialSection | ReportMissingSection | null,
): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  if ('missing' in section) {
    return [{
      key: 'trial-missing',
      title: section.title,
      description: section.message,
      chips: [section.sourceLabel],
      lines: [section.summary],
      rows: [],
    }];
  }

  return [{
    key: 'trial-summary',
    title: section.title,
    description: section.summary,
    chips: [section.trialLabel, section.sourceLabel, section.outcomeLabel, section.resultLabel],
    lines: [...section.narrativeLines, ...section.descriptionLines],
    rows: section.testedStatLabel && section.performanceRating
      ? [{
        key: 'trial-tested-stat',
        label: section.testedStatLabel,
        value: section.performanceRating,
      }]
      : [],
  }];
}
