import { HeroExplorationChallengeCompletionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';

export interface ChallengeFact {
  label: string;
  value: string;
}

export interface ChallengeCompletionSnapshot {
  result: HeroExplorationChallengeCompletionReadModel;
  explorationId: string | null;
}
