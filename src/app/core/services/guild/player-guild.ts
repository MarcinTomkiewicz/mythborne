import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CreateGuildInput,
  CurrentGuildReadModel,
  CurrentHeroGuildState,
  GuildConfigSummary,
  GuildCreateResult,
  GuildDetail,
  GuildSearchFilters,
  GuildSearchResult,
} from '../../domain/guild/guild.model';
import {
  CreateGuildRpcRow,
  GetGuildConfigSummaryRpcRow,
  GetHeroGuildDashboardRpcRow,
  GetHeroGuildStateRpcRow,
  SearchGuildsForHeroRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapCurrentHeroGuildState,
  mapGuildCreateResult,
  mapGuildConfigSummary,
  mapGuildDetail,
  mapGuildSearchResult,
  toCreateGuildRpcArgs,
} from '../../utils/guild-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

const DEFAULT_GUILD_SEARCH_LIMIT = 25;

@Injectable({ providedIn: 'root' })
export class PlayerGuild {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroGuild(): Observable<CurrentGuildReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroGuildState(context.heroId).pipe(
          switchMap((state) =>
            state.guild
              ? this.getHeroGuildDetail(context.heroId).pipe(
                  map((detail) => ({
                    heroId: context.heroId,
                    serverId: context.serverId,
                    state,
                    detail,
                  })),
                )
              : of({
                  heroId: context.heroId,
                  serverId: context.serverId,
                  state,
                  detail: null,
                }),
          ),
          map((overview) => {
            const active = this.activeHero.state();

            if (active?.heroId !== context.heroId || active.serverId !== context.serverId) {
              throw new Error('Current guild context changed.');
            }

            return overview;
          }),
        ),
      ),
    );
  }

  getHeroGuildState(heroId: string): Observable<CurrentHeroGuildState> {
    return this.backend
      .rpc<GetHeroGuildStateRpcRow[]>(RPC.get_hero_guild_state, { p_hero_id: heroId })
      .pipe(
        map((rows) => mapCurrentHeroGuildState(firstRow(rows, RPC.get_hero_guild_state))),
      );
  }

  getHeroGuildDetail(heroId: string): Observable<GuildDetail> {
    return this.backend
      .rpc<GetHeroGuildDashboardRpcRow[]>(RPC.get_hero_guild_dashboard, { p_hero_id: heroId })
      .pipe(
        map((rows) => mapGuildDetail(firstRow(rows, RPC.get_hero_guild_dashboard))),
      );
  }

  createGuildForActiveHero(input: CreateGuildInput): Observable<GuildCreateResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.createGuild(context.heroId, withRequestId(input, 'guild-create')).pipe(
          map((result) => {
            const active = this.activeHero.state();

            if (active?.heroId !== context.heroId || active.serverId !== context.serverId) {
              throw new Error('Guild creation context changed.');
            }

            return result;
          }),
        ),
      ),
    );
  }

  createGuild(heroId: string, input: CreateGuildInput): Observable<GuildCreateResult> {
    return this.backend
      .rpc<CreateGuildRpcRow[]>(
        RPC.create_guild,
        toCreateGuildRpcArgs(heroId, withRequestId(input, 'guild-create')),
      )
      .pipe(map((rows) => mapGuildCreateResult(firstRow(rows, RPC.create_guild))));
  }

  searchGuildsForActiveHero(
    filters: GuildSearchFilters = {},
  ): Observable<GuildSearchResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.searchGuildsForHero(context.heroId, filters).pipe(
          map((result) => {
            const active = this.activeHero.state();

            if (active?.heroId !== context.heroId || active.serverId !== context.serverId) {
              throw new Error('Guild search context changed.');
            }

            return result;
          }),
        ),
      ),
    );
  }

  searchGuildsForHero(
    heroId: string,
    filters: GuildSearchFilters = {},
  ): Observable<GuildSearchResult> {
    const query = normalizeQuery(filters.query);
    const limit = filters.limit ?? DEFAULT_GUILD_SEARCH_LIMIT;
    const offset = filters.offset ?? 0;

    return this.backend
      .rpc<SearchGuildsForHeroRpcRow[]>(RPC.search_guilds_for_hero, {
        p_hero_id: heroId,
        p_query: query,
        p_limit: limit,
        p_offset: offset,
      })
      .pipe(map((rows) => mapGuildSearchResult(rows, query, limit, offset)));
  }

  getGuildConfigSummary(): Observable<GuildConfigSummary> {
    return this.backend
      .rpc<GetGuildConfigSummaryRpcRow[]>(RPC.get_guild_config_summary, {})
      .pipe(
        map((rows) => mapGuildConfigSummary(firstRow(rows, RPC.get_guild_config_summary))),
      );
  }
}

function normalizeQuery(query: string | null | undefined): string | null {
  const trimmed = query?.trim();

  return trimmed ? trimmed : null;
}

function withRequestId(input: CreateGuildInput, prefix: string): CreateGuildInput {
  return input.requestId ? input : { ...input, requestId: createRequestId(prefix) };
}

function createRequestId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}:${randomId}`;
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no guild row.`);
  }

  return row;
}
