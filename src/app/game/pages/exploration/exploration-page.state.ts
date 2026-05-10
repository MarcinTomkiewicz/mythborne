import { Injectable, computed, inject } from '@angular/core';
import { GameServerKind } from '../../../core/enums/active-server.enum';
import { ExplorationStepSelectionDiagnosticReadModel } from '../../../core/domain/exploration/exploration-readiness.model';
import { HeroExplorationEdgeReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';

@Injectable()
export class ExplorationPageState {
  private readonly activeServer = inject(ActiveServer);
  readonly feedback = inject(ExplorationFeedbackState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly start = inject(ExplorationStartState);

  readonly difficulties = this.overview.difficulties;
  readonly state = this.overview.state;
  readonly selectedDifficultyKey = this.overview.selectedDifficultyKey;
  readonly selectedDifficulty = this.overview.selectedDifficulty;
  readonly isLoading = this.overview.isLoading;
  readonly isMoving = this.movement.isMoving;
  readonly isResolvingStep = this.step.isResolving;
  readonly isCompletingChallenge = this.challenge.isCompleting;
  readonly isStarting = this.start.isStarting;
  readonly edges = this.movement.edges;
  readonly activeStep = this.step.activeStep;
  readonly activeChallenge = this.challenge.activeChallenge;
  readonly isCombatChallenge = this.challenge.isCombatChallenge;
  readonly canStartCombat = this.challenge.canStartCombat;
  readonly canSubmitCombatStrike = this.challenge.canSubmitCombatStrike;
  readonly combatHitWindow = this.challenge.combatHitWindow;
  readonly combatWalkingSpeed = this.challenge.combatWalkingSpeed;
  readonly isCombatRunning = this.challenge.isCombatRunning;
  readonly isEnsuringCombatSession = this.challenge.isEnsuringCombatSession;
  readonly isSubmittingCombatAction = this.challenge.isSubmittingCombatAction;
  readonly combatLiveState = this.challenge.combatLiveState;
  readonly combatResultDetail = this.challenge.combatResultDetail;
  readonly combatTimingManifest = this.challenge.combatTimingManifest;
  readonly combatParticipants = this.challenge.combatParticipants;
  readonly combatEvents = this.challenge.combatEvents;
  readonly completedCombatLiveState = this.challenge.completedCombatLiveState;
  readonly currentCombatActor = this.challenge.currentCombatActor;
  readonly combatStatusLabel = this.challenge.combatStatusLabel;
  readonly combatRoundLabel = this.challenge.combatRoundLabel;
  readonly walkingPosition = this.challenge.walkingPosition;
  readonly activeStepProgressPercent = this.step.activeStepProgressPercent;
  readonly activeStepRemainingLabel = this.step.activeStepRemainingLabel;
  readonly activeStepStatusLabel = this.step.activeStepStatusLabel;
  readonly canCheckResult = this.step.canCheckResult;
  readonly currentStepResult = this.step.currentStepResult;
  readonly stepResultDescription = this.step.stepResultDescription;
  readonly stepResultFlavor = this.step.stepResultFlavor;
  readonly stepResultTitle = this.step.stepResultTitle;
  readonly canCompleteChallenge = this.challenge.canCompleteChallenge;
  readonly challengeFacts = this.challenge.challengeFacts;
  readonly challengeResultDescription = this.challenge.challengeResultDescription;
  readonly challengeResultTitle = this.challenge.challengeResultTitle;
  readonly challengeTitle = this.challenge.challengeTitle;
  readonly currentChallengeResult = this.challenge.currentChallengeResult;
  readonly autoResolveExplanation = this.challenge.autoResolveExplanation;
  readonly isLoadingReward = this.rewardState.isLoadingReward;
  readonly reward = this.rewardState.reward;
  readonly visibleRewardEntries = this.rewardState.visibleRewardEntries;
  readonly rewardSummary = this.rewardState.rewardSummary;
  readonly movementBlockReason = this.movement.movementBlockReason;
  readonly remainingTrialsLabel = this.overview.remainingTrialsLabel;
  readonly currentNodeLabel = this.overview.currentNodeLabel;
  readonly activeStepLabel = this.overview.activeStepLabel;
  readonly activeChallengeLabel = this.overview.activeChallengeLabel;
  readonly activeEffectLabel = this.overview.activeEffectLabel;
  readonly canShowSelectionDiagnostics = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return server?.kind === GameServerKind.Sandbox && access.canAccessSandbox;
  });
  readonly stepSelectionDiagnostic = computed(() =>
    this.canShowSelectionDiagnostics()
      ? this.currentStepResult()?.selectionDiagnostic ?? null
      : null,
  );

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

  completeChallenge(success: boolean): void {
    this.challenge.completeManually(success);
  }

  autoResolveChallenge(): void {
    this.challenge.autoResolve();
  }

  startCombatChallenge(): void {
    this.challenge.startCombat();
  }

  submitCombatChallengeStrike(): void {
    this.challenge.submitCombatStrike();
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

  diagnosticOutcomeLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    return this.humanizeDiagnosticKey(diagnostic.finalOutcomeKind);
  }

  diagnosticSelectionReason(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    if (diagnostic.forcedOverrideId) {
      return 'Sandbox override selected this outcome.';
    }

    if (diagnostic.readinessGuarded) {
      return 'DB readiness filtering was applied before selecting the final outcome.';
    }

    return 'Selected by the DB runtime selection flow.';
  }

  diagnosticDefinitionLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    const selected = diagnostic.selectedDefinition;

    if (!selected) {
      return 'No Trial or Encounter definition selected.';
    }

    const kind = selected.encounterKind
      ? `${this.humanizeDiagnosticKey(selected.encounterKind)} Encounter`
      : this.humanizeDiagnosticKey(selected.definitionKind);

    return `${kind}: ${selected.definitionKey}`;
  }

  diagnosticSkippedLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string | null {
    const skipped = diagnostic.skippedDefinition;

    if (!skipped) {
      return null;
    }

    const definition = skipped.definitionKey ?? skipped.definitionId ?? 'unknown definition';
    const reason = skipped.reasonKey ?? 'unspecified';

    return `${this.humanizeDiagnosticKey(skipped.definitionKind)} ${definition} skipped: ${reason}`;
  }

  diagnosticReasonLabels(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string[] {
    return [
      ...(diagnostic.selectedDefinition?.readinessReasons ?? []),
      ...(diagnostic.skippedDefinition?.readinessReasons ?? []),
    ].map((reason) =>
      [
        reason.label ?? reason.key,
        reason.description,
        reason.isBlocking === true ? 'blocking' : null,
      ]
        .filter(Boolean)
        .join(' - '),
    );
  }

  previewRows(difficultyKey: string): TrialOpportunityCurvePreview[] {
    return this.preview.previewRows(difficultyKey);
  }

  rewardEntryLabel = this.rewardState.entryLabel.bind(this.rewardState);
  rewardItemLabel = this.rewardState.itemLabel.bind(this.rewardState);
  rewardItemDetails = this.rewardState.itemDetails.bind(this.rewardState);
  participantHpLabel = this.challenge.participantHpLabel.bind(this.challenge);
  combatEventMetaLabel = this.challenge.eventMetaLabel.bind(this.challenge);
  timingManifestLabel = this.challenge.timingManifestLabel.bind(this.challenge);

  private humanizeDiagnosticKey(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ') || 'Unknown';
  }
}
