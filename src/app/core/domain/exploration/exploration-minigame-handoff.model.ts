import type { ManualTrialCompletionPresentation } from '../minigame/minigame-completion.model';
import type { HeroExplorationChallengeAttemptReadModel } from './exploration-runtime.model';

export type ExplorationResultSourceKind = 'trial' | 'encounter' | 'unknown';

export interface ExplorationMinigameCompletionHandoff {
  heroId: string;
  difficultyKey: string;
  explorationId: string;
  sourceEntityId: string;
  sourceKind: ExplorationResultSourceKind;
  resultId: string | null;
  reportId: string | null;
  presentationSource: ManualTrialCompletionPresentation | null;
}

export function explorationMinigameResultSourceKind(
  challenge: HeroExplorationChallengeAttemptReadModel,
): ExplorationResultSourceKind {
  if (challenge.trialDefinitionId) {
    return 'trial';
  }

  if (challenge.encounterDefinitionId) {
    return 'encounter';
  }

  return 'unknown';
}
