import {
  CombatLuckPreview,
  LuckChancePreview,
  LuckGeneratedItemPreview,
  LuckInfluencePreview,
  LuckLabComparisonRow,
  LuckLabDropDistributionSummary,
  LuckLabExplanationRow,
  LuckLabInputState,
  LuckLabPreviewResult,
  LuckLabSectionStatus,
  LuckRewardRangePreview,
  LuckRngSurface,
  TrialPowerRead,
} from '../domain/luck/luck.model';
import { PreviewLuckInfluenceAndTrialPowerRpcRow } from '../types/luck-rpc.types';
import { mapTrialPowerRead } from './luck-mappers';

export const DEFAULT_LUCK_LAB_INPUT: LuckLabInputState = {
  luckValue: 0,
  testedStatValue: 0,
  spiritualityValue: 0,
  difficultyKey: null,
  districtCode: null,
  testedStatKey: null,
  trialDefinitionId: null,
  selectedCombatProfileKey: null,
  rewardProfileId: null,
  bucketProfileId: null,
  maxQualityKey: null,
  previewCount: 10,
  dryStepCount: 0,
  stepsToPreview: 8,
};

export function mapLuckInfluencePreview(
  row: PreviewLuckInfluenceAndTrialPowerRpcRow,
): LuckInfluencePreview {
  const trialPower = mapTrialPowerRead(row);

  return {
    luckValue: trialPower.luckValue,
    luckInfluence: trialPower.luckInfluence,
    formula: trialPower.luckInfluenceFormula,
    explanation: trialPower.explanation,
  };
}

export function createUnsupportedDropDistributionSummary(
  reason = 'DB drop distribution simulation contract is not available.',
): LuckLabDropDistributionSummary {
  return {
    status: 'unsupported',
    sampleSize: 0,
    highValueThreshold: null,
    current: null,
    comparison: null,
    averageDelta: null,
    averageDeltaPercent: null,
    bucketRows: [],
    qualityRows: [],
    compareBucketRows: [],
    compareQualityRows: [],
    reason,
    explanation: reason,
    formulaContextJson: {},
    summaryJson: {},
  };
}

export function mapLuckLabPreviewResult(input: {
  input?: Partial<LuckLabInputState>;
  surfaces?: readonly LuckRngSurface[];
  luckInfluence?: LuckInfluencePreview | null;
  trialPower?: TrialPowerRead | null;
  chancePreviews?: readonly LuckChancePreview[];
  combatPreview?: CombatLuckPreview | null;
  rewardRangePreviews?: readonly LuckRewardRangePreview[];
  generatedItemPreviews?: readonly LuckGeneratedItemPreview[];
  dropDistribution?: LuckLabDropDistributionSummary | null;
}): LuckLabPreviewResult {
  const mergedInput = mapLuckLabInputState(input.input);
  const chancePreviews = [...(input.chancePreviews ?? [])];
  const combatPreview = input.combatPreview ?? null;
  const rewardRangePreviews = [...(input.rewardRangePreviews ?? [])];
  const generatedItemPreviews = [...(input.generatedItemPreviews ?? [])];
  const dropDistribution =
    input.dropDistribution ?? createUnsupportedDropDistributionSummary();

  return {
    input: mergedInput,
    surfaces: [...(input.surfaces ?? [])],
    luckInfluence: input.luckInfluence ?? null,
    trialPower: input.trialPower ?? null,
    chancePreviews,
    combatPreview,
    rewardRangePreviews,
    generatedItemPreviews,
    dropDistribution,
    comparisonRows: mapLuckLabComparisonRows({
      luckInfluence: input.luckInfluence ?? null,
      trialPower: input.trialPower ?? null,
      chancePreviews,
      combatPreview,
      generatedItemPreviews,
      rewardRangePreviews,
    }),
    explanationRows: mapLuckLabExplanationRows(input.surfaces ?? []),
  };
}

export function mapLuckLabInputState(
  input: Partial<LuckLabInputState> | undefined,
): LuckLabInputState {
  return {
    ...DEFAULT_LUCK_LAB_INPUT,
    ...input,
  };
}

