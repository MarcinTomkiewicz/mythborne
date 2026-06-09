import { ReportsCenterRewardPreview } from '../domain/reports/reports-center.model';

export function reportsCenterRewardPreviewValues(
  reward: ReportsCenterRewardPreview | null | undefined,
): readonly string[] {
  if (!reward) {
    return [];
  }

  return Array.from(
    new Set([
      ...rewardPreviewParts(reward.summary, reward.entryCount),
      ...rewardPreviewParts(reward.resourcesSummary, reward.entryCount),
    ]),
  );
}

function rewardPreviewParts(
  value: string | null,
  entryCount: number,
): string[] {
  if (!value) {
    return [];
  }

  if (entryCount <= 1) {
    return [value.trim()].filter(Boolean);
  }

  return value
    .split(/\s*,\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);
}
