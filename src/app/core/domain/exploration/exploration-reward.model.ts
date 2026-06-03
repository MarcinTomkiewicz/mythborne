import { Json } from '../../types/database.types';
import type { PlayerItemDisplayCore } from '../item/player-item-display-core.model';
import { Row } from '../../types/supabase.types';
import { BalanceFormula } from '../formula/formula.model';

export type RewardProfileCategory = Row<'reward_profiles'>['category'];
export type RewardProfileEntryKind = Row<'reward_profile_entries'>['entry_kind'];
export type RewardGrantStatus = Row<'reward_grants'>['status'];

export interface RewardOutcomeKindReadModel {
  sourceKind: string;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface RewardProfileReadModel {
  id: string;
  key: string;
  label: string;
  category: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface RewardProfileEntryReadModel {
  id: string;
  rewardProfileId: string;
  entryKind: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  amountMode: string;
  minAmount: number | null;
  maxAmount: number | null;
  resourceType: string | null;
  formulaId: string | null;
  chancePercent: number;
  minItemCount: number | null;
  maxItemCount: number | null;
  maxQualityKey: string | null;
  bucketProfileId: string | null;
  effectDefinitionId: string | null;
  transferSourceRole: string | null;
  transferRecipientRole: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface RewardProfileEntrySummaryView {
  entryId: string;
  label: string;
  detail: string;
  dictionaryHelp: string | null;
}

export interface ResourceTypeReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface RewardDictionaryReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface RewardProfileAssignmentReadModel {
  id: string;
  rewardProfileId: string;
  sourceKind: string;
  outcomeKind: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  difficultyKey: string | null;
  difficultyMatchKind: string;
  maxDifficultyKey: string | null;
  districtCode: string | null;
  districtMatchKind: string;
  maxDistrictCode: string | null;
  levelMatchKind: string;
  levelValue: number | null;
  maxLevelValue: number | null;
  levelInterval: number | null;
  levelMatchLabel: string;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface LevelUpRewardRoutingReadModel {
  assignment: RewardProfileAssignmentReadModel;
  rewardProfile: RewardProfileReadModel | null;
  activeEntries: RewardProfileEntryReadModel[];
  selectedProfilePolicy: 'single_best_match';
  hasActiveExperienceEntry: boolean;
}

export interface RewardGrantReadModel {
  id: string;
  serverId: string;
  recipientHeroId: string;
  rewardProfileId: string;
  sourceKind: string;
  sourceId: string;
  status: string;
  reason: string | null;
  requestId: string | null;
  metadataJson: Json;
  grantedAt: string;
  createdAt: string;
}

export interface RewardGrantEntryReadModel {
  id: string;
  rewardGrantId: string;
  rewardProfileEntryId: string | null;
  entryKind: string;
  amount: number | null;
  resourceType: string | null;
  itemId: string | null;
  effectDefinitionId: string | null;
  sourceHeroId: string | null;
  targetHeroId: string | null;
  oldValueJson: Json | null;
  newValueJson: Json | null;
  metadataJson: Json;
  createdAt: string;
}

export interface ExplorationChallengeRewardReadModel {
  challengeAttemptId: string;
  challengeKind: string;
  stepId: string | null;
  outcomeKind: string | null;
  rewardSourceKind: string | null;
  rewardSourceId: string | null;
  rewardSourceLabel: string | null;
  status: string;
  success: boolean | null;
  completionMode: string | null;
  completedAt: string | null;
  rewardGrantId: string | null;
  rewardGrant: RewardGrantReadModel | null;
  entries: RewardGrantEntryReadModel[];
  items: ExplorationGeneratedRewardItemReadModel[];
  rewardStatusKey: string | null;
  rewardStatusLabel: string | null;
  rewardEntryCount: number | null;
  generatedItemCount: number | null;
  noRewardReasonKey: string | null;
  noRewardReasonLabel: string | null;
  noRewardReasonHelperText: string | null;
  explanation: string | null;
  rawJson: Json;
}

export interface ExplorationGeneratedRewardItemReadModel {
  id: string;
  displayCore: PlayerItemDisplayCore;
  rawJson: Json;
}

export interface RewardProfileAdminData {
  outcomeKinds: RewardOutcomeKindReadModel[];
  profiles: RewardProfileReadModel[];
  entries: RewardProfileEntryReadModel[];
  entryKinds: RewardDictionaryReadModel[];
  amountModes: RewardDictionaryReadModel[];
  sourceKinds: RewardDictionaryReadModel[];
  resourceTypes: ResourceTypeReadModel[];
  formulas: BalanceFormula[];
  qualities: Array<{
    key: string;
    label: string;
    sortOrder: number;
    isEnabled: boolean;
  }>;
  bucketProfiles: Array<{
    id: string | null;
    key: string;
    name: string;
    isActive: boolean;
  }>;
  effectDefinitions: Array<{
    id: string;
    key: string;
    label: string;
    effectKind: string;
    isActive: boolean;
  }>;
}

export interface UpsertRewardOutcomeKindInput {
  sourceKind: string;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface UpsertRewardProfileInput {
  rewardProfileId: string | null;
  key: string;
  label: string;
  category: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface UpsertRewardProfileEntryInput {
  entryId: string | null;
  rewardProfileId: string;
  entryKind: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  amountMode: string;
  minAmount: number | null;
  maxAmount: number | null;
  resourceType: string | null;
  formulaId: string | null;
  chancePercent: number;
  minItemCount: number | null;
  maxItemCount: number | null;
  maxQualityKey: string | null;
  bucketProfileId: string | null;
  effectDefinitionId: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}