function mapLuckLabComparisonRows(input: {
  luckInfluence: LuckInfluencePreview | null;
  trialPower: TrialPowerRead | null;
  chancePreviews: readonly LuckChancePreview[];
  combatPreview: CombatLuckPreview | null;
  generatedItemPreviews: readonly LuckGeneratedItemPreview[];
  rewardRangePreviews: readonly LuckRewardRangePreview[];
}): LuckLabComparisonRow[] {
  return [
    numberComparisonRow(
      'luck_influence',
      'Luck influence',
      input.luckInfluence?.luckValue ?? null,
      input.luckInfluence?.luckInfluence ?? null,
      'points',
    ),
    numberComparisonRow(
      'trial_power',
      'Trial Power',
      input.trialPower?.testedStatValue ?? null,
      input.trialPower?.trialPower ?? null,
      'points',
    ),
    ...input.chancePreviews.map((preview) =>
      numberComparisonRow(
        preview.surfaceKey,
        chanceComparisonLabel(preview),
        null,
        preview.chancePercent,
        'percent',
      ),
    ),
    numberComparisonRow(
      'combat_hit_green_zone',
      'Combat hit green zone',
      null,
      input.combatPreview?.hitGreenZone ?? null,
      'percent',
    ),
    numberComparisonRow(
      'generated_item_value',
      'Generated item value',
      null,
      firstNumber(input.generatedItemPreviews.map((preview) => preview.drachmaValue)),
      'drachma',
    ),
    numberComparisonRow(
      'reward_preview_amount',
      'Reward preview amount',
      null,
      firstNumber(input.rewardRangePreviews.map((preview) => preview.previewAmount)),
      'amount',
    ),
  ].filter((row) => row.previewValue !== null || row.baselineValue !== null);
}

function mapLuckLabExplanationRows(
  surfaces: readonly LuckRngSurface[],
): LuckLabExplanationRow[] {
  return surfaces.map((surface) => {
      const status: LuckLabSectionStatus = surface.status.isAvailable
        ? 'available'
        : 'unsupported';

      return {
        surfaceKey: surface.contractKey,
        lookupKeys: explanationLookupKeys(surface),
        label: surface.label,
        description: surface.description,
        helperText: surface.helperText,
        status,
        reason: surface.status.isAvailable
          ? surface.helperText
          : unavailableReason(surface),
      };
    });
}

function numberComparisonRow(
  key: string,
  label: string,
  baselineValue: number | null,
  previewValue: number | null,
  unit: string,
): LuckLabComparisonRow {
  return {
    key,
    label,
    baselineValue,
    previewValue,
    delta:
      baselineValue !== null && previewValue !== null
        ? previewValue - baselineValue
        : null,
    unit,
  };
}

function chanceComparisonLabel(preview: LuckChancePreview): string {
  return preview.resultKey
    ? `${preview.surfaceKey} (${preview.resultKey})`
    : preview.surfaceKey;
}

function firstNumber(values: readonly number[]): number | null {
  return values.length > 0 ? values[0] : null;
}

function unavailableReason(surface: LuckRngSurface): string {
  return surface.status.missingConfigKeys.length > 0
    ? `Missing config: ${surface.status.missingConfigKeys.join(', ')}`
    : 'Luck Lab preview contract is not available.';
}

function explanationLookupKeys(surface: LuckRngSurface): string[] {
  const metadata = metadataRecord(surface.metadataJson);

  return uniqueTextValues([
    surface.contractKey,
    surface.rpcName,
    textMetadata(metadata, 'surfaceKey'),
    textMetadata(metadata, 'surface_key'),
    ...stringArrayMetadata(metadata, 'aliases'),
    ...stringArrayMetadata(metadata, 'surfaceAliases'),
    ...stringArrayMetadata(metadata, 'surface_aliases'),
  ]);
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function textMetadata(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];

  return typeof value === 'string' && value.trim() ? value : null;
}

function stringArrayMetadata(
  metadata: Record<string, unknown>,
  key: string,
): string[] {
  const value = metadata[key];

  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
    : [];
}

function uniqueTextValues(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}
