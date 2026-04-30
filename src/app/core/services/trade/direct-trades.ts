import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  DirectTradeListInput,
  DirectTradeOverviewReadModel,
} from '../../domain/trade/direct-trade.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import {
  mapDirectTradeOffer,
  mapDirectTradeOfferItem,
  mapDirectTradeParticipantLabels,
  mapDirectTradeTransaction,
  mapDirectTradeTransactionItem,
} from '../../utils/direct-trade-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

const ACTIVE_DIRECT_TRADE_OFFER_STATUSES: readonly Row<'player_trade_offers'>['status'][] =
  ['pending_target', 'pending_creator'];

@Injectable({ providedIn: 'root' })
export class DirectTrades {
  private readonly backend = inject(Backend);

  getTradesForHero(input: DirectTradeListInput): Observable<DirectTradeOverviewReadModel> {
    const serverId = requiredText(input.serverId, 'serverId');
    const heroId = requiredText(input.heroId, 'heroId');

    return forkJoin({
      creatorOffers: this.getOffers(serverId, { creatorHeroId: heroId }),
      targetOffers: this.getOffers(serverId, { targetHeroId: heroId }),
      creatorTransactions: this.getTransactions(serverId, { creatorHeroId: heroId }),
      targetTransactions: this.getTransactions(serverId, { targetHeroId: heroId }),
    }).pipe(
      switchMap((base) => {
        const offers = uniqueRowsById([
          ...base.creatorOffers,
          ...base.targetOffers,
        ])
          .filter((entry) => entry.server_id === serverId)
          .sort((left, right) => right.updated_at.localeCompare(left.updated_at));
        const transactions = uniqueRowsById([
          ...base.creatorTransactions,
          ...base.targetTransactions,
        ])
          .filter(
            (entry) =>
              entry.server_id === serverId && entry.transaction_type === 'direct_trade',
          )
          .sort((left, right) => right.created_at.localeCompare(left.created_at));
        const offerIds = offers.map((entry) => entry.id);
        const transactionIds = transactions.map((entry) => entry.id);

        return forkJoin({
          offers: of(offers),
          transactions: of(transactions),
          offerItems: this.getOfferItems(offerIds),
          transactionItems: this.getTransactionItems(serverId, transactionIds),
          heroes: this.getHeroLabels(
            serverId,
            uniqueTexts([
              ...offers.flatMap((entry) => [
                entry.creator_hero_id,
                entry.target_hero_id,
              ]),
              ...transactions.flatMap((entry) => [
                entry.creator_hero_id,
                entry.target_hero_id,
              ]),
            ]),
          ),
        });
      }),
      switchMap((base) => {
        const itemIds = uniqueTexts(base.offerItems.map((entry) => entry.item_id));

        return forkJoin({
          offers: of(base.offers),
          transactions: of(base.transactions),
          transactionItems: of(base.transactionItems),
          heroes: of(base.heroes),
          offerItemRows: of(base.offerItems),
          currentItems: this.getCurrentItems(serverId, itemIds),
        });
      }),
      map((data) => {
        const participantLabels = mapDirectTradeParticipantLabels(data.heroes);
        const currentItemById = new Map(data.currentItems.map((entry) => [entry.id, entry]));
        const offerItems = data.offerItemRows.map((entry) =>
          mapDirectTradeOfferItem(entry, currentItemById),
        );
        const transactionItems = data.transactionItems.map(mapDirectTradeTransactionItem);

        return {
          offers: data.offers.map((offer) =>
            mapDirectTradeOffer(offer, {
              items: offerItems,
              participantLabels,
            }),
          ),
          transactions: data.transactions.map((transaction) =>
            mapDirectTradeTransaction(transaction, {
              items: transactionItems,
              participantLabels,
            }),
          ),
        };
      }),
    );
  }

  private getOffers(
    serverId: string,
    filters: { creatorHeroId?: string; targetHeroId?: string },
  ): Observable<Row<'player_trade_offers'>[]> {
    return this.backend.getAll<Row<'player_trade_offers'>>({
      table: TABLES.player_trade_offers,
      filters: {
        serverId: eq(serverId),
        status: inList(ACTIVE_DIRECT_TRADE_OFFER_STATUSES),
        ...optionalFilters(filters),
      },
      orderBy: [{ column: 'updated_at', ascending: false }],
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
        transactionType: eq('direct_trade'),
        ...optionalFilters(filters),
      },
      orderBy: [{ column: 'created_at', ascending: false }],
      camelCase: false,
    });
  }

  private getOfferItems(
    offerIds: readonly string[],
  ): Observable<Row<'player_trade_offer_items'>[]> {
    if (!offerIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'player_trade_offer_items'>>({
      table: TABLES.player_trade_offer_items,
      filters: { offerId: inList(offerIds) },
      orderBy: [{ column: 'created_at' }],
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

  private getCurrentItems(
    serverId: string,
    itemIds: readonly string[],
  ): Observable<Row<'items'>[]> {
    if (!itemIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'items'>>({
      table: TABLES.items,
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
    throw new Error(`${field} is required for direct trade read model.`);
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
