import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  ExplorationChallengeRewardReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { HeroExplorationStepResolutionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ItemReadModel } from '../../../core/domain/item/item.model';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import {
  rewardDisplay,
  rewardEntryDetails,
  rewardEntryLabel,
  rewardItemDetails,
  rewardItemLabel,
} from './exploration-reward-card-ui';
import {
  rewardBackendDiagnosticRows,
  rewardDiagnosticRows,
} from './exploration-reward-diagnostics-ui';
import { ExplorationStepState } from './exploration-step.state';

type RewardSource =
  | { kind: 'challenge_attempt'; explorationId: string; challengeAttemptId: string }
  | { kind: 'step'; explorationId: string; stepId: string };

@Injectable()
export class ExplorationRewardState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewards = inject(HeroExplorationRewards);
  private readonly step = inject(ExplorationStepState);
  private readonly loadToken = new RequestToken();
  private readonly currentSource = signal<RewardSource | null>(null);
  private readonly preferredChallengeReward = signal<{
    explorationId: string;
    challengeAttemptId: string;
  } | null>(null);

  readonly reward = signal<ExplorationChallengeRewardReadModel | null>(null);
  readonly isLoadingReward = signal(false);
  readonly rewardDisplay = computed(() => rewardDisplay(this.reward()));
  readonly rewardDiagnostics = computed(() => rewardDiagnosticRows(this.reward()));
  readonly rewardBackendDiagnostics = computed(() =>
    rewardBackendDiagnosticRows(this.reward(), this.currentSource(), this.isLoadingReward()),
  );
  readonly rewardUnavailableMessage = computed(() =>
    this.currentSource() && !this.isLoadingReward() && !this.reward()
      ? 'Reward details are unavailable from the DB read model.'
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

  itemLabel(item: ItemReadModel): string {
    return rewardItemLabel(item);
  }

  itemDetails(item: ItemReadModel): string {
    return rewardItemDetails(item);
  }

  private resolveRewardSource(): RewardSource | null {
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

      return stepResult.outcomeKind === 'encounter' &&
        this.stepEncounterKind(stepResult) === ENCOUNTER_KIND.resource
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

  private loadReward(source: RewardSource): void {
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
          if (this.isCurrentLoad(token, context.heroId, context.difficultyKey, source)) {
            this.reward.set(reward);
          }
        },
        error: (error: unknown) => {
          if (this.isCurrentLoad(token, context.heroId, context.difficultyKey, source)) {
            this.feedback.setError(error, 'Nie udało się odczytać nagrody eksploracji.');
          }
        },
      });
  }

  private isCurrentLoad(
    token: number,
    heroId: string,
    difficultyKey: string,
    source: RewardSource,
  ): boolean {
    const current = this.currentSource();

    return (
      this.loadToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
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

  private stepEncounterKind(result: HeroExplorationStepResolutionReadModel): string | null {
    const metadata = jsonRecord(result.metadataJson);

    return result.selectedDefinition?.encounterKind
      ?? optionalText(read(metadata, 'encounterKind', 'encounter_kind'));
  }
}
