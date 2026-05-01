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
  mapPlayerAuctionTransaction,
} from '../../utils/player-auction-mappers';
import { mapDirectTradeTransactionItem } from '../../utils/direct-trade-mappers';
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

    return forkJoin({
      listings: this.getListings(serverId),
      creatorTransactions: this.getTransactions(serverId, { creatorHeroId: heroId }),
      targetTransactions: this.getTransactions(serverId, { targetHeroId: heroId }),
    }).pipe(
      switchMap((base) => {
        const transactions = uniqueRowsById([
          ...base.creatorTransactions,
          ...base.targetTransactions,
        ])
          .filter(
            (entry) =>
              entry.server_id === serverId && entry.transaction_type === 'auction_sale',
          )
          .sort((left, right) => right.created_at.localeCompare(left.created_at));
        const listingIds = base.listings.map((entry) => entry.id);
        const transactionIds = transactions.map((entry) => entry.id);

        return forkJoin({
          listings: of(base.listings),
          transactions: of(transactions),
          bids: this.getBids(listingIds),
          transactionItems: this.getTransactionItems(serverId, transactionIds),
          items: this.getItemLabels(
            serverId,
            uniqueTexts(base.listings.map((entry) => entry.item_id)),
          ),
        });
      }),
      switchMap((base) => {
        const heroIds = uniqueTexts([
          ...base.listings.flatMap((entry) => [
            entry.seller_hero_id,
            entry.current_highest_bidder_hero_id,
          ]),
          ...base.bids.map((entry) => entry.bidder_hero_id),
          ...base.transactions.flatMap((entry) => [
            entry.creator_hero_id,
            entry.target_hero_id,
          ]),
          heroId,
        ]);

        return forkJoin({
          listings: of(base.listings),
          transactions: of(base.transactions),
          bids: of(base.bids),
          transactionItems: of(base.transactionItems),
          items: of(base.items),
          heroes: this.getHeroLabels(serverId, heroIds),
        });
      }),
      map((data) => {
        const participantLabels = mapPlayerAuctionParticipantLabels(data.heroes);
        const bids = data.bids.map((row) => mapPlayerAuctionBid(row, participantLabels));
        const transactionItems = data.transactionItems.map(mapDirectTradeTransactionItem);
        const itemLabels = mapPlayerAuctionItemLabels(data.items);

        return {
          listings: data.listings.map((listing) =>
            mapPlayerAuctionListing(listing, {
              bids,
              itemLabels,
              participantLabels,
            }),
          ),
          transactions: data.transactions.map((transaction) =>
            mapPlayerAuctionTransaction(transaction, {
              items: transactionItems,
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

  private getTransactions(
    serverId: string,
    filters: { creatorHeroId?: string; targetHeroId?: string },
  ): Observable<Row<'player_trade_transactions'>[]> {
    return this.backend.getAll<Row<'player_trade_transactions'>>({
      table: TABLES.player_trade_transactions,
      filters: {
        serverId: eq(serverId),
        transactionType: eq('auction_sale'),
        ...optionalFilters(filters),
      },
      orderBy: [{ column: 'created_at', ascending: false }],
      camelCase: false,
    });
  }

  private getTransactionItems(
    serverId: string,
    transactionIds: readonly string[],
  ): Observable<Row<'player_trade_transaction_items'>[]> {
    if (!transactionIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'player_trade_transaction_items'>>({
      table: TABLES.player_trade_transaction_items,
      filters: {
        serverId: eq(serverId),
        transactionId: inList(transactionIds),
      },
      orderBy: [{ column: 'created_at' }],
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

function optionalFilters(
  filters: Record<string, string | null | undefined>,
): Record<string, FilterDefinition> {
  return Object.entries(filters).reduce<Record<string, FilterDefinition>>(
    (result, [key, value]) => {
      const normalized = trimText(value);

      if (normalized) {
        result[key] = eq(normalized);
      }

      return result;
    },
    {},
  );
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}

function uniqueRowsById<T extends { id: string }>(rows: readonly T[]): T[] {
  const byId = new Map<string, T>();

  for (const row of rows) {
    byId.set(row.id, row);
  }

  return [...byId.values()];
}
