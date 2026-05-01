import { Json } from '../../types/database.types';
import {
  HeroExplorationChallengeCompletionReadModel,
  HeroExplorationDebugStateReadModel,
  HeroExplorationStepResolutionReadModel,
} from './exploration-runtime.model';

export interface ExplorationDebugScopeInput {
  serverId: string;
  heroId: string;
  explorationDate?: string | null;
}

export interface ExplorationDebugStateResult {
  state: HeroExplorationDebugStateReadModel;
}

export interface AddHeroRemainingActionsInput {
  serverId: string;
  heroId: string;
  actionKind: string;
  amount: number;
  reason: string;
  actionDate?: string | null;
}

export interface AddHeroRemainingActionsResult {
  serverId: string;
  heroId: string;
  actionKind: string;
  actionDate: string;
  remainingCount: number;
  counterId: string;
}

export interface ResetHeroExplorationInput {
  serverId: string;
  heroId: string;
  reason: string;
  difficultyKey?: string | null;
  explorationDate?: string | null;
}

export interface ResetHeroExplorationResult {
  resetCount: number;
}

export interface SkipHeroExplorationStepTimerInput {
  serverId: string;
  stepId: string;
  reason: string;
}

export type SkipHeroExplorationStepTimerResult =
  HeroExplorationStepResolutionReadModel;

export interface TestGrantRewardProfileToHeroInput {
  serverId: string;
  heroId: string;
  rewardProfileId: string;
  reason: string;
}

export interface TestGrantRewardProfileToHeroResult {
  rewardGrantId: string;
  rewardProfileId: string;
  recipientHeroId: string;
  status: string;
  entriesJson: Json;
}

export interface SetNextHeroExplorationOutcomeOverrideInput {
  serverId: string;
  heroId: string;
  difficultyKey: string;
  forcedOutcomeKind: string;
  reason: string;
  trialDefinitionId?: string | null;
  encounterDefinitionId?: string | null;
  forceManifestationStatus?: string | null;
  expiresInMinutes?: number | null;
}

export interface SetNextHeroExplorationOutcomeOverrideResult {
  overrideId: string;
  serverId: string;
  heroId: string;
  difficultyKey: string;
  forcedOutcomeKind: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  forceManifestationStatus: string | null;
  expiresAt: string;
}

export interface ForceCompleteHeroExplorationChallengeAttemptInput {
  serverId: string;
  challengeAttemptId: string;
  success: boolean;
  reason: string;
}

export type ForceCompleteHeroExplorationChallengeAttemptResult =
  HeroExplorationChallengeCompletionReadModel;
