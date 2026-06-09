import { Json, Database } from '../../types/database.types';

type RpcRow<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Returns'] extends readonly (infer Row)[] ? Row : never;

export type TrialOpportunityCurvePreviewRow =
  RpcRow<'preview_trial_opportunity_curve'>;
export type TrialManifestationChancePreviewRow =
  RpcRow<'preview_trial_manifestation_chance'>;
export type ChallengeAutoResolveSuccessChancePreviewRow =
  RpcRow<'preview_challenge_auto_resolve_success_chance'>;
export type RewardGeneratedItemPreviewRow = RpcRow<'preview_reward_generated_item'>;
export type TrialOpportunitySimulationRow = RpcRow<'simulate_trial_opportunity_runs'>;
export type ExplorationDifficultyKey = 'easy' | 'medium' | 'hard';
export type ExplorationLockedByDifficultyKey = 'easy' | 'medium';
export type ExplorationTrialIconKey = 'trial';
export type ExplorationLockedDisplayTone = 'danger';
export type ExplorationTrialCompletionTone = 'success' | 'danger';

export interface TrialOpportunityCurvePreview {
  difficultyKey: string;
  difficultyLabel: string;
  projectedStepNumber: number;
  dryStepCount: number;
  spiritualityValue: number;
  luckValue: number;
  luckInfluence: number;
  trialOpportunityChance: number;
  trialOpportunityStepCap: number;
  formulaKey: string;
  formulaExpression: string;
  isGuaranteedByStepCap: boolean;
  explanation: string;
}

export interface HeroExplorationDifficultyCardPreview {
  cardJson: Json;
  difficultyKey: string;
  difficultyLabel: string;
  difficultyDescription: string;
  difficultyHelperText: string | null;
  isActive: boolean;
  isAvailable: boolean;
  stepDurationDisplay: string;
  stepDurationSeconds: number;
  trialOpportunityDisplay: string;
  trialOpportunityChance: number;
  trialOpportunityIsGuaranteedByStepCap: boolean;
  manifestationDisplay: string;
  manifestationChance: number;
  autoResultPolicy: string;
  autoResultDisplay: string;
  autoResultSuccessChance: number;
  rewardItemCountDisplay: string;
  isUnlocked: boolean;
  lockedByDifficultyKey: ExplorationLockedByDifficultyKey | null;
  missingRequiredTrialCount: number;
  requiredTrialCount: number;
  lockedDisplay: HeroExplorationDifficultyLockedDisplay | null;
  trialCompletionRows: HeroExplorationDifficultyTrialCompletion[];
  unlockPolicy: Json;
  statDetails: HeroExplorationDifficultyStatDetail[];
}

export interface HeroExplorationDifficultyLockedDisplay {
  iconKey: ExplorationTrialIconKey;
  tone: ExplorationLockedDisplayTone;
  label: string;
  ariaLabel: string;
}

export interface HeroExplorationDifficultyTrialCompletion {
  difficultyKey: ExplorationDifficultyKey;
  trialDefinitionId: string;
  trialKey: string;
  patronKey: null;
  patronLabel: string | null;
  statKey: string;
  statLabel: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  display: HeroExplorationDifficultyTrialCompletionDisplay;
}

export interface HeroExplorationDifficultyTrialCompletionDisplay {
  iconKey: ExplorationTrialIconKey;
  tone: ExplorationTrialCompletionTone;
  ariaLabel: string;
}

export interface HeroExplorationDifficultyStatDetail {
  statKey: string;
  statLabel: string;
  manifestationDisplay: string;
  manifestationChance: number;
  autoResultDisplay: string;
  autoResultSuccessChance: number;
  trialCompletion: HeroExplorationDifficultyTrialCompletion;
}

export interface TrialManifestationChancePreview {
  trialDefinitionId: string;
  trialKey: string;
  trialLabel: string;
  testedStatKey: string;
  testedStatValue: number;
  difficultyKey: string;
  districtCode: string;
  spiritualityValue: number;
  luckValue: number;
  luckInfluence: number;
  trialPower: number;
  rawManifestationChance: number;
  maxManifestationChancePercent: number;
  finalManifestationChance: number;
  formulaKey: string;
  formulaExpression: string;
  explanation: string;
}

export interface ChallengeAutoResolveSuccessChancePreview {
  testedStatKey: string;
  testedStatValue: number;
  difficultyKey: string;
  difficultyLabel: string;
  difficultyMultiplier: number;
  spiritualityValue: number;
  luckValue: number;
  luckInfluence: number;
  trialPower: number;
  rawAutoResolveSuccessChance: number;
  capPercent: number;
  finalAutoResolveSuccessChance: number;
  formulaKey: string;
  formulaExpression: string;
  explanation: string;
}

export interface RewardGeneratedItemPreview {
  previewIndex: number;
  bucketProfileId: string;
  bucketProfileKey: string;
  bucketProfileName: string;
  bucketIndex: number;
  rolledBudget: number;
  baseId: string;
  baseKey: string;
  baseName: string;
  baseTypeKey: string;
  baseValue: number;
  qualityKey: string;
  qualityLabel: string;
  qualityMultiplier: number;
  prefixAffixId: string;
  prefixKey: string;
  prefixName: string;
  prefixGoldValue: number;
  suffixAffixId: string;
  suffixKey: string;
  suffixName: string;
  suffixGoldValue: number;
  generatedName: string;
  drachmaValue: number;
  budgetBeforeQualityMultiplier: number;
  remainingBudgetAfterBase: number;
  remainingBudgetAfterPrefix: number;
  remainingBudgetAfterSuffix: number;
  explanation: string;
}

export interface TrialOpportunitySimulation {
  runIndex: number;
  difficultyKey: string;
  difficultyLabel: string;
  startingDryStepCount: number;
  maxStepsPerRun: number;
  stepsTaken: number;
  trialFound: boolean;
  trialStepNumber: number;
  dryStepCountBeforeFinalRoll: number;
  finalDryStepCount: number;
  finalTrialOpportunityChance: number;
  finalTrialOpportunityRoll: number;
  trialOpportunityStepCap: number;
  rollHistoryJson: Json;
  explanation: string;
}
