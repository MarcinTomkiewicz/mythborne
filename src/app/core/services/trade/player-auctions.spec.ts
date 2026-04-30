import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { PlayerAuctions } from './player-auctions';

describe('PlayerAuctions', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerAuctions;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'delete',
      'rpc',
    ]);
    backend.getAll.and.callFake(((opts: { table: string }) => {
      switch (opts.table) {
        case TABLES.player_auction_listings:
          return of([listingRow()]);
        case TABLES.player_auction_bids:
          return of([bidRow()]);
        case TABLES.hero:
          return of([
            { id: 'hero-1', name: 'Seller' },
            { id: 'hero-2', name: 'Bidder' },
          ]);
        case TABLES.items:
          return of([itemRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [PlayerAuctions, { provide: Backend, useValue: backend }],
    });
    service = TestBed.inject(PlayerAuctions);
  });

  it('loads server-scoped auction listings with item, seller and bid labels', async () => {
    const overview = await firstValueFrom(
      service.getAuctionsForHero({ serverId: 'server-1', heroId: 'hero-2' }),
    );

    expect(overview.listings.length).toBe(1);
    expect(overview.listings[0].seller.heroName).toBe('Seller');
    expect(overview.listings[0].item.itemName).toBe('Auction blade');
    expect(overview.listings[0].bids[0].bidder.heroName).toBe('Bidder');
    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.player_auction_listings,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        }),
        camelCase: false,
      }),
    );
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });
});

function listingRow(): Row<'player_auction_listings'> {
  return {
    auction_mode: 'bidding_with_buy_now',
    buy_now_character_points: 50,
    cancelled_at: null,
    completed_at: null,
    created_at: '2026-04-30T10:00:00.000Z',
    current_bid_character_points: 20,
    current_highest_bidder_hero_id: 'hero-2',
    description: null,
    ends_at: '2026-04-30T11:00:00.000Z',
    expired_at: null,
    failed_at: null,
    id: 'listing-1',
    item_id: 'item-1',
    seller_hero_id: 'hero-1',
    server_id: 'server-1',
    starting_bid_character_points: 10,
    starts_at: '2026-04-30T10:00:00.000Z',
    status: 'active',
    status_reason: null,
    updated_at: '2026-04-30T10:05:00.000Z',
  };
}

function bidRow(): Row<'player_auction_bids'> {
  return {
    amount_character_points: 20,
    bidder_hero_id: 'hero-2',
    cancelled_at: null,
    created_at: '2026-04-30T10:05:00.000Z',
    failed_at: null,
    id: 'bid-1',
    listing_id: 'listing-1',
    refunded_at: null,
    status: 'winning',
    status_reason: null,
  };
}

function itemRow(): Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'> {
  return {
    id: 'item-1',
    name: 'Auction blade',
    status: 'locked_auction',
    drachma_value: 200,
  };
}
