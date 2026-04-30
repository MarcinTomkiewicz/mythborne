import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { DirectTrades } from './direct-trades';

describe('DirectTrades', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: DirectTrades;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'delete',
      'rpc',
    ]);
    backend.getAll.and.callFake(((opts: { table: string; filters?: Record<string, unknown> }) => {
      switch (opts.table) {
        case TABLES.player_trade_offers:
          return offerRowsFor(opts);
        case TABLES.player_trade_transactions:
          return transactionRowsFor(opts);
        case TABLES.player_trade_offer_items:
          return of([offerItemRow()]);
        case TABLES.player_trade_transaction_items:
          return of([transactionItemRow()]);
        case TABLES.hero:
          return of([heroRow('hero-1', 'Creator'), heroRow('hero-2', 'Target')]);
        case TABLES.items:
          return of([itemRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [DirectTrades, { provide: Backend, useValue: backend }],
    });
    service = TestBed.inject(DirectTrades);
  });

  it('loads active direct trade offers and direct trade transactions for a hero', async () => {
    const overview = await firstValueFrom(
      service.getTradesForHero({ serverId: ' server-1 ', heroId: ' hero-1 ' }),
    );

    expect(overview.offers.map((entry) => entry.id)).toEqual(['offer-1']);
    expect(overview.offers[0]).toEqual(
      jasmine.objectContaining({
        creator: { heroId: 'hero-1', heroName: 'Creator' },
        target: { heroId: 'hero-2', heroName: 'Target' },
        creatorCharacterPoints: 10,
      }),
    );
    expect(overview.offers[0].items[0]).toEqual(
      jasmine.objectContaining({
        itemId: 'item-1',
        itemName: 'Trade blade',
        itemStatus: 'locked_trade',
      }),
    );
    expect(overview.transactions.map((entry) => entry.id)).toEqual(['transaction-1']);
    expect(overview.transactions[0].items[0].itemName).toBe('Snapshot blade');
  });

  it('queries direct trade rows by selected server and active hero only', async () => {
    await firstValueFrom(
      service.getTradesForHero({ serverId: 'server-1', heroId: 'hero-1' }),
    );

    const calls = backend.getAll.calls.allArgs().map(([options]) => options);

    expect(calls[0]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_trade_offers,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          status: {
            operator: FilterOperator.IN,
            value: ['pending_target', 'pending_creator'],
          },
          creatorHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        },
        camelCase: false,
      }),
    );
    expect(calls[1]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_trade_offers,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          targetHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        }),
      }),
    );
    expect(calls[2]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_trade_transactions,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          transactionType: { operator: FilterOperator.EQ, value: 'direct_trade' },
          creatorHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        }),
      }),
    );
  });

  it('does not leak cross-server offers or auction transactions into direct trade overview', async () => {
    const overview = await firstValueFrom(
      service.getTradesForHero({ serverId: 'server-1', heroId: 'hero-1' }),
    );

    expect(overview.offers.map((entry) => entry.id)).not.toContain('offer-cross');
    expect(overview.transactions.map((entry) => entry.id)).not.toContain(
      'transaction-auction',
    );

    const calls = backend.getAll.calls.allArgs().map(([options]) => options);
    expect(calls).toContain(
      jasmine.objectContaining({
        table: TABLES.hero,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        }),
      }),
    );
    expect(calls).toContain(
      jasmine.objectContaining({
        table: TABLES.items,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        }),
      }),
    );
  });

  it('does not introduce direct write or RPC mutation paths', async () => {
    await firstValueFrom(
      service.getTradesForHero({ serverId: 'server-1', heroId: 'hero-1' }),
    );

    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('requires selected server and active hero context', async () => {
    expect(() => service.getTradesForHero({ serverId: ' ', heroId: 'hero-1' })).toThrowError(
      'serverId is required for direct trade read model.',
    );
    expect(() => service.getTradesForHero({ serverId: 'server-1', heroId: ' ' })).toThrowError(
      'heroId is required for direct trade read model.',
    );
  });
});

function offerRowsFor(opts: {
  filters?: Record<string, unknown>;
}): ReturnType<Backend['getAll']> {
  if (opts.filters && 'creatorHeroId' in opts.filters) {
    return of([offerRow(), crossServerOfferRow()]);
  }

  return of([]);
}

