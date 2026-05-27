import { Injectable, computed, inject, signal } from '@angular/core';
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

    this.minigameReportPointer.set({
      heroId: context.heroId,
      difficultyKey: context.difficultyKey,
      explorationId,
      sourceEntityId: event.sourceEntityId,
      resultId: event.resultId ?? null,
      reportId: event.reportId ?? null,
    });
    this.rewardState.preferCompletedChallengeReward(
      explorationId,
      activeChallenge.id,
    );
    this.overview.refreshCurrentState();
  }
}
