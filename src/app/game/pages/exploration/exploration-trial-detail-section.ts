import { Component, input } from '@angular/core';
import {
  ExplorationDifficultyCopy,
  explorationDifficultyTrialLabel,
} from '../../../core/domain/game-copy/exploration-difficulty-copy.model';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { explorationTrialCardBackgroundClass } from '../../../core/config/exploration-card-backgrounds.config';
import {
  requiredSemanticIconClass,
  semanticIconToneClass,
} from '../../../core/utils/semantic-icon-class';
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

  trialLabel(statKey: string): string {
    return explorationDifficultyTrialLabel(this.copy(), statKey);
  }

  trialBackgroundClass(statKey: string): string {
    return explorationTrialCardBackgroundClass(statKey);
  }

  trialCompletionIconClass(iconKey: string): string {
    return requiredSemanticIconClass(
      iconKey,
      'trialCompletionRows.display.iconKey',
    );
  }

  trialCompletionToneClass(tone: 'success' | 'danger'): string {
    return semanticIconToneClass(tone);
  }
}
