import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  ExplorationChallengeRewardReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';
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
  readonly visibleRewardEntries = computed(() =>
    this.reward()?.entries.filter(isVisibleRewardEntry) ?? [],
  );
  readonly hiddenRewardDiagnostics = computed(() =>
    this.reward()?.entries
      .filter((entry) => !isVisibleRewardEntry(entry))
      .map((entry) => this.hiddenEntryDiagnostic(entry)) ?? [],
  );
  readonly rewardGrantDiagnostic = computed(() => {
    const grant = this.reward()?.rewardGrant ?? null;

    if (!grant) {
      return null;
    }

    if (grant.status === 'granted' && !grant.reason) {
      return null;
    }

    return grant.reason
      ? `Status grantu: ${grant.status}. Powód DB: ${sentenceText(grant.reason)}`
      : `Status grantu: ${grant.status}. DB nie zwróciła dodatkowego powodu.`;
  });
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
        return `${entry.amount ?? 0} Punktów Postaci`;
      case 'resource':
        return `${entry.amount ?? 0} ${entry.resourceType ?? 'zasób'}`;
      case 'item':
      case 'generated_item':
        return entry.itemId
          ? `Przedmiot: ${this.itemLabel(entry.itemId)}`
          : 'Losowanie przedmiotu bez utworzonego itemu';
      case 'effect':
        return entry.effectDefinitionId
          ? `Efekt ${entry.effectDefinitionId}`
          : 'Nagroda efektu';
      default:
        return `${humanizeKey(entry.entryKind, 'Reward')}${entry.amount === null ? '' : `: ${entry.amount}`}`;
    }
  }

  itemLabel(itemId: string | null): string {
    const item = this.reward()?.items.find((entry) => entry.id === itemId);

    return item ? `${item.name} (${item.id})` : itemId ?? 'N/D';
  }

  itemDetails(itemId: string | null): string {
    const item = this.reward()?.items.find((entry) => entry.id === itemId);

    if (!item) {
      return 'DB nie zwróciła trwałego wiersza itemu dla tej nagrody.';
    }

    return [
      `Wartość ${item.drachmaValue ?? 'N/D'}`,
      `Jakość ${item.generationQualityKey ?? 'N/D'}`,
      `Baza ${item.generationBaseId ?? 'N/D'}`,
      `Prefix ${item.prefixAffixId ?? 'N/D'}`,
      `Suffix ${item.suffixAffixId ?? 'N/D'}`,
      `Status ${item.status}`,
    ].join(' - ');
  }

  entryDetails(entry: RewardGrantEntryReadModel): string | null {
    if (entry.itemId) {
      return this.itemDetails(entry.itemId);
    }

    if (entry.effectDefinitionId) {
      return `Efekt DB: ${entry.effectDefinitionId}`;
    }

    if (entry.resourceType) {
      return `Zasób DB: ${entry.resourceType}`;
    }

    return null;
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

          this.feedback.setError(error, 'Nie udało się odczytać nagrody eksploracji.');
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
      return 'DB nie zapisała jeszcze ukończonego challenge reward dla tej eksploracji.';
    }

    if (reward.success === false || !reward.rewardGrantId) {
      return 'Ostatni ukończony challenge nie przyznał nagrody.';
    }

    if (!reward.entries.length) {
      return 'Reward grant istnieje, ale DB nie zapisała wpisów nagrody.';
    }

    return `DB zapisała ${reward.entries.length} wpis${reward.entries.length === 1 ? '' : 'y'} nagrody.`;
  }

  private hiddenEntryDiagnostic(entry: RewardGrantEntryReadModel): string {
    const reason = metadataReason(entry);
    const label = diagnosticEntryLabel(entry);

    if (reason) {
      return `${label} nie utworzył itemu. Powód DB: ${sentenceText(reason)}`;
    }

    return `${label} nie ma itemId. To może oznaczać legalny wynik bez dropu albo brak szczegółu diagnostycznego w DB.`;
  }

}

function isVisibleRewardEntry(entry: RewardGrantEntryReadModel): boolean {
  return !isItemRewardEntry(entry) || Boolean(entry.itemId);
}

function isItemRewardEntry(entry: RewardGrantEntryReadModel): boolean {
  return entry.entryKind === 'item' || entry.entryKind === 'generated_item';
}

function metadataReason(entry: RewardGrantEntryReadModel): string | null {
  const metadata = jsonRecord(entry.metadataJson);

  return optionalText(read(
    metadata,
    'failureReason',
    'failure_reason',
    'reason',
    'statusReason',
    'status_reason',
    'itemGenerationReason',
    'item_generation_reason',
    'itemGenerationError',
    'item_generation_error',
  ));
}

function sentenceText(value: string): string {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function diagnosticEntryLabel(entry: RewardGrantEntryReadModel): string {
  switch (entry.entryKind) {
    case 'item':
    case 'generated_item':
      return 'Wpis losowania przedmiotu';
    case 'experience':
    case 'exp':
      return 'Wpis EXP';
    case 'character_points':
    case 'hero_points':
      return 'Wpis Punktów Postaci';
    case 'resource':
      return 'Wpis zasobu';
    case 'effect':
      return 'Wpis efektu';
    default:
      return `Wpis ${humanizeKey(entry.entryKind, 'Reward')}`;
  }
}
