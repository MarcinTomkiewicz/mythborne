import { Row } from '../types/supabase.types';
import { isPlayerUsableItemStatus } from '../domain/item/item.model';
import { mapItemReadModel } from './item-mappers';

describe('item mappers', () => {
  it('maps item lifecycle fields from runtime item rows', () => {
    const row = itemRow();
    const item = mapItemReadModel(row);

    expect(item.id).toBe('item-1');
    expect(item.serverId).toBe('server-1');
    expect(item.heroId).toBe('hero-1');
    expect(item.name).toBe('Recovered blade');
    expect(item.status).toBe('scrapped');
    expect(item.scrappedAt).toBe('2026-04-28T10:00:00.000Z');
    expect(item.recoverableUntil).toBe('2026-05-05T10:00:00.000Z');
    expect(item.updatedAt).toBe('2026-04-29T10:00:00.000Z');
    expect(item.armoryShelfPosition).toBe(12);
    expect(item.drachmaValue).toBe(240);
    expect(item.metadataJson as unknown).toBe(row.metadata_json as unknown);
  });

  it('treats only active item status as player usable', () => {
    expect(isPlayerUsableItemStatus('active')).toBeTrue();
    expect(isPlayerUsableItemStatus('scrapped')).toBeFalse();
    expect(isPlayerUsableItemStatus('locked_trade')).toBeFalse();
    expect(isPlayerUsableItemStatus('locked_auction')).toBeFalse();
  });
});

function itemRow(): Row<'items'> {
  return {
    id: 'item-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    name: 'Recovered blade',
    description: 'Lifecycle-aware item.',
    status: 'scrapped',
    generation_base_id: 'base-1',
    generation_quality_key: 'quality',
    prefix_affix_id: 'prefix-1',
    suffix_affix_id: 'suffix-1',
    armory_shelf_position: 12,
    drachma_value: 240,
    metadata_json: { source: 'spec' },
    generated_at: '2026-04-27T10:00:00.000Z',
    scrapped_at: '2026-04-28T10:00:00.000Z',
    recoverable_until: '2026-05-05T10:00:00.000Z',
    created_at: '2026-04-27T10:00:00.000Z',
    updated_at: '2026-04-29T10:00:00.000Z',
  };
}
