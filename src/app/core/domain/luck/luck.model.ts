import { Json } from '../../types/database.types';

export interface LuckFormulaReference {
  formulaKey: string;
  formulaExpression: string;
}

export interface LuckSurfaceStatus {
  isAvailable: boolean;
  isLuckAware: boolean | null;
  isLuckExcluded: boolean | null;
  isFormulaOwned: boolean | null;
  isConfigOwned: boolean | null;
  isFallback: boolean | null;
  missingConfigKeys: string[];
}

export interface LuckRngSurface {
  contractKey: string;
  categoryKey: string;
  label: string;
  description: string;
  helperText: string;
  rpcName: string;
  rpcSignature: string;
  resultType: string;
  sortOrder: number;
  status: LuckSurfaceStatus;
  metadataJson: Json;
}

export interface HeroLuckBreakdownEntry {
  sourceKey: string;
  sourceLabel: string;
  flatValue: number;
  multiplier: number;
  percentDelta: number;
  effectiveValue: number;
  detailsJson: Json;
}

export interface TrialPowerRead {
  heroId: string | null;
  testedStatKey: string | null;
  testedStatLabel: string | null;
  testedStatValue: number;
  luckValue: number;
  luckInfluence: number;
  trialPower: number;
  luckInfluenceFormula: LuckFormulaReference | null;
  trialPowerFormula: LuckFormulaReference | null;
  explanation: string;
}

export interface LuckLabInputState {
  luckValue: number;
  testedStatValue: number;
  spiritualityValue: number;
  difficultyKey: string | null;
  districtCode: string | null;
  testedStatKey: string | null;
  trialDefinitionId: string | null;
  selectedCombatProfileKey: string | null;
  rewardProfileId: string | null;
  bucketProfileId: string | null;
  maxQualityKey: string | null;
  previewCount: number;
  dryStepCount: number;
  stepsToPreview: number;
}

export interface LuckInfluencePreview {
  luckValue: number;
  luckInfluence: number;
  formula: LuckFormulaReference | null;
  explanation: string;
}

export interface LuckChancePreview {
  surfaceKey: string;
  categoryKey: string;
  testedStatKey: string | null;
  testedStatValue: number | null;
  luckValue: number;
  luckInfluence: number;
  trialPower: number | null;
  chancePercent: number | null;
  roll: number | null;
  resultKey: string | null;
  formula: LuckFormulaReference | null;
  explanation: string;
  contextJson: Json;
}

export interface LuckRewardRangePreview {
  previewRunIndex: number;
  rewardProfileId: string;
  rewardProfileKey: string;
  rewardProfileLabel: string;
  rewardProfileDescription: string;
  entryId: string;
  entryKind: string;
  entryLabel: string;
  entryDescription: string;
  effectDefinitionId: string;
  amountMode: string;
  resourceType: string;
  spiritualityValue: number;
  luckValue: number;
  luckInfluence: number;
  previewAmount: number;
  previewItemCount: number;
  minItemCount: number;
  maxItemCount: number;
  maxQualityKey: string;
  bucketProfileId: string;
  chancePercent: number;
  chanceRoll: number;
  isIncluded: boolean;
  formulaContextJson: Json;
  luckPolicyJson: Json;
  generatedItemsPreviewJson: Json;
  explanation: string;
}

export interface LuckGeneratedItemPreview {
  previewIndex: number;
  bucketProfileId: string;
  bucketProfileKey: string;
  bucketProfileName: string;
  bucketIndex: number;
  rolledBudget: number;
  luckValue: number;
  luckInfluence: number;
  baseId: string;
  baseKey: string;
  baseName: string;
  baseTypeKey: string;
  baseValue: number;
  qualityKey: string;
  qualityLabel: string;
  qualityMultiplier: number;
  qualityBaseWeight: number;
  qualityAdjustedWeight: number;
  qualityRollScore: number;
  prefixAffix: LuckGeneratedItemAffixPreview | null;
  suffixAffix: LuckGeneratedItemAffixPreview | null;
  generatedName: string;
  drachmaValue: number;
  budgetBeforeQualityMultiplier: number;
  remainingBudgetAfterBase: number;
  remainingBudgetAfterPrefix: number;
  remainingBudgetAfterSuffix: number;
  formulaContextJson: Json;
  explanation: string;
}

export interface LuckGeneratedItemAffixPreview {
  affixId: string;
  key: string;
  name: string;
  goldValue: number;
  chance: number;
  roll: number;
}

export interface CombatLuckPreview {
  attackerLuck: number;
  attackerLuckInfluence: number;
  defenderLuck: number;
  defenderLuckInfluence: number;
  hitGreenZone: number;
  evasionChance: number;
  criticalChance: number;
  criticalMultiplier: number;
  finalDamage: number;
  formulasJson: Json;
  explanation: string;
}

export type LuckLabSectionStatus = 'available' | 'unsupported';

export interface LuckLabDropDistributionSummary {
  status: LuckLabSectionStatus;
  sampleSize: number;
  bucketRows: LuckLabDistributionRow[];
  qualityRows: LuckLabDistributionRow[];
  prefixRows: LuckLabDistributionRow[];
  suffixRows: LuckLabDistributionRow[];
  reason: string;
}

export interface LuckLabDistributionRow {
  key: string;
  label: string;
  count: number;
  percent: number;
}

export interface LuckLabComparisonRow {
  key: string;
  label: string;
  baselineValue: number | null;
  previewValue: number | null;
  delta: number | null;
  unit: string;
}

export interface LuckLabExplanationRow {
  surfaceKey: string;
  label: string;
  description: string;
  helperText: string;
  status: LuckLabSectionStatus;
  reason: string;
}

export interface LuckLabPreviewResult {
  input: LuckLabInputState;
  surfaces: LuckRngSurface[];
  luckInfluence: LuckInfluencePreview | null;
  trialPower: TrialPowerRead | null;
  chancePreviews: LuckChancePreview[];
  combatPreview: CombatLuckPreview | null;
  rewardRangePreviews: LuckRewardRangePreview[];
  generatedItemPreviews: LuckGeneratedItemPreview[];
  dropDistribution: LuckLabDropDistributionSummary;
  comparisonRows: LuckLabComparisonRow[];
  explanationRows: LuckLabExplanationRow[];
}
