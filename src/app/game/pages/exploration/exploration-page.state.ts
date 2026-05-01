import { Injectable, inject } from '@angular/core';
import { HeroExplorationEdgeReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';

@Injectable()
export class ExplorationPageState {
  readonly feedback = inject(ExplorationFeedbackState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly start = inject(ExplorationStartState);

  readonly difficulties = this.overview.difficulties;
  readonly state = this.overview.state;
  readonly selectedDifficultyKey = this.overview.selectedDifficultyKey;
  readonly selectedDifficulty = this.overview.selectedDifficulty;
  readonly isLoading = this.overview.isLoading;
  readonly isMoving = this.movement.isMoving;
  readonly isResolvingStep = this.step.isResolving;
  readonly isStarting = this.start.isStarting;
  readonly edges = this.movement.edges;
  readonly activeStep = this.step.activeStep;
  readonly activeStepProgressPercent = this.step.activeStepProgressPercent;
  readonly activeStepRemainingLabel = this.step.activeStepRemainingLabel;
  readonly activeStepStatusLabel = this.step.activeStepStatusLabel;
  readonly canCheckResult = this.step.canCheckResult;
  readonly currentStepResult = this.step.currentStepResult;
  readonly stepResultDescription = this.step.stepResultDescription;
  readonly stepResultFlavor = this.step.stepResultFlavor;
  readonly stepResultTitle = this.step.stepResultTitle;
  readonly movementBlockReason = this.movement.movementBlockReason;
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

  checkStepResult(): void {
    this.step.checkResult();
  }

  chooseDirection(edge: HeroExplorationEdgeReadModel): void {
    this.movement.chooseDirection(edge);
  }

  canChooseDirection(edge: HeroExplorationEdgeReadModel): boolean {
    return this.movement.canChooseDirection(edge);
  }

  directionLabel(edge: HeroExplorationEdgeReadModel): string {
    return this.movement.directionLabel(edge);
  }

  edgeStatusLabel(edge: HeroExplorationEdgeReadModel): string {
    return this.movement.edgeStatusLabel(edge);
  }

  previewRows(difficultyKey: string): TrialOpportunityCurvePreview[] {
    return this.preview.previewRows(difficultyKey);
  }
}
