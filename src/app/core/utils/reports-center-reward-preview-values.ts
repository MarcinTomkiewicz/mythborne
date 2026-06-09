import { ReportsCenterRewardPreview } from '../domain/reports/reports-center.model';

export function reportsCenterRewardPreviewValues(
  reward: ReportsCenterRewardPreview | null | undefined,
): readonly string[] {
  if (!reward) {
    return [];
  }

  return Array.from(
    new Set([
      ...rewardPreviewValues(reward.summary),
      ...rewardPreviewValues(reward.resourcesSummary),
    ]),
  );
}

function rewardPreviewValues(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return [value.trim()].filter(Boolean);
}
