import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
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
  readonly isStarting = input(false);
  readonly explorationState = input<HeroExplorationStateReadModel | null>(null);
  readonly selectDifficulty = output<string>();
  readonly selectedDifficultyAction = output<void>();

  readonly canSelectCard = computed(() =>
    !this.isSelected()
    && this.difficulty().isAvailable
    && !this.isBusy(),
  );

  readonly actionLabel = computed(() => {
    const preview = this.difficulty();

    if (!preview.isAvailable) {
      return 'Niedostępne';
    }

    const state = this.explorationState();

    if (!state) {
      return this.isBusy() ? 'Ładowanie statusu' : 'Status niedostępny';
    }

    if (!state.hasExploration) {
      return 'Rozpocznij eksplorację';
    }

    return 'Kontynuuj wyprawę';
  });

  readonly actionDisabled = computed(() => {
    const preview = this.difficulty();

    if (!preview.isAvailable) {
      return true;
    }

    const state = this.explorationState();

    return this.isBusy() || !state;
  });

  selectCard(): void {
    if (this.canSelectCard()) {
      this.selectDifficulty.emit(this.difficulty().difficultyKey);
    }
  }

  selectCardFromKeyboard(event: Event): void {
    if (!this.canSelectCard()) {
      return;
    }

    event.preventDefault();
    this.selectCard();
  }

  handleSelectedDifficultyAction(): void {
    if (this.actionDisabled()) {
      return;
    }

    this.selectedDifficultyAction.emit();
  }
}
