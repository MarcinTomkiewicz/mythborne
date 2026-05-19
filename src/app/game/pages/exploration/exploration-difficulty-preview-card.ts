import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationChanceMetricRow } from './exploration-chance-metric-row';

@Component({
  selector: 'app-exploration-difficulty-preview-card',
  standalone: true,
  imports: [ButtonModule, ExplorationChanceMetricRow],
  templateUrl: './exploration-difficulty-preview-card.html',
  host: { class: 'd-block w-100 h-100' },
})
export class ExplorationDifficultyPreviewCard {
  readonly difficulty = input.required<HeroExplorationDifficultyCardPreview>();
  readonly isSelected = input.required<boolean>();
  readonly isBusy = input(false);
  readonly selectDifficulty = output<string>();
}
