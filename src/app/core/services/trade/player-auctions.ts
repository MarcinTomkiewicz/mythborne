import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  AuctionBidsPage,
  AuctionCreateContext,
  AuctionListingsFilters,
  AuctionListingsPage,
  AuctionListingsSearchPage,
  AuctionPageContext,
  AuctionPageCopy,
} from '../../domain/trade/player-auction.model';
import {
  GetAuctionBidsPageRpcArgs,
  GetAuctionBidsPageRpcResult,
  GetAuctionCreateContextRpcArgs,
  GetAuctionCreateContextRpcResult,
  GetAuctionListingsPageRpcArgs,
  GetAuctionListingsPageRpcResult,
  GetAuctionPageContextRpcArgs,
  GetAuctionPageContextRpcResult,
  GetAuctionPageCopyRpcResult,
  SearchAuctionListingsPageRpcArgs,
  SearchAuctionListingsPageRpcResult,
} from '../../types/player-auction-rpc.types';
import { mapAuctionBidsPage } from '../../utils/auction-bids-page.mapper';
import { mapAuctionCreateContext } from '../../utils/auction-create-context.mapper';
import {
  mapAuctionListingsPage,
  mapAuctionListingsSearchPage,
} from '../../utils/auction-listings-page.mapper';
import { mapAuctionPageContext } from '../../utils/auction-page-context.mapper';
import { mapAuctionPageCopy } from '../../utils/auction-page-copy.mapper';
import { Json } from '../../types/database.types';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerAuctions {
  private readonly backend = inject(Backend);

  getPageCopy(): Observable<AuctionPageCopy> {
    return this.backend
      .rpc<GetAuctionPageCopyRpcResult>(RPC.get_auction_page_copy)
      .pipe(map(mapAuctionPageCopy));
  }

  getPageContext(heroId: string, serverId: string): Observable<AuctionPageContext> {
    const args: GetAuctionPageContextRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
    };
    const expectedServerId = requiredText(serverId, 'serverId');

    return this.backend
      .rpc<GetAuctionPageContextRpcResult>(RPC.get_auction_page_context, args)
      .pipe(
        map((context) =>
          mapAuctionPageContext(context, {
            heroId: args.p_hero_id,
            serverId: expectedServerId,
          }),
        ),
      );
  }

  searchListingsPage(
    heroId: string,
    query: string | null,
    filters: AuctionListingsFilters,
    limit: number,
    offset: number,
  ): Observable<AuctionListingsSearchPage> {
    const args: SearchAuctionListingsPageRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
      p_query: trimToNull(query) ?? undefined,
      p_filters: auctionFiltersJson(filters),
      p_limit: limit,
      p_offset: offset,
    };

    return this.backend
      .rpc<SearchAuctionListingsPageRpcResult>(RPC.search_auction_listings_page, args)
      .pipe(map(mapAuctionListingsSearchPage));
  }

  getMyListingsPage(
    heroId: string,
    limit: number,
    offset: number,
  ): Observable<AuctionListingsPage> {
    const args: GetAuctionListingsPageRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
      p_limit: limit,
      p_offset: offset,
    };

    return this.backend
      .rpc<GetAuctionListingsPageRpcResult>(RPC.get_auction_listings_page, args)
      .pipe(map(mapAuctionListingsPage));
  }

  getMyBidsPage(heroId: string, limit: number, offset: number): Observable<AuctionBidsPage> {
    const args: GetAuctionBidsPageRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
      p_limit: limit,
      p_offset: offset,
    };

    return this.backend
      .rpc<GetAuctionBidsPageRpcResult>(RPC.get_auction_bids_page, args)
      .pipe(map(mapAuctionBidsPage));
  }

  getCreateContext(
    heroId: string,
    limit: number,
    offset: number,
  ): Observable<AuctionCreateContext> {
    const args: GetAuctionCreateContextRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
      p_limit: limit,
      p_offset: offset,
    };

    return this.backend
      .rpc<GetAuctionCreateContextRpcResult>(RPC.get_auction_create_context, args)
      .pipe(map(mapAuctionCreateContext));
  }
}

function auctionFiltersJson(filters: AuctionListingsFilters): Json {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null),
  ) as Json;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for auction page RPC.`);
  }

  return normalized;
}
