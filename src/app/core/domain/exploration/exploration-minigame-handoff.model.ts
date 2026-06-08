export type ExplorationResultSourceKind = 'trial' | 'encounter' | 'unknown';

export interface ExplorationMinigameReportPointer {
  heroId: string;
  difficultyKey: string;
  explorationId: string;
  sourceEntityId: string;
  sourceKind: ExplorationResultSourceKind;
  resultId: string | null;
  reportId: string;
}
