import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { ItemLifecycleService } from './item-lifecycle';

describe('ItemLifecycleService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ItemLifecycleService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [ItemLifecycleService, { provide: Backend, useValue: backend }],
    });

    service = TestBed.inject(ItemLifecycleService);
  });

  it('loads vendor scrap payout percent through the canonical helper RPC', async () => {
    backend.rpc.and.returnValue(of(50));

    const result = await firstValueFrom(service.getVendorScrapDrachmaPayoutPercent());

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_vendor_scrap_drachma_payout_percent,
    );
    expect(result).toBe(50);
  });

  it('vendor scraps hero items through the canonical vendor RPC', async () => {
    backend.rpc.and.returnValue(of([vendorScrapResultRow('item-1')]));

    const result = await firstValueFrom(
      service.vendorScrapHeroItem({
        actorHeroId: 'hero-1',
        itemId: 'item-1',
        reason: 'Sold to vendor',
      }),
    );

    expect(backend.rpc.calls.allArgs()).toEqual([
      [
        RPC.vendor_scrap_hero_item,
        {
          p_actor_hero_id: 'hero-1',
          p_item_id: 'item-1',
          p_reason: 'Sold to vendor',
        },
      ],
    ]);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(result.itemId).toBe('item-1');
    expect(result.itemStatus).toBe('scrapped');
    expect(result.resourceType).toBe('drachma');
    expect(result.drachmaAmount).toBe(60);
    expect(result.balanceAfter).toBe(160);
  });

  it('fails when the vendor lifecycle RPC returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        service.vendorScrapHeroItem({
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
    backend.rpc.and.returnValue(of([recoveryResultRow('item-1')]));

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
    expect(result.status).toBe('active');
    expect(result.scrappedAt).toBeNull();
    expect(result.recoverableUntil).toBeNull();
  });
});

function vendorScrapResultRow(itemId: string) {
  return {
    item_id: itemId,
    item_status: 'scrapped' as const,
    scrapped_at: '2026-05-01T10:00:00.000Z',
    recoverable_until: null,
    resource_type: 'drachma',
    drachma_amount: 60,
    balance_after: 160,
    item_audit_log_id: 'audit-item-1',
    vendor_audit_log_id: 'audit-vendor-1',
  };
}

function recoveryResultRow(itemId: string) {
  return {
    item_id: itemId,
    status: 'active' as const,
    scrapped_at: null,
    recoverable_until: null,
    audit_log_id: 'audit-2',
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
