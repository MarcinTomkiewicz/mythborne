import { LuckLabInputState } from '../../../core/domain/luck/luck.model';

export interface LuckLabComparisonPreset {
  label: string;
  input: LuckLabInputState;
}

const FIXED_LUCK_PRESETS: readonly { label: string; luckValue: number }[] = [
  { label: 'Luck 0', luckValue: 0 },
  { label: 'Low Luck 10', luckValue: 10 },
  { label: 'Medium Luck 25', luckValue: 25 },
  { label: 'High Luck 50', luckValue: 50 },
];

export function luckLabComparisonPresets(
  input: LuckLabInputState,
): LuckLabComparisonPreset[] {
  return [
    ...FIXED_LUCK_PRESETS.map((preset) => ({
      label: preset.label,
      input: { ...input, luckValue: preset.luckValue },
    })),
    { label: 'Current Luck', input },
  ];
}
