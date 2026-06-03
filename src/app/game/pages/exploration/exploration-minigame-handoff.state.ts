import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';
import type { HeroExplorationChallengeAttemptReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { GameReportProducers } from '../../../core/services/reports/game-report-producers';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';
import { MINIGAME_KEY, MinigameCompletionEvent } from '../../components/minigame-host/minigame-host.model';
import { ExplorationMinigameReportPointer } from './exploration-minigame-handoff.model';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';

@Injectable()
export class ExplorationMinigameHandoffState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly reportProducers = inject(GameReportProducers);
  private readonly rewardState = inject(ExplorationRewardState);
  private readonly reportToken = new RequestToken();

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
    const token = this.reportToken.next();
    const state = this.overview.state();
    const activeChallenge = state?.activeChallenge ?? null;
    const context = this.overview.currentContext();
    const explorationId = state?.exploration?.id ?? null;

    if (!activeChallenge || !context || !explorationId || activeChallenge.id !== event.sourceEntityId) {
      return;
    }

    const sourceKind = minigameReportSourceKind(activeChallenge);

    if (
      event.minigameKey === MINIGAME_KEY.combat &&
      !event.reportId &&
      event.resultId
    ) {
      const requestId = createRequestId(
        `exploration:${context.heroId}:${context.difficultyKey}:combat-report:${event.sourceEntityId}`,
      );

      this.acceptReportPointer({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        explorationId,
        sourceEntityId: event.sourceEntityId,
        sourceKind,
        resultId: event.resultId,
        reportId: null,
      });

      this.reportProducers.createCombatReportFromResult({
        combatResultId: event.resultId,
        ownerHeroId: context.heroId,
        reason: 'Exploration combat minigame completion handoff.',
        requestId,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (report) => {
            if (!this.isCurrentCompletionContext(token, context, explorationId)) {
              return;
            }

            this.updateReportPointerReportId({
              heroId: context.heroId,
              difficultyKey: context.difficultyKey,
              explorationId,
              sourceEntityId: event.sourceEntityId,
              sourceKind,
              resultId: event.resultId ?? null,
              reportId: report.reportId,
            });
          },
          error: () => {
            if (this.isCurrentCompletionContext(token, context, explorationId)) {
              this.markReportPointerUnavailable({
                heroId: context.heroId,
                difficultyKey: context.difficultyKey,
                explorationId,
                sourceEntityId: event.sourceEntityId,
                sourceKind,
                resultId: event.resultId ?? null,
                reportId: null,
              });
            }
          },
        });
      return;
    }

    this.acceptReportPointer({
      heroId: context.heroId,
      difficultyKey: context.difficultyKey,
      explorationId,
      sourceEntityId: event.sourceEntityId,
      sourceKind,
      resultId: event.resultId ?? null,
      reportId: event.reportId ?? null,
    });
  }

  clearMinigameReportPointer(): void {
    this.reportToken.next();
    this.minigameReportPointer.set(null);
  }

  markReportDetailUnavailable(reportId: string): void {
    const pointer = this.minigameReportPointer();

    if (!pointer || pointer.reportId !== reportId) {
      return;
    }

    this.minigameReportPointer.set({
      ...pointer,
      reportUnavailable: true,
      reportUnavailableReason: 'detail_read_failed',
    });
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
      reportUnavailable: pointer.reportUnavailable ?? false,
      reportUnavailableReason: pointer.reportUnavailableReason,
    });
    this.rewardState.preferCompletedChallengeReward(
      pointer.explorationId,
      pointer.sourceEntityId,
    );
    this.overview.refreshCurrentState();
  }

  private updateReportPointerReportId(
    next: ExplorationMinigameReportPointer,
  ): void {
    const pointer = this.minigameReportPointer();

    if (
      !pointer ||
      pointer.heroId !== next.heroId ||
      pointer.difficultyKey !== next.difficultyKey ||
      pointer.explorationId !== next.explorationId ||
      pointer.sourceEntityId !== next.sourceEntityId ||
      pointer.resultId !== next.resultId
    ) {
      return;
    }

    this.minigameReportPointer.set({
      ...pointer,
      reportId: next.reportId,
      reportUnavailable: false,
      reportUnavailableReason: undefined,
    });
  }

  private markReportPointerUnavailable(context: ExplorationMinigameReportPointer): void {
    const pointer = this.minigameReportPointer();

    if (
      pointer &&
      pointer.heroId === context.heroId &&
      pointer.difficultyKey === context.difficultyKey &&
      pointer.explorationId === context.explorationId &&
      pointer.sourceEntityId === context.sourceEntityId &&
      pointer.resultId === context.resultId
    ) {
      this.minigameReportPointer.set({
        ...pointer,
        reportUnavailable: true,
        reportUnavailableReason: 'creation_failed',
      });
    }
  }

  private isCurrentCompletionContext(
    token: number,
    context: { heroId: string; difficultyKey: string },
    explorationId: string,
  ): boolean {
    const state = this.overview.state();
    const currentContext = this.overview.currentContext();

    return this.reportToken.isCurrent(token) &&
      currentContext?.heroId === context.heroId &&
      currentContext.difficultyKey === context.difficultyKey &&
      state?.exploration?.id === explorationId;
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
