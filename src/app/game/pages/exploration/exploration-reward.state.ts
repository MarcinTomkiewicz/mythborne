import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  ExplorationChallengeRewardReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationRewardState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly rewards = inject(HeroExplorationRewards);
  private readonly loadToken = new RequestToken();

  readonly reward = signal<ExplorationChallengeRewardReadModel | null>(null);
  readonly isLoadingReward = signal(false);
  readonly hasRewardGrant = computed(() => Boolean(this.reward()?.rewardGrant));
  readonly hasRewardEntries = computed(() => Boolean(this.reward()?.entries.length));
  readonly rewardSummary = computed(() => this.summary(this.reward()));

  constructor() {
    effect(() => {
      const state = this.overview.state();
      const explorationId = state?.exploration?.id ?? null;

      if (!explorationId) {
        this.reward.set(null);
        return;
      }

      this.loadReward(explorationId);
    });
  }

  entryLabel(entry: RewardGrantEntryReadModel): string {
    switch (entry.entryKind) {
      case 'experience':
      case 'exp':
        return `${entry.amount ?? 0} EXP`;
      case 'character_points':
      case 'hero_points':
        return `${entry.amount ?? 0} Character Points`;
      case 'resource':
        return `${entry.amount ?? 0} ${entry.resourceType ?? 'resource'}`;
      case 'item':
      case 'generated_item':
        return entry.itemId ? `Generated item ${entry.itemId}` : 'No item generated';
      case 'effect':
        return entry.effectDefinitionId
          ? `Effect ${entry.effectDefinitionId}`
          : 'Effect reward';
      default:
        return `${this.humanizeKey(entry.entryKind)}${entry.amount === null ? '' : `: ${entry.amount}`}`;
    }
  }

  itemLabel(itemId: string | null): string {
    const item = this.reward()?.items.find((entry) => entry.id === itemId);

    return item?.name ?? itemId ?? 'N/D';
  }

  itemDetails(itemId: string | null): string {
    const item = this.reward()?.items.find((entry) => entry.id === itemId);

    if (!item) {
      return 'Item row was not found or no item was generated.';
    }

    return [
      `Value ${item.drachmaValue ?? 'N/D'}`,
      `Quality ${item.generationQualityKey ?? 'N/D'}`,
      `Base ${item.generationBaseId ?? 'N/D'}`,
      `Prefix ${item.prefixAffixId ?? 'N/D'}`,
      `Suffix ${item.suffixAffixId ?? 'N/D'}`,
      `Status ${item.status}`,
    ].join(' - ');
  }

  private loadReward(explorationId: string): void {
    const context = this.overview.currentContext();

    if (!context) {
      return;
    }

    const token = this.loadToken.next();

    this.reward.set(null);
    this.isLoadingReward.set(true);
    this.rewards
      .getLatestChallengeReward({
        heroId: context.heroId,
        explorationId,
      })
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
          if (!this.isCurrentLoad(token, context.heroId, context.difficultyKey, explorationId)) {
            return;
          }

          this.reward.set(reward);
        },
        error: (error: unknown) => {
          if (!this.isCurrentLoad(token, context.heroId, context.difficultyKey, explorationId)) {
            return;
          }

          this.feedback.setError(error, 'Failed to load exploration reward.');
        },
      });
  }

  private isCurrentLoad(
    token: number,
    heroId: string,
    difficultyKey: string,
    explorationId: string,
  ): boolean {
    return (
      this.loadToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.overview.state()?.exploration?.id === explorationId
    );
  }

  private summary(reward: ExplorationChallengeRewardReadModel | null): string {
    if (!reward) {
      return 'No completed challenge reward has been recorded for this exploration yet.';
    }

    if (reward.success === false || !reward.rewardGrantId) {
      return 'The latest completed challenge did not grant a reward.';
    }

    if (!reward.entries.length) {
      return 'The reward grant exists, but it has no recorded reward entries.';
    }

    return `${reward.entries.length} reward entr${reward.entries.length === 1 ? 'y' : 'ies'} recorded by the database.`;
  }

  private humanizeKey(value: string): string {
    return value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ') || 'Reward';
  }
}
