import { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';

export interface ExplorationMinigameReportPointer {
  heroId: string;
  difficultyKey: string;
  explorationId: string;
  sourceEntityId: string;
  sourceKind: ExplorationResultSourceKind;
  resultId: string | null;
  reportId: string | null;
  reportUnavailable?: boolean;
  reportUnavailableReason?: 'creation_failed' | 'detail_read_failed';
}
