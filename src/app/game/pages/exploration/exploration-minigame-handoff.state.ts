import { Injectable, computed, inject, signal } from '@angular/core';
import type { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';
import type { HeroExplorationChallengeAttemptReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { MinigameCompletionEvent } from '../../components/minigame-host/minigame-host.model';
import { ExplorationMinigameReportPointer } from './exploration-minigame-handoff.model';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';

@Injectable()
export class ExplorationMinigameHandoffState {
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewardState = inject(ExplorationRewardState);

  private readonly minigameReportPointer = signal<ExplorationMinigameReportPointer | null>(null);
  readonly currentMinigameReportPointer = computed(() => {
    const pointer = this.minigameReportPointer();
    const context = this.overview.currentContext();
    const explorationId = this.overview.state()?.exploration?.id ?? null;

    return pointer &&
      context?.heroId === pointer.heroId &&
      context.difficultyKey === pointer.difficultyKey &&
      explorationId === pointer.explorationId
      ? pointer
      : null;
  });

  acceptMinigameCompletion(event: MinigameCompletionEvent): void {
    const state = this.overview.state();
    const activeChallenge = state?.activeChallenge ?? null;
    const context = this.overview.currentContext();
    const explorationId = state?.exploration?.id ?? null;

    if (!activeChallenge || !context || !explorationId || activeChallenge.id !== event.sourceEntityId) {
      return;
    }

    const sourceKind = minigameReportSourceKind(activeChallenge);
    const reportId = requiredCompletionReportId(event);

    this.acceptReportPointer({
      heroId: context.heroId,
      difficultyKey: context.difficultyKey,
      explorationId,
      sourceEntityId: event.sourceEntityId,
      sourceKind,
      resultId: event.resultId ?? null,
      reportId,
    });
  }

  clearMinigameReportPointer(): void {
    this.minigameReportPointer.set(null);
  }

  private acceptReportPointer(pointer: ExplorationMinigameReportPointer): void {
    this.minigameReportPointer.set({
      heroId: pointer.heroId,
      difficultyKey: pointer.difficultyKey,
      explorationId: pointer.explorationId,
      sourceEntityId: pointer.sourceEntityId,
      sourceKind: pointer.sourceKind,
      resultId: pointer.resultId,
      reportId: pointer.reportId,
    });
    this.rewardState.preferCompletedChallengeReward(
      pointer.explorationId,
      pointer.sourceEntityId,
    );
    this.overview.refreshCurrentState();
  }
}

function minigameReportSourceKind(
  challenge: HeroExplorationChallengeAttemptReadModel,
): ExplorationResultSourceKind {
  if (challenge.trialDefinitionId) {
    return 'trial';
  }

  if (challenge.encounterDefinitionId) {
    return 'encounter';
  }

  return 'unknown';
}

function requiredCompletionReportId(event: MinigameCompletionEvent): string {
  if (!event.reportId) {
    throw new Error(
      'MinigameCompletionEvent.reportId is required after combat completion; check combat RPC finalization game_report_id.',
    );
  }

  return event.reportId;
}
