import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ExplorationMinigameCompletionHandoff,
  explorationMinigameResultSourceKind,
} from '../../../core/domain/exploration/exploration-minigame-handoff.model';
import type { MinigameCompletionEvent } from '../../../core/domain/minigame/minigame-completion.model';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';

@Injectable()
export class ExplorationMinigameHandoffState {
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewardState = inject(ExplorationRewardState);

  private readonly minigameCompletion =
    signal<ExplorationMinigameCompletionHandoff | null>(null);
  readonly currentMinigameCompletion = computed(() => {
    const completion = this.minigameCompletion();
    const context = this.overview.currentContext();
    const explorationId = this.overview.state()?.exploration?.id ?? null;

    return completion &&
      context?.heroId === completion.heroId &&
      context.difficultyKey === completion.difficultyKey &&
      explorationId === completion.explorationId
      ? completion
      : null;
  });
  readonly currentMinigameReportPointer = computed(() => {
    const completion = this.currentMinigameCompletion();

    return completion?.reportId
      ? { ...completion, reportId: completion.reportId }
      : null;
  });

  acceptMinigameCompletion(event: MinigameCompletionEvent): void {
    const state = this.overview.state();
    const activeChallenge = state?.activeChallenge ?? null;
    const context = this.overview.currentContext();
    const explorationId = state?.exploration?.id ?? null;

    if (
      !activeChallenge
      || !context
      || !explorationId
      || activeChallenge.id !== event.sourceEntityId
      || !activeChallenge.minigameKey
      || activeChallenge.minigameKey !== event.minigameKey
    ) {
      return;
    }

    const completion: ExplorationMinigameCompletionHandoff = {
      heroId: context.heroId,
      difficultyKey: context.difficultyKey,
      explorationId,
      sourceEntityId: event.sourceEntityId,
      sourceKind: explorationMinigameResultSourceKind(activeChallenge),
      resultId: event.resultId ?? null,
      reportId: event.reportId ?? null,
      presentationSource: event.presentationSource ?? null,
    };

    this.minigameCompletion.set(completion);
    this.rewardState.preferCompletedChallengeReward(
      completion.explorationId,
      completion.sourceEntityId,
    );
    this.overview.refreshCurrentState();
  }

  attachCompletionReport(
    sourceEntityId: string,
    resultId: string,
    reportId: string,
  ): void {
    const completion = this.currentMinigameCompletion();

    if (
      !completion
      || completion.reportId
      || completion.sourceEntityId !== sourceEntityId
      || completion.resultId !== resultId
    ) {
      return;
    }

    this.minigameCompletion.set({ ...completion, reportId });
  }

  clearMinigameCompletion(): void {
    this.minigameCompletion.set(null);
  }
}
