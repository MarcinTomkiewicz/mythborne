import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import {
  ItemLifecycleOperationResult,
  RecoverableScrappedItem,
  RecoverableScrappedItemSearchResult,
} from '../../domain/item/item-lifecycle.model';
import { ItemLifecycleService } from './item-lifecycle';
import { ScrappedItemRecoveryState } from './scrapped-item-recovery.state';

describe('ScrappedItemRecoveryState', () => {
  let lifecycle: jasmine.SpyObj<ItemLifecycleService>;
  let state: ScrappedItemRecoveryState;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj<ItemLifecycleService>(
      'ItemLifecycleService',
      ['searchRecoverableScrappedItems', 'recoverScrappedItem'],
    );
    lifecycle.searchRecoverableScrappedItems.and.returnValue(of(searchResult()));
    lifecycle.recoverScrappedItem.and.returnValue(of(recoveryResult()));

    TestBed.configureTestingModule({
      providers: [
        ScrappedItemRecoveryState,
        { provide: ItemLifecycleService, useValue: lifecycle },
      ],
    });

    state = TestBed.inject(ScrappedItemRecoveryState);
  });

  it('searches recoverable scrapped affix items through the lifecycle service', () => {
    state.searchForm.controls.query.setValue(' blade ');

    state.search('server-1', true);

    expect(lifecycle.searchRecoverableScrappedItems).toHaveBeenCalledWith({
      serverId: 'server-1',
      query: ' blade ',
      limit: 25,
      offset: 0,
    });
    expect(state.items()[0].itemId).toBe('item-1');
    expect(state.totalCount()).toBe(1);
  });

  it('recovers a scrapped item to its owner and refreshes the DB read model', () => {
    lifecycle.searchRecoverableScrappedItems.and.returnValues(
      of(searchResult()),
      of(searchResult([])),
    );
    state.search('server-1', true);
    state.recoveryForm.controls.reason.setValue('Accepted staff recovery');

    state.recover(recoverableItem(), 'server-1', true);

    expect(lifecycle.recoverScrappedItem).toHaveBeenCalledWith({
      itemId: 'item-1',
      targetHeroId: 'hero-1',
      reason: 'Accepted staff recovery',
    });
    expect(lifecycle.searchRecoverableScrappedItems).toHaveBeenCalledTimes(2);
    expect(state.items()).toEqual([]);
    expect(state.message()).toContain('Recovered Recovered blade to Owner hero.');
  });

  it('keeps successful recovery feedback when the post-recovery search fails', () => {
    lifecycle.searchRecoverableScrappedItems.and.returnValues(
      of(searchResult()),
      throwError(() => new Error('read model unavailable')),
    );
    state.search('server-1', true);
    state.recoveryForm.controls.reason.setValue('Accepted staff recovery');

    state.recover(recoverableItem(), 'server-1', true);

    expect(state.message()).toContain('Recovered Recovered blade');
    expect(state.error()).toContain('read model unavailable');
  });

  it('requires a reason before calling the recovery RPC', () => {
    state.recover(recoverableItem(), 'server-1', true);

    expect(lifecycle.recoverScrappedItem).not.toHaveBeenCalled();
    expect(state.error()).toBe('Recovery reason is required.');
  });

  it('ignores stale recovery success after reset', () => {
    const recovery = new Subject<ItemLifecycleOperationResult>();
    lifecycle.recoverScrappedItem.and.returnValue(recovery);
    state.recoveryForm.controls.reason.setValue('Accepted staff recovery');

    state.recover(recoverableItem(), 'server-1', true);
    state.reset();
    recovery.next(recoveryResult());
    recovery.complete();

    expect(state.message()).toBeNull();
    expect(lifecycle.searchRecoverableScrappedItems).not.toHaveBeenCalled();
  });
});

function searchResult(
  items: RecoverableScrappedItem[] = [recoverableItem()],
): RecoverableScrappedItemSearchResult {
  return {
    items,
    totalCount: items.length,
  };
}

function recoverableItem(
  overrides: Partial<RecoverableScrappedItem> = {},
): RecoverableScrappedItem {
  return {
    itemId: 'item-1',
    itemDisplayName: 'Recovered blade',
    itemValue: 120,
    generationBaseId: 'base-1',
    generationQualityKey: 'normal',
    prefixAffixId: 'prefix-1',
    suffixAffixId: null,
    ownerHeroId: 'hero-1',
    ownerHeroName: 'Owner hero',
    ownerUserId: 'user-1',
    ownerDisplayName: 'Owner account',
    scrappedAt: '2026-05-01T10:00:00.000Z',
    recoverableUntil: '2026-06-01T10:00:00.000Z',
    matchKind: 'item_name',
    technicalLabel: 'item-1',
    ...overrides,
  };
}

function recoveryResult(): ItemLifecycleOperationResult {
  return {
    itemId: 'item-1',
    status: 'active',
    scrappedAt: null,
    recoverableUntil: null,
    auditLogId: 'audit-1',
  };
}
