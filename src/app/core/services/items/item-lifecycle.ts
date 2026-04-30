import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ItemLifecycleOperationResult,
  RecoverableScrappedItemSearchResult,
  RecoverScrappedItemInput,
  SearchRecoverableScrappedItemsInput,
  ScrapHeroItemInput,
} from '../../domain/item/item-lifecycle.model';
import {
  RecoverScrappedItemRpcRow,
  SearchRecoverableScrappedItemsPageRpcRow,
  ScrapHeroItemRpcRow,
} from '../../types/item-lifecycle-rpc.types';
import {
  mapItemLifecycleOperationResult,
  mapRecoverableScrappedItemSearchResult,
  toRecoverScrappedItemRpcArgs,
  toSearchRecoverableScrappedItemsPageRpcArgs,
  toScrapHeroItemRpcArgs,
} from '../../utils/item-lifecycle-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ItemLifecycleService {
  private readonly backend = inject(Backend);

  scrapHeroItem(input: ScrapHeroItemInput): Observable<ItemLifecycleOperationResult> {
    return this.backend
      .rpc<ScrapHeroItemRpcRow[]>(
        RPC.scrap_hero_item,
        toScrapHeroItemRpcArgs(input),
      )
      .pipe(map((rows) => mapItemLifecycleOperationResult(firstRow(rows))));
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
      .rpc<RecoverScrappedItemRpcRow[]>(
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
