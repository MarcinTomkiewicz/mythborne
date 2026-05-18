import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  BulkVendorScrapHeroItemsInput,
  BulkVendorScrapHeroItemsResult,
  ItemLifecycleOperationResult,
  RecoverableScrappedItemSearchResult,
  RecoverScrappedItemInput,
  SearchRecoverableScrappedItemsInput,
  VendorScrapHeroItemInput,
  VendorScrapHeroItemResult,
} from '../../domain/item/item-lifecycle.model';
import {
  BulkVendorScrapHeroItemsRpcRow,
  ItemLifecycleOperationRpcRow,
  SearchRecoverableScrappedItemsPageRpcRow,
  VendorScrapHeroItemRpcRow,
} from '../../types/item-lifecycle-rpc.types';
import {
  mapBulkVendorScrapHeroItemsResult,
  mapItemLifecycleOperationResult,
  mapRecoverableScrappedItemSearchResult,
  mapVendorScrapHeroItemResult,
  toBulkVendorScrapHeroItemsRpcArgs,
  toRecoverScrappedItemRpcArgs,
  toSearchRecoverableScrappedItemsPageRpcArgs,
  toVendorScrapHeroItemRpcArgs,
} from '../../utils/item-lifecycle-rpc';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ItemLifecycleService {
  private readonly backend = inject(Backend);

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
      .pipe(map((rows) => mapVendorScrapHeroItemResult(
        firstRpcRow(rows, 'Item lifecycle workflow'),
      )));
  }

  bulkVendorScrapHeroItems(
    input: BulkVendorScrapHeroItemsInput,
  ): Observable<BulkVendorScrapHeroItemsResult> {
    return this.backend
      .rpc<BulkVendorScrapHeroItemsRpcRow[]>(
        RPC.bulk_vendor_scrap_hero_items,
        toBulkVendorScrapHeroItemsRpcArgs(input),
      )
      .pipe(map((rows) => mapBulkVendorScrapHeroItemsResult(
        firstRpcRow(rows, 'Bulk item lifecycle workflow'),
      )));
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
      .pipe(map((rows) => mapItemLifecycleOperationResult(
        firstRpcRow(rows, 'Item lifecycle workflow'),
      )));
  }
}
