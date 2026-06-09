import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { EXPLORATION_RUNTIME_COPY } from '../../../core/constants/exploration-runtime-copy.const';
import {
  ExplorationChallengeRewardReadModel,
  ExplorationGeneratedRewardItemReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import { ActiveHeroRuntimeInvalidation } from '../../../core/services/hero/active-hero-runtime-invalidation';
import {
  ExplorationPreferredChallengeReward,
  ExplorationRewardSource,
} from '../../../core/types/exploration-runtime-context.types';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import {
  rewardDisplay,
  rewardEntryAmount,
  rewardEntryDetails,
  rewardEntryLabel,
  rewardEntryName,
  rewardItemDetails,
  rewardItemIconClass,
  rewardItemLabel,
} from './exploration-reward-card-ui';
import {
  rewardBackendDiagnosticRows,
  rewardDiagnosticRows,
} from './exploration-reward-diagnostics-ui';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationRewardState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewards = inject(HeroExplorationRewards);
  private readonly runtimeInvalidation = inject(ActiveHeroRuntimeInvalidation);
  private readonly step = inject(ExplorationStepState);
  private readonly loadToken = new RequestToken();
  private readonly currentSource = signal<ExplorationRewardSource | null>(null);
  private readonly preferredChallengeReward =
    signal<ExplorationPreferredChallengeReward | null>(null);

  readonly reward = signal<ExplorationChallengeRewardReadModel | null>(null);
  readonly isLoadingReward = signal(false);
  readonly rewardDisplay = computed(() => rewardDisplay(this.reward()));
  readonly rewardDiagnostics = computed(() => rewardDiagnosticRows(this.reward()));
  readonly rewardBackendDiagnostics = computed(() =>
    rewardBackendDiagnosticRows(this.reward(), this.currentSource(), this.isLoadingReward()),
  );
  readonly rewardUnavailableMessage = computed(() =>
    this.currentSource() && !this.isLoadingReward() && !this.reward()
      ? EXPLORATION_RUNTIME_COPY.rewardUnavailable
      : null,
  );

  constructor() {
    effect(() => {
      const source = this.resolveRewardSource();
      this.currentSource.set(source);

      if (!source) {
        this.clearReward();
        return;
      }

      this.loadReward(source);
    });
  }

  preferCompletedChallengeReward(
    explorationId: string | null,
    challengeAttemptId: string | null,
  ): void {
    if (explorationId && challengeAttemptId) {
      this.preferredChallengeReward.set({ explorationId, challengeAttemptId });
    }
  }

  entryLabel(entry: RewardGrantEntryReadModel): string {
    return rewardEntryLabel(entry);
  }

  entryDetails(entry: RewardGrantEntryReadModel): string | null {
    return rewardEntryDetails(entry);
  }

  entryAmount(entry: RewardGrantEntryReadModel): number | null {
    return rewardEntryAmount(entry);
  }

  entryName(entry: RewardGrantEntryReadModel): string {
    return rewardEntryName(entry);
  }

  itemLabel(item: ExplorationGeneratedRewardItemReadModel): string {
    return rewardItemLabel(item);
  }

  itemDetails(item: ExplorationGeneratedRewardItemReadModel): string[] {
    return rewardItemDetails(item);
  }

  itemIconClass(item: ExplorationGeneratedRewardItemReadModel): string {
    return rewardItemIconClass(item);
  }

  private resolveRewardSource(): ExplorationRewardSource | null {
    const state = this.overview.state();
    const explorationId = state?.exploration?.id ?? null;

    if (!explorationId || state?.activeStep) {
      return null;
    }

    const stepResult = this.step.currentStepResult();
    const preferred = this.preferredChallengeReward();

    if (stepResult?.explorationId === explorationId) {
      if (stepResult.challengeAttemptId) {
        return preferred?.explorationId === explorationId &&
          preferred.challengeAttemptId === stepResult.challengeAttemptId
          ? {
              kind: 'challenge_attempt',
              explorationId,
              challengeAttemptId: stepResult.challengeAttemptId,
            }
          : null;
      }

      if (stepResult.outcomeKind !== 'encounter') {
        return null;
      }

      const encounterKind = stepResult.selectedDefinition?.encounterKind ?? null;

      if (!encounterKind) {
        this.feedback.setError(
          null,
          EXPLORATION_RUNTIME_COPY.rewardEncounterKindMissing,
        );
        return null;
      }

      return encounterKind === ENCOUNTER_KIND.resource
        ? { kind: 'step', explorationId, stepId: stepResult.stepId }
        : null;
    }

    return preferred?.explorationId === explorationId
      ? {
          kind: 'challenge_attempt',
          explorationId,
          challengeAttemptId: preferred.challengeAttemptId,
        }
      : null;
  }

  private loadReward(source: ExplorationRewardSource): void {
    const context = this.overview.currentContext();

    if (!context) {
      this.clearReward();
      return;
    }

    const token = this.loadToken.next();
    const request: Observable<ExplorationChallengeRewardReadModel | null> =
      source.kind === 'step'
        ? this.rewards.getStepReward({ stepId: source.stepId })
        : this.rewards.getChallengeReward({
            challengeAttemptId: source.challengeAttemptId,
          });

    this.reward.set(null);
    this.isLoadingReward.set(true);
    request
      .pipe(
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.isLoadingReward.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (reward) => {
          if (
            this.isCurrentLoad(
              token,
              context.serverId,
              context.heroId,
              context.difficultyKey,
              source,
            )
          ) {
            this.reward.set(reward);

            if (reward) {
              this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
                'exploration_reward_loaded',
                { serverId: context.serverId, heroId: context.heroId },
              );
            }
          }
        },
        error: (error: unknown) => {
          if (
            this.isCurrentLoad(
              token,
              context.serverId,
              context.heroId,
              context.difficultyKey,
              source,
            )
          ) {
            this.feedback.setError(error, EXPLORATION_RUNTIME_COPY.rewardLoadFailed);
          }
        },
      });
  }

  private isCurrentLoad(
    token: number,
    serverId: string,
    heroId: string,
    difficultyKey: string,
    source: ExplorationRewardSource,
  ): boolean {
    const current = this.currentSource();

    return (
      this.loadToken.isCurrent(token) &&
      this.overview.isCurrentContext(serverId, heroId, difficultyKey) &&
      current?.kind === source.kind &&
      current.explorationId === source.explorationId &&
      (
        source.kind === 'step'
          ? current.kind === 'step' && current.stepId === source.stepId
          : current.kind === 'challenge_attempt' &&
            current.challengeAttemptId === source.challengeAttemptId
      )
    );
  }

  private clearReward(): void {
    this.loadToken.next();
    this.reward.set(null);
    this.isLoadingReward.set(false);
  }

}
