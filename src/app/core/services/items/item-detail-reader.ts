import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ItemPopoverContextKey } from '../../domain/item/item-detail-popover.model';
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

  readItemDetail(
    itemId: string,
    context: ItemPopoverContextKey | null = null,
  ): Observable<ItemDetailPopoverDetailReadModel> {
    const normalizedItemId = requiredTrimmedText(
      itemId,
      'itemId',
      'item popover RPC',
    );
    const normalizedContext = context?.trim() || null;

    return this.activeHero.requireActiveHero().pipe(
      switchMap((activeHeroContext) => {
        const args: PlayerItemPopoverDetailRpcArgs = {
          p_hero_id: activeHeroContext.heroId,
          p_item_id: normalizedItemId,
          p_context: normalizedContext,
        };

        return this.backend.rpc<
          Database['public']['Functions']['get_player_item_popover_detail']['Returns']
        >(
          RPC.get_player_item_popover_detail,
          args,
        );
      }),
      map((detail) => mapItemDetailPopoverDetail(detail)),
    );
  }
}

type PlayerItemPopoverDetailRpcArgs = {
  p_hero_id: string;
  p_item_id: string;
  p_context: string | null;
};
