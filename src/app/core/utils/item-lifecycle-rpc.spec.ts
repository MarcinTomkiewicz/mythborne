import { resolveSafeItemScrapBehavior } from '../domain/item/item-lifecycle.model';
import {
  mapItemLifecycleOperationResult,
  mapRecoverableScrappedItemSearchResult,
  mapVendorScrapHeroItemResult,
  toRecoverScrappedItemRpcArgs,
  toSearchRecoverableScrappedItemsPageRpcArgs,
  toScrapHeroItemRpcArgs,
  toVendorScrapHeroItemRpcArgs,
} from './item-lifecycle-rpc';

describe('item lifecycle rpc mappers', () => {
  it('maps scrap workflow args without direct delete semantics', () => {
    expect(
      toScrapHeroItemRpcArgs({
        actorHeroId: ' hero-1 ',
        itemId: ' item-1 ',
        reason: ' obsolete ',
        requestId: ' request-1 ',
      }),
    ).toEqual({
      p_actor_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_reason: 'obsolete',
      p_request_id: 'request-1',
    });
  });

  it('maps vendor scrap workflow args without low-level resource composition', () => {
    expect(
      toVendorScrapHeroItemRpcArgs({
        actorHeroId: ' hero-1 ',
        itemId: ' item-1 ',
        reason: ' sold to vendor ',
        requestId: ' request-1 ',
      }),
    ).toEqual({
      p_actor_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_reason: 'sold to vendor',
      p_request_id: 'request-1',
    });
  });

  it('maps lifecycle workflow result rows', () => {
    expect(
      mapItemLifecycleOperationResult({
        item_id: 'item-1',
        status: 'scrapped',
        scrapped_at: '2026-04-30T10:00:00.000Z',
        recoverable_until: '2026-05-07T10:00:00.000Z',
        audit_log_id: 'audit-1',
      }),
    ).toEqual({
      itemId: 'item-1',
      status: 'scrapped',
      scrappedAt: '2026-04-30T10:00:00.000Z',
      recoverableUntil: '2026-05-07T10:00:00.000Z',
      auditLogId: 'audit-1',
    });
  });

  it('maps vendor scrap results with drachma payout and lifecycle outcome', () => {
    expect(
      mapVendorScrapHeroItemResult({
        item_id: 'item-1',
        item_status: 'scrapped',
        scrapped_at: '2026-05-01T10:00:00.000Z',
        recoverable_until: null,
        resource_type: 'drachma',
        drachma_amount: 60,
        balance_after: 160,
        item_audit_log_id: 'audit-item-1',
        vendor_audit_log_id: 'audit-vendor-1',
      }),
    ).toEqual({
      itemId: 'item-1',
      itemStatus: 'scrapped',
      scrappedAt: '2026-05-01T10:00:00.000Z',
      recoverableUntil: null,
      resourceType: 'drachma',
      drachmaAmount: 60,
      balanceAfter: 160,
      itemAuditLogId: 'audit-item-1',
      vendorAuditLogId: 'audit-vendor-1',
    });
  });

  it('maps recovery result rows with cleared lifecycle timestamps', () => {
    expect(
      mapItemLifecycleOperationResult({
        item_id: 'item-1',
        status: 'active',
        scrapped_at: null,
        recoverable_until: null,
        audit_log_id: 'audit-2',
      }),
    ).toEqual({
      itemId: 'item-1',
      status: 'active',
      scrappedAt: null,
      recoverableUntil: null,
      auditLogId: 'audit-2',
    });
  });

  it('maps recovery workflow args', () => {
    expect(
      toRecoverScrappedItemRpcArgs({
        itemId: ' item-1 ',
        targetHeroId: ' hero-2 ',
        reason: ' restore from sanction ',
        requestId: ' request-1 ',
      }),
    ).toEqual({
      p_item_id: 'item-1',
      p_target_hero_id: 'hero-2',
      p_reason: 'restore from sanction',
      p_request_id: 'request-1',
    });
  });

  it('maps recoverable scrapped item search args', () => {
    expect(
      toSearchRecoverableScrappedItemsPageRpcArgs({
        serverId: ' server-1 ',
        query: ' blade ',
        limit: 20.8,
        offset: 5.1,
      }),
    ).toEqual({
      p_server_id: 'server-1',
      p_query: 'blade',
      p_limit: 20,
      p_offset: 5,
    });
  });

  it('maps recoverable scrapped item search rows with total count', () => {
    expect(
      mapRecoverableScrappedItemSearchResult([
        {
          item_id: 'item-1',
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
          technical_label: 'item-1',
          total_count: 2,
        },
      ]),
    ).toEqual({
      totalCount: 2,
      items: [
        {
          itemId: 'item-1',
          itemDisplayName: 'Recovered blade',
          itemValue: 120,
          generationBaseId: 'base-1',
          generationQualityKey: 'normal',
          prefixAffixId: 'prefix-1',
          suffixAffixId: 'suffix-1',
          ownerHeroId: 'hero-1',
          ownerHeroName: 'Owner',
          ownerUserId: 'user-1',
          ownerDisplayName: 'Owner account',
          scrappedAt: '2026-04-30T10:00:00.000Z',
          recoverableUntil: '2026-05-07T10:00:00.000Z',
          matchKind: 'name',
          technicalLabel: 'item-1',
        },
      ],
    });
  });

  it('keeps affix-bearing or unknown-affix items on recoverable scrap path', () => {
    expect(
      resolveSafeItemScrapBehavior({
        prefixAffixId: 'prefix-1',
        suffixAffixId: null,
      }),
    ).toBe('recoverable_scrap');
    expect(resolveSafeItemScrapBehavior({ prefixAffixId: null })).toBe(
      'recoverable_scrap_unknown_affixes',
    );
  });

  it('only marks fully known no-affix items as permanent delete candidates', () => {
    expect(
      resolveSafeItemScrapBehavior({
        prefixAffixId: null,
        suffixAffixId: null,
      }),
    ).toBe('permanent_delete_candidate');
  });

  it('requires identifiers', () => {
    expect(() =>
      toScrapHeroItemRpcArgs({ actorHeroId: ' ', itemId: 'item-1' }),
    ).toThrowError('actorHeroId is required for item lifecycle workflow.');
    expect(() =>
      toVendorScrapHeroItemRpcArgs({ actorHeroId: 'hero-1', itemId: ' ' }),
    ).toThrowError('itemId is required for item lifecycle workflow.');
    expect(() =>
      toRecoverScrappedItemRpcArgs({
        itemId: 'item-1',
        targetHeroId: 'hero-1',
        reason: ' ',
      }),
    ).toThrowError('reason is required for item lifecycle workflow.');
    expect(() =>
      toSearchRecoverableScrappedItemsPageRpcArgs({ serverId: ' ' }),
    ).toThrowError('serverId is required for item lifecycle workflow.');
  });
});
