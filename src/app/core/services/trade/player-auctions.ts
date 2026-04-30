import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  PlayerAuctionListInput,
  PlayerAuctionOverviewReadModel,
} from '../../domain/trade/player-auction.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import {
  mapPlayerAuctionBid,
  mapPlayerAuctionItemLabels,
  mapPlayerAuctionListing,
  mapPlayerAuctionParticipantLabels,
} from '../../utils/player-auction-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

const AUCTION_LIST_STATUSES: readonly Row<'player_auction_listings'>['status'][] = [
  'active',
  'completed',
  'cancelled',
  'expired',
  'failed',
];

@Injectable({ providedIn: 'root' })
export class PlayerAuctions {
  private readonly backend = inject(Backend);

  getAuctionsForHero(
    input: PlayerAuctionListInput,
  ): Observable<PlayerAuctionOverviewReadModel> {
    const serverId = requiredText(input.serverId, 'serverId');
    const heroId = requiredText(input.heroId, 'heroId');

    return this.getListings(serverId).pipe(
      switchMap((listings) => {
        const listingIds = listings.map((entry) => entry.id);

        return forkJoin({
          listings: of(listings),
          bids: this.getBids(listingIds),
        });
      }),
      switchMap((base) => {
        const heroIds = uniqueTexts([
          ...base.listings.flatMap((entry) => [
            entry.seller_hero_id,
            entry.current_highest_bidder_hero_id,
          ]),
          ...base.bids.map((entry) => entry.bidder_hero_id),
          heroId,
        ]);

        return forkJoin({
          listings: of(base.listings),
          bids: of(base.bids),
          heroes: this.getHeroLabels(serverId, heroIds),
          items: this.getItemLabels(
            serverId,
            uniqueTexts(base.listings.map((entry) => entry.item_id)),
          ),
        });
      }),
      map((data) => {
        const participantLabels = mapPlayerAuctionParticipantLabels(data.heroes);
        const bids = data.bids.map((row) => mapPlayerAuctionBid(row, participantLabels));
        const itemLabels = mapPlayerAuctionItemLabels(data.items);

        return {
          listings: data.listings.map((listing) =>
            mapPlayerAuctionListing(listing, {
              bids,
              itemLabels,
              participantLabels,
            }),
          ),
        };
      }),
    );
  }

  private getListings(serverId: string): Observable<Row<'player_auction_listings'>[]> {
    return this.backend.getAll<Row<'player_auction_listings'>>({
      table: TABLES.player_auction_listings,
      filters: {
        serverId: eq(serverId),
        status: inList(AUCTION_LIST_STATUSES),
      },
      orderBy: [{ column: 'updated_at', ascending: false }],
      camelCase: false,
    });
  }

  private getBids(listingIds: readonly string[]): Observable<Row<'player_auction_bids'>[]> {
    if (!listingIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'player_auction_bids'>>({
      table: TABLES.player_auction_bids,
      filters: { listingId: inList(listingIds) },
      orderBy: [{ column: 'created_at', ascending: false }],
      camelCase: false,
    });
  }

  private getHeroLabels(
    serverId: string,
    heroIds: readonly string[],
  ): Observable<Pick<Row<'hero'>, 'id' | 'name'>[]> {
    if (!heroIds.length) {
      return of([]);
    }

    return this.backend.getAll<Pick<Row<'hero'>, 'id' | 'name'>>({
      table: TABLES.hero,
      select: 'id, name',
      filters: {
        serverId: eq(serverId),
        id: inList(heroIds),
      },
      camelCase: false,
    });
  }

  private getItemLabels(
    serverId: string,
    itemIds: readonly string[],
  ): Observable<Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'>[]> {
    if (!itemIds.length) {
      return of([]);
    }

    return this.backend.getAll<
      Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'>
    >({
      table: TABLES.items,
      select: 'id, name, status, drachma_value',
      filters: {
        serverId: eq(serverId),
        id: inList(itemIds),
      },
      camelCase: false,
    });
  }
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for player auction read model.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: readonly string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: [...values] };
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}
