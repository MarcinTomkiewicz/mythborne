import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CreateDirectTradeOfferInput,
  DirectTradeHeroTarget,
  DirectTradeHeroTargetSearchInput,
  DirectTradeItemTarget,
  DirectTradeItemTargetSearchInput,
  DirectTradeMutationResult,
  DirectTradeOfferActionInput,
  RespondDirectTradeOfferInput,
} from '../../domain/trade/direct-trade.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { DirectTradeOfferIdRpcResult } from '../../types/direct-trade-rpc.types';
import { Row } from '../../types/supabase.types';
import {
  toCancelPlayerDirectTradeOfferRpcArgs,
  toConfirmPlayerDirectTradeOfferRpcArgs,
  toCreatePlayerDirectTradeOfferRpcArgs,
  toRejectPlayerDirectTradeOfferRpcArgs,
  toRespondPlayerDirectTradeOfferRpcArgs,
} from '../../utils/direct-trade-rpc';
import { displayValue } from '../../utils/display-value';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

const DEFAULT_SEARCH_LIMIT = 20;

@Injectable({ providedIn: 'root' })
export class DirectTradeActions {
  private readonly backend = inject(Backend);

  createOffer(input: CreateDirectTradeOfferInput): Observable<DirectTradeMutationResult> {
    return this.backend
      .rpc<DirectTradeOfferIdRpcResult>(
        RPC.create_player_direct_trade_offer,
        toCreatePlayerDirectTradeOfferRpcArgs(input),
      )
      .pipe(map(toMutationResult));
  }

  respondToOffer(
    input: RespondDirectTradeOfferInput,
  ): Observable<DirectTradeMutationResult> {
    return this.backend
      .rpc<DirectTradeOfferIdRpcResult>(
        RPC.respond_player_direct_trade_offer,
        toRespondPlayerDirectTradeOfferRpcArgs(input),
      )
      .pipe(map(toMutationResult));
  }

  confirmOffer(input: DirectTradeOfferActionInput): Observable<DirectTradeMutationResult> {
    return this.backend
      .rpc<DirectTradeOfferIdRpcResult>(
        RPC.confirm_player_direct_trade_offer,
        toConfirmPlayerDirectTradeOfferRpcArgs(input),
      )
      .pipe(map(toMutationResult));
  }

  cancelOffer(input: DirectTradeOfferActionInput): Observable<DirectTradeMutationResult> {
    return this.backend
      .rpc<DirectTradeOfferIdRpcResult>(
        RPC.cancel_player_direct_trade_offer,
        toCancelPlayerDirectTradeOfferRpcArgs(input),
      )
      .pipe(map(toMutationResult));
  }

  rejectOffer(input: DirectTradeOfferActionInput): Observable<DirectTradeMutationResult> {
    return this.backend
      .rpc<DirectTradeOfferIdRpcResult>(
        RPC.reject_player_direct_trade_offer,
        toRejectPlayerDirectTradeOfferRpcArgs(input),
      )
      .pipe(map(toMutationResult));
  }

  searchHeroTargets(
    input: DirectTradeHeroTargetSearchInput,
  ): Observable<DirectTradeHeroTarget[]> {
    // `search_trade_offer_targets` searches existing trade offers for evidence/report
    // linking. Creating a new direct trade needs a hero candidate picker instead.
    const serverId = requiredText(input.serverId, 'serverId');
    const activeHeroId = requiredText(input.activeHeroId, 'activeHeroId');
    const query = requiredText(input.query, 'query');

    return this.backend
      .getAll<Pick<Row<'hero'>, 'id' | 'name'>>({
        table: TABLES.hero,
        select: 'id, name',
        filters: {
          serverId: eq(serverId),
          id: { operator: FilterOperator.NE, value: activeHeroId },
          name: like(query),
        },
        orderBy: [{ column: 'name' }],
        range: toRange(input.limit),
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapHeroTarget)));
  }

  searchOwnItemTargets(
    input: DirectTradeItemTargetSearchInput,
  ): Observable<DirectTradeItemTarget[]> {
    const serverId = requiredText(input.serverId, 'serverId');
    const heroId = requiredText(input.heroId, 'heroId');
    const query = requiredText(input.query, 'query');

    return this.backend
      .getAll<Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'>>({
        table: TABLES.items,
        select: 'id, name, status, drachma_value',
        filters: {
          serverId: eq(serverId),
          heroId: eq(heroId),
          status: eq('active'),
          name: like(query),
        },
        orderBy: [{ column: 'name' }],
        range: toRange(input.limit),
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapItemTarget)));
  }
}

function toMutationResult(offerId: string): DirectTradeMutationResult {
  const normalized = requiredText(offerId, 'offerId');

  return { offerId: normalized };
}

function mapHeroTarget(row: Pick<Row<'hero'>, 'id' | 'name'>): DirectTradeHeroTarget {
  return {
    heroId: row.id,
    heroName: row.name,
    label: row.name,
    description: `Hero ID: ${row.id}`,
  };
}

function mapItemTarget(
  row: Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'>,
): DirectTradeItemTarget {
  const value = displayValue(row.drachma_value);

  return {
    itemId: row.id,
    itemName: row.name,
    itemStatus: row.status,
    drachmaValue: row.drachma_value,
    label: row.name,
    description: `Value: ${value}`,
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for direct trade workflow.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function like(value: string): FilterDefinition {
  return { operator: FilterOperator.LIKE, value: `%${value}%` };
}

function toRange(limit: number | null | undefined): { from: number; to: number } {
  const normalized =
    limit === null || limit === undefined ? DEFAULT_SEARCH_LIMIT : Math.floor(Number(limit));
  const safeLimit =
    Number.isFinite(normalized) && normalized > 0 ? normalized : DEFAULT_SEARCH_LIMIT;

  return { from: 0, to: safeLimit - 1 };
}
