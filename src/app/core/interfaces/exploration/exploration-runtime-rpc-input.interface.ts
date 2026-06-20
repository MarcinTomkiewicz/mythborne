import { Json } from '../../types/database.types';
import { StartHeroExplorationStepRpcArgs } from '../../types/exploration-runtime-rpc.types';

export interface GetHeroExplorationStateRpcInput {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
}

export interface GetHeroExplorationDifficultyCardPreviewsRpcInput {
  heroId: string | null | undefined;
  stepsToPreview?: number | null;
}

export interface StartOrGetHeroExplorationRpcInput {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
}

export interface StartOrGetHeroExplorationAndStartInitialStepRpcInput {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
  requestId: string | null | undefined;
}

export type StartHeroExplorationStepRpcArgsWithNullableEdge =
  Omit<StartHeroExplorationStepRpcArgs, 'p_edge_id'> & {
    p_edge_id?: string | null;
  };

export interface StartHeroExplorationStepRpcInput {
  explorationId: string | null | undefined;
  edgeId: string | null | undefined;
  stepKind: string | null | undefined;
}

export interface ResolveHeroExplorationStepRpcInput {
  stepId: string | null | undefined;
}

export interface CompleteHeroExplorationChallengeAttemptRpcInput {
  challengeAttemptId: string | null | undefined;
  success: boolean;
  completionMode?: string | null;
  score?: number | null;
  performanceRating?: string | null;
  detailsJson?: Json;
  requestId?: string | null;
}

export interface AutoResolveHeroExplorationChallengeAttemptRpcInput {
  challengeAttemptId: string | null | undefined;
  requestId?: string | null;
}

export interface AutoResolveCombatSessionRpcInput {
  sourceEntityType: string | null | undefined;
  sourceEntityId: string | null | undefined;
  requestId: string | null | undefined;
}

export interface PreviewTrialOpportunityCurveRpcInput {
  difficultyKey: string | null | undefined;
  startingDryStepCount?: number | null;
  stepsToPreview?: number | null;
}
