import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ItemDetailPopoverDetailReadModel } from '../../domain/item/item-detail-popover-detail.model';
import { Database } from '../../types/database.types';
import { mapItemDetailPopoverDetail } from '../../utils/item-detail-popover-detail.mapper';
import { requiredTrimmedText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class ItemDetailReader {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  readItemDetail(itemId: string): Observable<ItemDetailPopoverDetailReadModel> {
    const normalizedItemId = requiredTrimmedText(
      itemId,
      'itemId',
      'item popover RPC',
    );

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: Database['public']['Functions']['get_player_item_popover_detail']['Args'] = {
          p_hero_id: context.heroId,
          p_item_id: normalizedItemId,
        };

        return this.backend.rpc<
          Database['public']['Functions']['get_player_item_popover_detail']['Returns']
        >(
          RPC.get_player_item_popover_detail,
          args,
        );
      }),
      tap((detail) => {
        console.log('[ItemDetailReader] get_player_item_popover_detail raw', {
          itemId: normalizedItemId,
          detail,
        });
      }),
      map((detail) => mapItemDetailPopoverDetail(detail)),
    );
  }
}