function transactionRowsFor(opts: {
  filters?: Record<string, unknown>;
}): ReturnType<Backend['getAll']> {
  if (opts.filters && 'creatorHeroId' in opts.filters) {
    return of([transactionRow(), auctionTransactionRow()]);
  }

  return of([]);
}

function heroRow(id: string, name: string): Pick<Row<'hero'>, 'id' | 'name'> {
  return { id, name };
}

function offerRow(): Row<'player_trade_offers'> {
  return {
    accepted_by_creator_at: null,
    accepted_by_target_at: null,
    cancelled_at: null,
    completed_at: null,
    created_at: '2026-04-30T10:00:00.000Z',
    creator_character_points: 10,
    creator_hero_id: 'hero-1',
    description: 'Offer description',
    expires_at: '2026-05-01T10:00:00.000Z',
    failed_at: null,
    id: 'offer-1',
    rejected_at: null,
    server_id: 'server-1',
    status: 'pending_target',
    status_reason: null,
    target_character_points: 0,
    target_hero_id: 'hero-2',
    updated_at: '2026-04-30T10:00:00.000Z',
  };
}

function crossServerOfferRow(): Row<'player_trade_offers'> {
  return {
    ...offerRow(),
    id: 'offer-cross',
    server_id: 'server-2',
  };
}

function offerItemRow(): Row<'player_trade_offer_items'> {
  return {
    created_at: '2026-04-30T10:00:00.000Z',
    id: 'offer-item-1',
    item_id: 'item-1',
    offer_id: 'offer-1',
    offered_by_hero_id: 'hero-1',
    side: 'creator',
  };
}

function itemRow(): Row<'items'> {
  return {
    id: 'item-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    name: 'Trade blade',
    description: 'Locked item',
    status: 'locked_trade',
    generation_base_id: 'base-1',
    generation_quality_key: 'quality',
    prefix_affix_id: null,
    suffix_affix_id: null,
    armory_shelf_position: 0,
    drachma_value: 120,
    metadata_json: {},
    generated_at: '2026-04-30T10:00:00.000Z',
    scrapped_at: null,
    recoverable_until: null,
    created_at: '2026-04-30T10:00:00.000Z',
    updated_at: '2026-04-30T10:00:00.000Z',
  };
}

function transactionRow(): Row<'player_trade_transactions'> {
  return {
    auction_listing_id: null,
    completed_at: '2026-04-30T11:00:00.000Z',
    created_at: '2026-04-30T11:00:00.000Z',
    creator_character_points: 10,
    creator_hero_id: 'hero-1',
    description: 'Completed trade',
    failed_at: null,
    id: 'transaction-1',
    offer_id: 'offer-1',
    reason: 'direct trade',
    reversed_at: null,
    server_id: 'server-1',
    status: 'completed',
    target_character_points: 0,
    target_hero_id: 'hero-2',
    transaction_type: 'direct_trade',
  };
}

function auctionTransactionRow(): Row<'player_trade_transactions'> {
  return {
    ...transactionRow(),
    auction_listing_id: 'auction-1',
    id: 'transaction-auction',
    transaction_type: 'auction_sale',
  };
}

function transactionItemRow(): Row<'player_trade_transaction_items'> {
  return {
    created_at: '2026-04-30T11:00:00.000Z',
    from_hero_id: 'hero-1',
    generation_base_id_snapshot: 'base-1',
    generation_base_key_snapshot: 'blade',
    generation_base_name_snapshot: 'Blade',
    generation_base_type_key_snapshot: 'weapon',
    generation_quality_key_snapshot: 'fine',
    generation_quality_label_snapshot: 'Fine',
    has_prefix_snapshot: false,
    has_suffix_snapshot: false,
    id: 'transaction-item-1',
    item_drachma_value_snapshot: 120,
    item_id: 'item-1',
    item_name_snapshot: 'Snapshot blade',
    item_snapshot_json: {},
    prefix_affix_id_snapshot: null,
    prefix_affix_key_snapshot: null,
    prefix_affix_name_snapshot: null,
    server_id: 'server-1',
    suffix_affix_id_snapshot: null,
    suffix_affix_key_snapshot: null,
    suffix_affix_name_snapshot: null,
    to_hero_id: 'hero-2',
    transaction_id: 'transaction-1',
    value_bucket_snapshot: 1,
  };
}
