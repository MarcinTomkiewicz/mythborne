import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PvpRankingContext,
  PvpRankingContextInput,
} from '../../domain/pvp/pvp-ranking.model';
import { Database } from '../../types/database.types';
import { mapPvpRankingContext } from '../../utils/pvp-ranking-context.mapper';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerPvpRanking {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getContext(input: PvpRankingContextInput = {}): Observable<PvpRankingContext> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => this.getContextForHero(context.heroId, input)),
    );
  }

  getContextForHero(
    heroId: string,
    input: PvpRankingContextInput = {},
  ): Observable<PvpRankingContext> {
    const args: Database['public']['Functions']['get_pvp_ranking_context']['Args'] = {
      p_hero_id: heroId,
      p_query: input.query ?? undefined,
      p_district_key: input.districtKey ?? undefined,
      p_offset: input.offset ?? undefined,
      p_selected_target_hero_id: input.selectedTargetHeroId ?? undefined,
    };

    return this.backend.rpc<
      Database['public']['Functions']['get_pvp_ranking_context']['Returns']
    >(
      RPC.get_pvp_ranking_context,
      args,
    ).pipe(map(mapPvpRankingContext));
  }
}
