import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type HeroExplorationStatus = Row<'hero_explorations'>['status'];
export type HeroExplorationStepStatus = Row<'hero_exploration_steps'>['status'];
export type HeroExplorationOutcomeKind = Row<'hero_exploration_steps'>['outcome_kind'];
export type HeroExplorationChallengeStatus =
  Row<'hero_exploration_challenge_attempts'>['status'];

export interface HeroDailyActionCounterReadModel {
  id: string;
  serverId: string;
  heroId: string;
  actionKind: string;
  actionDate: string;
  remainingCount: number;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationReadModel {
  id: string;
  serverId: string;
  heroId: string;
  difficultyKey: string;
  districtCode: string;
  explorationDate: string;
  status: string;
  currentNodeId: string | null;
  trialDryStepCount: number;
  metadataJson: Json;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationNodeReadModel {
  id: string;
  serverId: string;
  explorationId: string;
  parentNodeId: string | null;
  descriptionId: string | null;
  label: string | null;
  createdSequence: number;
  distanceFromRoot: number;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationEdgeReadModel {
  id: string;
  serverId: string;
  explorationId: string;
  fromNodeId: string;
  toNodeId: string | null;
  directionKey: string;
  label: string;
  sortOrder: number;
  isAvailable: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationStepReadModel {
  id: string;
  serverId: string;
  heroId: string;
  explorationId: string;
  edgeId: string | null;
  fromNodeId: string;
  toNodeId: string | null;
  directionKey: string | null;
  stepKind: string;
  status: string;
  outcomeKind: string;
  difficultyKey: string;
  districtCode: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  trialOpportunityChance: number | null;
  trialOpportunityRoll: number | null;
  encounterChance: number | null;
  encounterRoll: number | null;
  rng?: HeroExplorationStepRngReadModel;
  metadataJson: Json;
  startedAt: string;
  resolvesAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationRngRollReadModel {
  surfaceKey: 'trial_opportunity' | 'encounter';
  chance: number | null;
  roll: number | null;
  selectedEntityId: string | null;
  luckValue: number | null;
  luckInfluence: number | null;
  explanation: string | null;
  metadataJson: Json;
}

export interface HeroExplorationNothingFallbackReadModel {
  isFallback: boolean;
  outcomeKind: string;
  reason: string | null;
}

export interface HeroExplorationStepRngReadModel {
  finalOutcomeKind: string;
  trialOpportunity: HeroExplorationRngRollReadModel;
  encounter: HeroExplorationRngRollReadModel;
  nothingFallback: HeroExplorationNothingFallbackReadModel;
  luckContextJson: Json;
  formulaContextJson: Json;
  explanation: string | null;
}

export interface HeroExplorationTrialManifestationReadModel {
  status: string;
  chance: number | null;
  roll: number | null;
  trialDefinitionId: string | null;
  testedStatKey: string | null;
  luckValue: number | null;
  luckInfluence: number | null;
  trialPower: number | null;
  configIssueKey: string | null;
  configIssueMessage: string | null;
  explanation: string | null;
  metadataJson: Json;
  formulaContextJson: Json;
}

export interface HeroExplorationEffectReadModel {
  id: string;
  serverId: string;
  heroId: string;
  explorationId: string;
  effectDefinitionId: string;
  effectKind: string;
  sourceKind: string;
  sourceId: string | null;
  isActive: boolean;
  appliedAt: string;
  consumedAt: string | null;
  consumedByKind: string | null;
  consumedById: string | null;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationChallengeAttemptReadModel {
  id: string;
  serverId: string;
  heroId: string;
  explorationId: string;
  stepId: string;
  challengeKind: string;
  status: string;
  difficultyKey: string;
  districtCode: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  minigameKey: string | null;
  testedStatKey: string | null;
  manifestationStatus: string;
  manifestationChance: number | null;
  manifestationRoll: number | null;
  manifestation: HeroExplorationTrialManifestationReadModel;
  manualDeadlineAt: string | null;
  completionMode: string | null;
  performanceRating: string | null;
  score: number | null;
  success: boolean | null;
  rewardGrantId: string | null;
  autoResolveChance: number | null;
  autoResolveRoll: number | null;
  detailsJson: Json;
  metadataJson: Json;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationTestOverrideReadModel {
  id: string;
  serverId: string;
  heroId: string;
  difficultyKey: string;
  overrideKind: string;
  forcedOutcomeKind: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  forceManifestationStatus: string | null;
  reason: string;
  isConsumed: boolean;
  consumedAt: string | null;
  consumedByStepId: string | null;
  expiresAt: string;
  createdBy: string | null;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface HeroExplorationStateReadModel {
  hasExploration: boolean;
  heroId: string;
  difficultyKey: string;
  explorationDate: string;
  remainingTrials: number;
  exploration: HeroExplorationReadModel | null;
  currentNode: HeroExplorationNodeReadModel | null;
  edges: HeroExplorationEdgeReadModel[];
  activeStep: HeroExplorationStepReadModel | null;
  activeChallenge: HeroExplorationChallengeAttemptReadModel | null;
  activeEffect: HeroExplorationEffectReadModel | null;
  rawJson: Json;
}

export interface HeroExplorationStepResolutionReadModel {
  stepId: string;
  explorationId: string;
  status: string;
  outcomeKind: string;
  currentNodeId: string | null;
  toNodeId: string | null;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  challengeAttemptId: string | null;
  remainingTrials: number;
  trialDryStepCount: number;
  metadataJson: Json;
}

export interface HeroExplorationStepResolutionWorkflowResult {
  result: HeroExplorationStepResolutionReadModel;
  state: HeroExplorationStateReadModel;
}

export interface HeroExplorationChallengeCompletionReadModel {
  challengeAttemptId: string;
  status: string;
  success: boolean;
  completionMode: string;
  rewardGrantId: string | null;
  remainingTrials: number | null;
  explorationStatus: string | null;
  autoResolveChance: number | null;
  autoResolveRoll: number | null;
  combatResultId?: string | null;
  combatOutcome?: string | null;
  turnsCompleted?: number | null;
  participantsCreated?: number | null;
  participantStatsCreated?: number | null;
  attacksCreated?: number | null;
}

export interface HeroExplorationChallengeCompletionWorkflowResult {
  result: HeroExplorationChallengeCompletionReadModel;
  state: HeroExplorationStateReadModel;
}

export interface HeroExplorationDebugEntryReadModel {
  exploration: HeroExplorationReadModel;
  remainingTrials: number | null;
  currentNode: HeroExplorationNodeReadModel | null;
  edges: HeroExplorationEdgeReadModel[];
  activeStep: HeroExplorationStepReadModel | null;
  activeChallenge: HeroExplorationChallengeAttemptReadModel | null;
  activeEffect: HeroExplorationEffectReadModel | null;
  recentSteps: HeroExplorationStepReadModel[];
  recentChallenges: HeroExplorationChallengeAttemptReadModel[];
  testOverrides: HeroExplorationTestOverrideReadModel[];
}

export interface HeroExplorationDebugStateReadModel {
  serverId: string;
  heroId: string;
  explorationDate: string;
  counters: HeroDailyActionCounterReadModel[];
  explorations: HeroExplorationDebugEntryReadModel[];
  rawJson: Json;
}
