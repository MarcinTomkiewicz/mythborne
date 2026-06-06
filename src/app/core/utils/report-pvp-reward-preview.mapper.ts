import type {
  ReportDetailPreviewRewardResult,
  ReportDetailPreviewRewardTextSegment,
} from '../domain/reports/report-detail-preview.model';
import type {
  ReportRewardEntryRow,
  ReportRewardSection,
} from '../domain/reports/report-section.model';

export function mapReportPvpRewardPreview(
  section: ReportRewardSection,
): ReportDetailPreviewRewardResult {
  const experience = rewardExperience(section.entries);
  const resources = pvpResourceTransferParts(section.entries);
  const segments = rewardSegments({ experience, resources });

  if (segments.length) {
    return {
      title: 'Zdobycze',
      segments,
    };
  }

  if (section.message?.trim()) {
    return {
      title: 'Zdobycze',
      segments: [plainRewardText(section.message.trim())],
    };
  }

  throw new Error(
    'get_report_detail.report.rewardSectionJson requires experience/pvp_resource_transfer entries or a display-safe message for PvP/Vicinity reward preview.',
  );
}

function rewardSegments(input: {
  experience: string | null;
  resources: readonly string[];
}): readonly ReportDetailPreviewRewardTextSegment[] {
  if (input.experience && input.resources.length) {
    return [
      plainRewardText('Pokonujesz przeciwnika i zdobywasz '),
      highlightedRewardText(input.experience),
      plainRewardText(' oraz rabujesz zasoby obrońcy: '),
      ...joinHighlightedRewardParts(input.resources),
      plainRewardText('.'),
    ];
  }

  if (input.experience) {
    return [
      plainRewardText('Zdobywasz '),
      highlightedRewardText(input.experience),
      plainRewardText('.'),
    ];
  }

  if (input.resources.length) {
    return [
      plainRewardText('Rabujesz zasoby obrońcy: '),
      ...joinHighlightedRewardParts(input.resources),
      plainRewardText('.'),
    ];
  }

  return [];
}

function rewardExperience(entries: readonly ReportRewardEntryRow[]): string | null {
  const index = entries.findIndex((candidate) => candidate.entryKind === 'experience');

  return index >= 0 ? rewardAmountText(entries[index], index) : null;
}

function pvpResourceTransferParts(entries: readonly ReportRewardEntryRow[]): readonly string[] {
  return entries.flatMap((entry, index) =>
    entry.entryKind === 'pvp_resource_transfer'
      ? [pvpResourceTransferPart(entry, index)]
      : [],
  );
}

function pvpResourceTransferPart(entry: ReportRewardEntryRow, index: number): string {
  const value = rewardAmountText(entry, index);

  if (entry.displayValue) {
    return value;
  }

  const label = entry.resourceLabel ?? entry.entryLabel;

  if (!label) {
    throw new Error(
      `get_report_detail.report.rewardSectionJson.entries[${index}] requires resourceLabel or entryLabel for PvP resource transfer preview display.`,
    );
  }

  return `${value} ${label}`;
}

function rewardAmountText(
  entry: ReportRewardEntryRow,
  index: number,
): string {
  const value = entry.displayValue ?? entry.amountDisplay;

  if (!value) {
    throw new Error(
      `get_report_detail.report.rewardSectionJson.entries[${index}] requires displayValue or amountDisplay for ${entry.entryKind} preview display.`,
    );
  }

  return stripPositiveSign(value);
}

function stripPositiveSign(value: string): string {
  return value.startsWith('+') ? value.slice(1) : value;
}

function joinHighlightedRewardParts(
  parts: readonly string[],
): readonly ReportDetailPreviewRewardTextSegment[] {
  return parts.flatMap((part, index) => [
    ...(index === 0 ? [] : [plainRewardText(index === parts.length - 1 ? ' i ' : ', ')]),
    highlightedRewardText(part),
  ]);
}

function plainRewardText(text: string): ReportDetailPreviewRewardTextSegment {
  return {
    text,
    isHighlighted: false,
  };
}

function highlightedRewardText(text: string): ReportDetailPreviewRewardTextSegment {
  return {
    text,
    isHighlighted: true,
  };
}
