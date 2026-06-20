import { Json } from '../../types/database.types';

export type ExplorationDefinitionKind = 'trial' | 'encounter';
export type ExplorationStepOutcomeKind = 'trial' | 'encounter' | 'nothing';
export type ExplorationReadinessStatusKey = 'ready' | 'inactive' | 'incomplete';

export interface ExplorationReadinessReasonMetadataReadModel {
  key: string;
  label: string;
  description: string | null;
  severity: string;
  isBlocking: boolean;
  isActive: boolean;
  sortOrder: number;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationReadinessReasonReadModel {
  key: string;
  label: string | null;
  description: string | null;
  severity: string | null;
  isBlocking: boolean | null;
  metadataJson: Json;
}

export interface ExplorationDefinitionReadinessReadModel {
  definitionKind: ExplorationDefinitionKind;
  definitionId: string;
  definitionKey: string;
  isActive: boolean;
  isReady: boolean;
  statusKey: ExplorationReadinessStatusKey;
  minigameKey: string | null;
  encounterKind: string | null;
  combatCandidateCount: number;
  rewardAssignmentCount: number;
  effectPayloadCount: number;
  blockingReasonCount: number;
  reasons: ExplorationReadinessReasonReadModel[];
  metadataJson: Json;
}

export type TrialReadinessReadModel = ExplorationDefinitionReadinessReadModel & {
  definitionKind: 'trial';
};

export type EncounterReadinessReadModel = ExplorationDefinitionReadinessReadModel & {
  definitionKind: 'encounter';
};
