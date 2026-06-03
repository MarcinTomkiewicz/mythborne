import {
  EncounterDefinitionReadModel,
  TrialDefinitionReadModel,
} from './exploration-definition.model';
import {
  EncounterEffectPayloadReadModel,
  ExplorationEffectDefinitionReadModel,
} from './exploration-encounter-admin.model';
import {
  EncounterReadinessReadModel,
  TrialReadinessReadModel,
} from './exploration-readiness.model';
import {
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from './exploration-reward.model';

export type ExplorationSmokeReadinessStatus = 'ready' | 'missing' | 'incomplete';

export type ExplorationSmokeReadinessRequirementKey =
  | 'combat_trial'
  | 'combat_encounter'
  | 'resource_encounter'
  | 'buff_encounter'
  | 'debuff_encounter'
  | 'trial_item_reward'
  | 'combat_encounter_xp_reward'
  | 'resource_reward'
  | 'buff_effect'
  | 'debuff_effect';

export interface ExplorationSmokeReadinessData {
  trials: TrialDefinitionReadModel[];
  encounters: EncounterDefinitionReadModel[];
  trialReadiness: TrialReadinessReadModel[];
  encounterReadiness: EncounterReadinessReadModel[];
  rewardAssignments: RewardProfileAssignmentReadModel[];
  rewardProfiles: RewardProfileReadModel[];
  rewardProfileEntries: RewardProfileEntryReadModel[];
  effectPayloads: EncounterEffectPayloadReadModel[];
  effectDefinitions: ExplorationEffectDefinitionReadModel[];
}

export interface ExplorationSmokeDefinitionSummary {
  id: string;
  key: string;
  label: string;
  kind: 'trial' | 'encounter';
  subtype: string | null;
}

export interface ExplorationSmokeRewardSummary {
  assignmentId: string | null;
  profileId: string | null;
  profileLabel: string | null;
  entryKinds: string[];
  activeEntryCount: number;
}

export interface ExplorationSmokeEffectSummary {
  payloadId: string | null;
  definitionId: string | null;
  definitionKey: string | null;
  label: string | null;
  summary: string | null;
  effectKind: string | null;
  isDefinitionActive: boolean | null;
}

export interface ExplorationSmokeReadinessItem {
  key: ExplorationSmokeReadinessRequirementKey;
  label: string;
  status: ExplorationSmokeReadinessStatus;
  definition: ExplorationSmokeDefinitionSummary | null;
  reward: ExplorationSmokeRewardSummary | null;
  effect: ExplorationSmokeEffectSummary | null;
  issues: string[];
}
