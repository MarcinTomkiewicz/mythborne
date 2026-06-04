import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { PlayerEstatePageContextV2 } from '../../domain/estate/player-estate-page-context.model';
import { Database } from '../../types/database.types';
import { mapPlayerEstatePageContext } from '../../utils/player-estate-page-context.mapper';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerEstate {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getPageContext(): Observable<PlayerEstatePageContextV2> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: Database['public']['Functions']['get_player_estate_page_context']['Args'] = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<
          Database['public']['Functions']['get_player_estate_page_context']['Returns']
        >(
          RPC.get_player_estate_page_context,
          args,
        ).pipe(map(mapPlayerEstatePageContext));
      }),
    );
  }
}
