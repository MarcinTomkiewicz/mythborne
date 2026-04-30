import { Row } from '../types/supabase.types';
import {
  mapDirectTradeOffer,
  mapDirectTradeOfferItem,
  mapDirectTradeParticipantLabels,
  mapDirectTradeTransaction,
  mapDirectTradeTransactionItem,
} from './direct-trade-mappers';

describe('direct trade mappers', () => {
  it('maps direct trade offers with participant labels and linked item labels', () => {
    const item = mapDirectTradeOfferItem(offerItemRow(), itemMap([itemRow()]));
    const labels = mapDirectTradeParticipantLabels([
      heroRow('hero-1', 'Creator'),
      heroRow('hero-2', 'Target'),
    ]);

    expect(
      mapDirectTradeOffer(offerRow(), {
        items: [item],
        participantLabels: labels,
      }),
    ).toEqual(
      jasmine.objectContaining({
        id: 'offer-1',
        serverId: 'server-1',
        status: 'pending_target',
        creator: { heroId: 'hero-1', heroName: 'Creator' },
        target: { heroId: 'hero-2', heroName: 'Target' },
        creatorCharacterPoints: 10,
        targetCharacterPoints: 0,
        items: [
          jasmine.objectContaining({
            itemId: 'item-1',
            itemName: 'Trade blade',
            itemStatus: 'locked_trade',
          }),
        ],
      }),
    );
  });

  it('maps direct trade transactions using item snapshots', () => {
    const item = mapDirectTradeTransactionItem(transactionItemRow());
    const labels = mapDirectTradeParticipantLabels([
      heroRow('hero-1', 'Creator'),
      heroRow('hero-2', 'Target'),
    ]);

    expect(
      mapDirectTradeTransaction(transactionRow(), {
        items: [item],
        participantLabels: labels,
      }),
    ).toEqual(
      jasmine.objectContaining({
        id: 'transaction-1',
        transactionType: 'direct_trade',
        status: 'completed',
        creator: { heroId: 'hero-1', heroName: 'Creator' },
        target: { heroId: 'hero-2', heroName: 'Target' },
        items: [
          jasmine.objectContaining({
            itemId: 'item-1',
            itemName: 'Snapshot blade',
            generationQualityLabel: 'Fine',
          }),
        ],
      }),
    );
  });
});

function itemMap(rows: Row<'items'>[]): ReadonlyMap<string, Row<'items'>> {
  return new Map(rows.map((row) => [row.id, row]));
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
