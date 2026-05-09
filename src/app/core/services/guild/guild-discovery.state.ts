import { inject, Injectable, signal } from '@angular/core';
import {
  GuildDiscoveryResult,
  GuildSearchFilters,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuild } from './player-guild';

@Injectable({ providedIn: 'root' })
export class GuildDiscoveryState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerGuild = inject(PlayerGuild);
  private requestId = 0;

  readonly guilds = signal<GuildDiscoveryResult[]>([]);
  readonly totalCount = signal(0);
  readonly query = signal<string | null>(null);
  readonly limit = signal(25);
  readonly offset = signal(0);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  search(filters: GuildSearchFilters = {}) {
    const requestId = ++this.requestId;
    const contextKey = this.currentContextKey();
    const query = filters.query ?? this.query();
    const limit = filters.limit ?? this.limit();
    const offset = filters.offset ?? this.offset();

    if (!contextKey) {
      this.guilds.set([]);
      this.totalCount.set(0);
      this.isLoading.set(false);
      this.error.set('No active hero for guild discovery.');
      return;
    }

    this.query.set(query);
    this.limit.set(limit);
    this.offset.set(offset);
    this.isLoading.set(true);
    this.error.set(null);

    this.playerGuild.searchGuildsForActiveHero({ query, limit, offset }).subscribe({
      next: (result) => {
        if (!this.acceptsSearchResponse(requestId, contextKey)) {
          return;
        }

        this.guilds.set(result.guilds);
        this.totalCount.set(result.totalCount);
        this.query.set(result.query);
        this.limit.set(result.limit);
        this.offset.set(result.offset);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsSearchResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to search guilds.'));
        this.isLoading.set(false);
      },
    });
  }

  clear() {
    this.requestId++;
    this.guilds.set([]);
    this.totalCount.set(0);
    this.query.set(null);
    this.offset.set(0);
    this.isLoading.set(false);
    this.error.set(null);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsSearchResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.requestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.guilds.set([]);
      this.totalCount.set(0);
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
