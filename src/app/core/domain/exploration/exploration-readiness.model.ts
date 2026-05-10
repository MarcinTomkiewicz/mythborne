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

export interface ExplorationSelectedDefinitionReadModel {
  definitionKind: Exclude<ExplorationStepOutcomeKind, 'nothing'>;
  definitionId: string;
  definitionKey: string;
  isReady: boolean;
  encounterKind: string | null;
  readinessReasons: ExplorationReadinessReasonReadModel[];
}

export interface ExplorationSkippedDefinitionReadModel {
  definitionKind: Exclude<ExplorationStepOutcomeKind, 'nothing'>;
  definitionId: string | null;
  definitionKey: string | null;
  reasonKey: string | null;
  readinessReasons: ExplorationReadinessReasonReadModel[];
}

export interface ExplorationStepSelectionDiagnosticReadModel {
  stepId: string;
  serverId: string;
  heroId: string;
  explorationId: string;
  stepKind: string;
  stepStatus: string;
  resolutionAttemptId: string | null;
  resolutionAttemptStatus: string | null;
  rewardGrantId: string | null;
  outcomeKind: ExplorationStepOutcomeKind;
  readinessGuarded: boolean;
  forcedOverrideId: string | null;
  trialOpportunityChance: number | null;
  trialOpportunityRoll: number | null;
  encounterChance: number | null;
  encounterRoll: number | null;
  selectedDefinition: ExplorationSelectedDefinitionReadModel | null;
  skippedDefinition: ExplorationSkippedDefinitionReadModel | null;
  finalOutcomeKind: ExplorationStepOutcomeKind;
  selectedAt: string | null;
  metadataJson: Json;
}
