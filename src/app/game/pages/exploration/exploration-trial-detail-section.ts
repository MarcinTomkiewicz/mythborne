import { Component, computed, input } from '@angular/core';
import {
  ExplorationDifficultyCopy,
  explorationDifficultyCardCopy,
  explorationDifficultyTrialLabel,
} from '../../../core/domain/game-copy/exploration-difficulty-copy.model';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ExplorationChanceMetricRow } from './exploration-chance-metric-row';

@Component({
  selector: 'app-exploration-trial-detail-section',
  standalone: true,
  imports: [ExplorationChanceMetricRow, RichText],
  templateUrl: './exploration-trial-detail-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationTrialDetailSection {
  readonly copy = input.required<ExplorationDifficultyCopy>();
  readonly difficulty = input.required<HeroExplorationDifficultyCardPreview>();

  readonly selectedDifficultyCopy = computed(() =>
    explorationDifficultyCardCopy(this.copy(), this.difficulty().difficultyKey),
  );

  trialLabel(statKey: string): string {
    return explorationDifficultyTrialLabel(this.copy(), statKey);
  }
}
