import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CurrentGuildReadModel,
  CurrentHeroGuildState,
  GuildConfigSummary,
  GuildDetail,
  GuildMemberListItem,
} from '../../domain/guild/guild.model';
import {
  GetGuildConfigSummaryRpcRow,
  GetHeroGuildDashboardRpcRow,
  GetHeroGuildMembersRpcRow,
  GetHeroGuildStateRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapCurrentHeroGuildState,
  mapGuildConfigSummary,
  mapGuildDetail,
  mapGuildMemberListItem,
} from '../../utils/guild-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

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

  getHeroGuildMembers(heroId: string): Observable<GuildMemberListItem[]> {
    return this.backend
      .rpc<GetHeroGuildMembersRpcRow[]>(RPC.get_hero_guild_members, { p_hero_id: heroId })
      .pipe(map((rows) => rows.map(mapGuildMemberListItem)));
  }

  getGuildConfigSummary(): Observable<GuildConfigSummary> {
    return this.backend
      .rpc<GetGuildConfigSummaryRpcRow[]>(RPC.get_guild_config_summary, {})
      .pipe(
        map((rows) => mapGuildConfigSummary(firstRow(rows, RPC.get_guild_config_summary))),
      );
  }
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no guild row.`);
  }

  return row;
}
