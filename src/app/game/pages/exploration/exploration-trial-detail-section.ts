import { Component, input } from '@angular/core';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationChanceMetricRow } from './exploration-chance-metric-row';

@Component({
  selector: 'app-exploration-trial-detail-section',
  standalone: true,
  imports: [ExplorationChanceMetricRow],
  templateUrl: './exploration-trial-detail-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationTrialDetailSection {
  readonly difficulty = input.required<HeroExplorationDifficultyCardPreview>();
}
