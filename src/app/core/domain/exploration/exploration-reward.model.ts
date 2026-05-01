import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type RewardProfileCategory = Row<'reward_profiles'>['category'];
export type RewardProfileEntryKind = Row<'reward_profile_entries'>['entry_kind'];
export type RewardGrantStatus = Row<'reward_grants'>['status'];

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

export interface RewardProfileAssignmentReadModel {
  id: string;
  rewardProfileId: string;
  sourceKind: string;
  outcomeKind: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  difficultyKey: string | null;
  districtCode: string | null;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
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
