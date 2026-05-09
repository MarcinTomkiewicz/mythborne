import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  GuildArmoryItem,
  GuildArmoryLoan,
} from '../../../core/domain/guild/guild-armory.model';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { PlayerGuildArmory } from '../../../core/services/guild/player-guild-armory';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { getErrorMessage } from '../../../core/utils/error-message';

@Injectable()
export class GuildArmoryReadState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerGuild = inject(PlayerGuild);
  private readonly playerGuildArmory = inject(PlayerGuildArmory);
  private loadRequestId = 0;

  readonly items = signal<GuildArmoryItem[]>([]);
  readonly loans = signal<GuildArmoryLoan[]>([]);
  readonly config = signal<GuildConfigSummary | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly currentCount = computed(() => this.items().length);
  readonly availableCount = computed(() =>
    this.items().filter((item) => item.armoryStatusKey === 'available').length,
  );
  readonly borrowedCount = computed(() =>
    this.items().filter((item) => item.armoryStatusKey === 'borrowed').length,
  );
  readonly capacityLimit = computed(() => this.config()?.armoryCapacity ?? null);
  readonly capacityIsUnlimited = computed(() =>
    this.config()?.armoryCapacityIsUnlimited || this.capacityLimit() === 0,
  );
  readonly capacityLabel = computed(() => {
    if (this.capacityIsUnlimited()) {
      return `${this.currentCount()} / unlimited`;
    }

    const limit = this.capacityLimit();

    return limit === null ? `${this.currentCount()} / N/D` : `${this.currentCount()} / ${limit}`;
  });

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.clearReadModel();

    if (!contextKey) {
      this.isLoading.set(false);
      this.error.set('No active hero for guild armory.');
      return;
    }

    this.isLoading.set(true);

    forkJoin({
      armory: this.playerGuildArmory.getActiveHeroGuildArmory(false),
      config: this.playerGuild.getGuildConfigSummary(),
    }).subscribe({
      next: ({ armory, config }) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.items.set(armory.items);
        this.loans.set(armory.loans);
        this.config.set(config);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.clearReadModel();
        this.error.set(getErrorMessage(error, 'Failed to load guild armory.'));
        this.isLoading.set(false);
      },
    });
  }

  clear(): void {
    this.loadRequestId++;
    this.clearReadModel();
    this.isLoading.set(false);
    this.error.set(null);
  }

  private clearReadModel(): void {
    this.items.set([]);
    this.loans.set([]);
    this.config.set(null);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.clearReadModel();
      this.isLoading.set(false);
      this.error.set(null);
      return false;
    }

    return true;
  }
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
