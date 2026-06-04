import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { PlayerVicinityPageContextReadModel } from '../../domain/vicinity/player-vicinity-page-context.model';
import { Database } from '../../types/database.types';
import { mapPlayerVicinityPageContext } from '../../utils/player-vicinity-page-context.mapper';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerVicinity {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getPageContext(): Observable<PlayerVicinityPageContextReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: Database['public']['Functions']['get_player_vicinity_page_context']['Args'] = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<
          Database['public']['Functions']['get_player_vicinity_page_context']['Returns']
        >(
          RPC.get_player_vicinity_page_context,
          args,
        ).pipe(map(mapPlayerVicinityPageContext));
      }),
    );
  }
}
