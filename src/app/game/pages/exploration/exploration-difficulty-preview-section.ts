import { Component, input, output } from '@angular/core';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ExplorationDifficultyPreviewCard } from './exploration-difficulty-preview-card';
import { ExplorationTrialDetailSection } from './exploration-trial-detail-section';

@Component({
  selector: 'app-exploration-difficulty-preview-section',
  standalone: true,
  imports: [ExplorationDifficultyPreviewCard, ExplorationTrialDetailSection],
  templateUrl: './exploration-difficulty-preview-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationDifficultyPreviewSection {
  readonly difficulties = input.required<HeroExplorationDifficultyCardPreview[]>();
  readonly selectedDifficulty =
    input<HeroExplorationDifficultyCardPreview | null>(null);
  readonly selectedDifficultyKey = input<string | null>(null);
  readonly explorationState = input<HeroExplorationStateReadModel | null>(null);
  readonly isBusy = input(false);
  readonly isStarting = input(false);
  readonly isLoading = input(false);
  readonly selectDifficulty = output<string>();
  readonly selectedDifficultyAction = output<void>();
}
