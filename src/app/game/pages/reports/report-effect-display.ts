import {
  ReportEffectDisplay,
  ReportEffectSection,
} from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportEffectEntries(section: ReportEffectSection | null): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  return [
    {
      key: 'effect-summary',
      title: section.title,
      description: section.summary,
      chips: [section.sourceLabel],
      lines: section.narrativeLines,
      rows: [],
    },
    ...section.effects.map((effect) =>
      effectEntry(`effect-${effect.effectKey}`, effect, [
        effect.displayValue,
        effect.statusLabel,
        effect.effectKindLabel,
      ])
    ),
    ...section.rewardEffectEntries.map((effect) =>
      effectEntry(`reward-effect-${effect.effectKey}`, effect, [
        effect.displayValue,
        effect.effectKindLabel,
      ])
    ),
  ];
}

function effectEntry(
  key: string,
  effect: ReportEffectDisplay,
  chips: readonly string[],
): ReportDetailSectionEntry {
  return {
    key,
    title: effect.title,
    description: effect.playerSummary,
    chips,
    lines: effect.narrativeLines,
    rows: [],
  };
}
