import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ItemLifecycleOperationResult,
  RecoverableScrappedItemSearchResult,
  RecoverScrappedItemInput,
  SearchRecoverableScrappedItemsInput,
  ScrapHeroItemInput,
  VendorScrapHeroItemInput,
  VendorScrapHeroItemResult,
} from '../../domain/item/item-lifecycle.model';
import {
  ItemLifecycleOperationRpcRow,
  SearchRecoverableScrappedItemsPageRpcRow,
  VendorScrapHeroItemRpcRow,
} from '../../types/item-lifecycle-rpc.types';
import {
  mapItemLifecycleOperationResult,
  mapRecoverableScrappedItemSearchResult,
  mapVendorScrapHeroItemResult,
  toRecoverScrappedItemRpcArgs,
  toSearchRecoverableScrappedItemsPageRpcArgs,
  toScrapHeroItemRpcArgs,
  toVendorScrapHeroItemRpcArgs,
} from '../../utils/item-lifecycle-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ItemLifecycleService {
  private readonly backend = inject(Backend);

  scrapHeroItem(input: ScrapHeroItemInput): Observable<ItemLifecycleOperationResult> {
    return this.backend
      .rpc<ItemLifecycleOperationRpcRow[]>(
        RPC.scrap_hero_item,
        toScrapHeroItemRpcArgs(input),
      )
      .pipe(map((rows) => mapItemLifecycleOperationResult(firstRow(rows))));
  }

  getVendorScrapDrachmaPayoutPercent(): Observable<number> {
    return this.backend.rpc<number>(RPC.get_vendor_scrap_drachma_payout_percent);
  }

  vendorScrapHeroItem(
    input: VendorScrapHeroItemInput,
  ): Observable<VendorScrapHeroItemResult> {
    return this.backend
      .rpc<VendorScrapHeroItemRpcRow[]>(
        RPC.vendor_scrap_hero_item,
        toVendorScrapHeroItemRpcArgs(input),
      )
      .pipe(map((rows) => mapVendorScrapHeroItemResult(firstRow(rows))));
  }

  searchRecoverableScrappedItems(
    input: SearchRecoverableScrappedItemsInput,
  ): Observable<RecoverableScrappedItemSearchResult> {
    return this.backend
      .rpc<SearchRecoverableScrappedItemsPageRpcRow[]>(
        RPC.search_recoverable_scrapped_items_page,
        toSearchRecoverableScrappedItemsPageRpcArgs(input),
      )
      .pipe(map(mapRecoverableScrappedItemSearchResult));
  }

  recoverScrappedItem(
    input: RecoverScrappedItemInput,
  ): Observable<ItemLifecycleOperationResult> {
    return this.backend
      .rpc<ItemLifecycleOperationRpcRow[]>(
        RPC.recover_scrapped_item,
        toRecoverScrappedItemRpcArgs(input),
      )
      .pipe(map((rows) => mapItemLifecycleOperationResult(firstRow(rows))));
  }
}

function firstRow<T>(rows: readonly T[]): T {
  const row = rows[0];

  if (!row) {
    throw new Error('Item lifecycle workflow returned no row.');
  }

  return row;
}
