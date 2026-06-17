import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ItemPopoverContextKey } from '../../domain/item/item-detail-popover.model';
import { ItemDetailPopoverDetailReadModel } from '../../domain/item/item-detail-popover-detail.model';
import {
  ItemPopoverDetailRpcArgs,
  ItemPopoverDetailRpcResult,
} from '../../types/item-popover-rpc.types';
import { mapItemDetailPopoverDetail } from '../../utils/item-detail-popover-detail.mapper';
import { requiredTrimmedText, trimToNull } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class ItemDetailReader {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  readItemDetail(
    itemId: string | null,
    context: ItemPopoverContextKey | null = null,
    publicToken: string | null = null,
    itemReferenceId: string | null = null,
  ): Observable<ItemDetailPopoverDetailReadModel> {
    const normalizedItemId = trimToNull(itemId);
    const normalizedContext = context?.trim() || null;
    const normalizedPublicToken = trimToNull(publicToken);
    const normalizedItemReferenceId = trimToNull(itemReferenceId);

    if (
      normalizedContext === 'public_report' &&
      normalizedPublicToken &&
      normalizedItemReferenceId
    ) {
      const args: ItemPopoverDetailRpcArgs = {
        p_hero_id: null,
        p_item_id: null,
        p_context: 'public_report',
        p_public_token: normalizedPublicToken,
        p_item_reference_id: normalizedItemReferenceId,
      };

      return this.backend.rpc<ItemPopoverDetailRpcResult>(
        RPC.item_popover_detail,
        args,
      ).pipe(
        map((detail) => mapItemDetailPopoverDetail(detail)),
      );
    }

    const liveItemId = requiredTrimmedText(
      normalizedItemId,
      'itemId',
      'item popover RPC',
    );

    return this.activeHero.requireActiveHero().pipe(
      switchMap((activeHeroContext) => {
        const args: ItemPopoverDetailRpcArgs = {
          p_hero_id: activeHeroContext.heroId,
          p_item_id: liveItemId,
          p_context: normalizedContext,
          p_public_token: null,
          p_item_reference_id: null,
        };

        return this.backend.rpc<ItemPopoverDetailRpcResult>(
          RPC.item_popover_detail,
          args,
        );
      }),
      map((detail) => mapItemDetailPopoverDetail(detail)),
    );
  }
}
