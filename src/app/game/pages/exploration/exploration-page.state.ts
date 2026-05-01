import { Injectable, inject } from '@angular/core';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationStartState } from './exploration-start.state';

@Injectable()
export class ExplorationPageState {
  readonly feedback = inject(ExplorationFeedbackState);
  readonly overview = inject(ExplorationOverviewState);
  readonly preview = inject(ExplorationPreviewState);
  readonly start = inject(ExplorationStartState);

  readonly difficulties = this.overview.difficulties;
  readonly state = this.overview.state;
  readonly selectedDifficultyKey = this.overview.selectedDifficultyKey;
  readonly selectedDifficulty = this.overview.selectedDifficulty;
  readonly isLoading = this.overview.isLoading;
  readonly isStarting = this.start.isStarting;
  readonly remainingTrialsLabel = this.overview.remainingTrialsLabel;
  readonly currentNodeLabel = this.overview.currentNodeLabel;
  readonly activeStepLabel = this.overview.activeStepLabel;
  readonly activeChallengeLabel = this.overview.activeChallengeLabel;
  readonly activeEffectLabel = this.overview.activeEffectLabel;

  loadData(): void {
    this.overview.loadData();
  }

  selectDifficulty(difficultyKey: string): void {
    this.overview.selectDifficulty(difficultyKey);
  }

  startSelectedDifficulty(): void {
    this.start.startSelectedDifficulty();
  }

  previewRows(difficultyKey: string): TrialOpportunityCurvePreview[] {
    return this.preview.previewRows(difficultyKey);
  }
}
