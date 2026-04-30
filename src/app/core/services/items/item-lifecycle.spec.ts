import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { ItemLifecycleService } from './item-lifecycle';

describe('ItemLifecycleService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ItemLifecycleService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc', 'delete']);

    TestBed.configureTestingModule({
      providers: [ItemLifecycleService, { provide: Backend, useValue: backend }],
    });

    service = TestBed.inject(ItemLifecycleService);
  });

  it('scraps hero items through the canonical lifecycle RPC', async () => {
    backend.rpc.and.returnValue(of([resultRow('item-1')]));

    const result = await firstValueFrom(
      service.scrapHeroItem({
        actorHeroId: 'hero-1',
        itemId: 'item-1',
        reason: 'Safe scrap',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.scrap_hero_item, {
      p_actor_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_reason: 'Safe scrap',
    });
    expect(backend.delete).not.toHaveBeenCalled();
    expect(result.itemId).toBe('item-1');
    expect(result.status).toBe('scrapped');
  });

  it('fails when the lifecycle RPC returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        service.scrapHeroItem({
          actorHeroId: 'hero-1',
          itemId: 'item-1',
        }),
      ),
    ).toBeRejectedWithError('Item lifecycle workflow returned no row.');
  });

  it('searches recoverable scrapped items through the canonical read model RPC', async () => {
    backend.rpc.and.returnValue(of([searchRow('item-1')]));

    const result = await firstValueFrom(
      service.searchRecoverableScrappedItems({
        serverId: 'server-1',
        query: 'blade',
        limit: 10,
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.search_recoverable_scrapped_items_page,
      {
        p_server_id: 'server-1',
        p_query: 'blade',
        p_limit: 10,
      },
    );
    expect(result.totalCount).toBe(1);
    expect(result.items[0].itemId).toBe('item-1');
  });

  it('recovers scrapped items through the canonical lifecycle RPC', async () => {
    backend.rpc.and.returnValue(of([resultRow('item-1')]));

    const result = await firstValueFrom(
      service.recoverScrappedItem({
        itemId: 'item-1',
        targetHeroId: 'hero-2',
        reason: 'Accepted anti-abuse recovery',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.recover_scrapped_item, {
      p_item_id: 'item-1',
      p_target_hero_id: 'hero-2',
      p_reason: 'Accepted anti-abuse recovery',
    });
    expect(backend.delete).not.toHaveBeenCalled();
    expect(result.itemId).toBe('item-1');
  });
});

function resultRow(itemId: string) {
  return {
    item_id: itemId,
    status: 'scrapped' as const,
    scrapped_at: '2026-04-30T10:00:00.000Z',
    recoverable_until: '2026-05-07T10:00:00.000Z',
    audit_log_id: 'audit-1',
  };
}

function searchRow(itemId: string) {
  return {
    item_id: itemId,
    item_display_name: 'Recovered blade',
    item_value: 120,
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    prefix_affix_id: 'prefix-1',
    suffix_affix_id: 'suffix-1',
    owner_hero_id: 'hero-1',
    owner_hero_name: 'Owner',
    owner_user_id: 'user-1',
    owner_display_name: 'Owner account',
    scrapped_at: '2026-04-30T10:00:00.000Z',
    recoverable_until: '2026-05-07T10:00:00.000Z',
    match_kind: 'name',
    technical_label: itemId,
    total_count: 1,
  };
}
