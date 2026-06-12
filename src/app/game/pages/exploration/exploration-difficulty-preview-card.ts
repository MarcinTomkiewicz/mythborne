import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  ExplorationDifficultyCopy,
  explorationDifficultyCardCopy,
} from '../../../core/domain/game-copy/exploration-difficulty-copy.model';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { explorationDifficultyCardBackgroundClass } from '../../../core/config/exploration-card-backgrounds.config';
import {
  requiredSemanticIconClass,
  semanticIconToneClass,
} from '../../../core/utils/semantic-icon-class';
import { ExplorationChanceMetricRow } from './exploration-chance-metric-row';

@Component({
  selector: 'app-exploration-difficulty-preview-card',
  standalone: true,
  imports: [ButtonModule, ExplorationChanceMetricRow],
  templateUrl: './exploration-difficulty-preview-card.html',
  host: { class: 'd-block w-100 h-100' },
})
export class ExplorationDifficultyPreviewCard {
  readonly copy = input.required<ExplorationDifficultyCopy>();
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
    && this.difficulty().isUnlocked
    && !this.isBusy(),
  );
  readonly cardCopy = computed(() =>
    explorationDifficultyCardCopy(this.copy(), this.difficulty().difficultyKey),
  );
  readonly backgroundClass = computed(() =>
    explorationDifficultyCardBackgroundClass(this.difficulty().difficultyKey),
  );

  readonly actionLabel = computed(() => {
    const actions = this.copy().difficulty.actions;

    return this.explorationState()?.hasExploration
      ? actions.continueExploration
      : actions.startExploration;
  });

  readonly actionDisabled = computed(() => {
    const preview = this.difficulty();
    const state = this.explorationState();

    return !preview.isAvailable || !preview.isUnlocked || this.isBusy() || !state;
  });

  lockedIconClass(iconKey: string): string {
    return requiredSemanticIconClass(iconKey, 'lockedDisplay.iconKey');
  }

  lockedToneClass(tone: 'danger'): string {
    return semanticIconToneClass(tone);
  }

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
