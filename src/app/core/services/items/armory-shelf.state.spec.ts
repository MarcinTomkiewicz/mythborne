import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { PlayerArmoryReadModel } from '../../domain/item/player-armory-page-context.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { ArmoryShelfState } from './armory-shelf.state';
import { ItemLifecycleService } from './item-lifecycle';
import { PlayerArmory } from './player-armory';

describe('ArmoryShelfState', () => {
  let activeHero: FakeActiveHero;
  let armory: jasmine.SpyObj<PlayerArmory>;
  let lifecycle: jasmine.SpyObj<ItemLifecycleService>;
  let state: ArmoryShelfState;

  beforeEach(() => {
    activeHero = new FakeActiveHero();
    armory = jasmine.createSpyObj<PlayerArmory>('PlayerArmory', [
      'getArmoryReadModel',
      'renameShelf',
      'moveItemToShelf',
    ]);
    lifecycle = jasmine.createSpyObj<ItemLifecycleService>('ItemLifecycleService', [
      'vendorScrapHeroItem',
      'bulkVendorScrapHeroItems',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ArmoryShelfState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerArmory, useValue: armory },
        { provide: ItemLifecycleService, useValue: lifecycle },
      ],
    });
    state = TestBed.inject(ArmoryShelfState);
  });

  it('loads armory shelves and visible items', () => {
    armory.getArmoryReadModel.and.returnValue(readModelSubject(2));

    state.load();

    expect(state.status()).toBe('loaded');
    expect(state.isLoading()).toBeFalse();
    expect(state.shelves().length).toBe(11);
    expect(state.visibleItems().length).toBe(2);
    expect(state.visibility()?.visibleItemCount).toBe(2);
  });

  it('surfaces empty armory without dropping shelf structure', () => {
    armory.getArmoryReadModel.and.returnValue(readModelSubject(0));

    state.load();

    expect(state.status()).toBe('empty');
    expect(state.isEmpty()).toBeTrue();
    expect(state.shelves().length).toBe(11);
    expect(state.visibleItems()).toEqual([]);
  });

  it('surfaces missing active hero as an invariant error', () => {
    activeHero.state.set(null);

    state.load();

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('No active hero for armory shelves.');
    expect(armory.getArmoryReadModel).not.toHaveBeenCalled();
  });

  it('ignores stale success after active hero context changes', () => {
    const request = new Subject<PlayerArmoryReadModel>();
    armory.getArmoryReadModel.and.returnValue(request.asObservable());

    state.load();
    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    request.next(readModel(1));

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('Armory shelf context changed.');
    expect(state.readModel()).toBeNull();
  });

  it('ignores older load responses after a newer refresh', () => {
    const first = new Subject<PlayerArmoryReadModel>();
    const second = new Subject<PlayerArmoryReadModel>();
    armory.getArmoryReadModel.and.returnValues(first.asObservable(), second.asObservable());

    state.load();
    state.refresh();
    second.next(readModel(2));
    first.next(readModel(1));

    expect(armory.getArmoryReadModel).toHaveBeenCalledTimes(2);
    expect(state.status()).toBe('loaded');
    expect(state.visibleItems().length).toBe(2);
  });

  it('maps service errors to read error state', () => {
    const request = new Subject<PlayerArmoryReadModel>();
    armory.getArmoryReadModel.and.returnValue(request.asObservable());

    state.load();
    request.error(new Error('armory read denied'));

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('armory read denied');
    expect(state.readModel()).toBeNull();
  });

  it('clears state and invalidates pending loads', () => {
    const request = new Subject<PlayerArmoryReadModel>();
    armory.getArmoryReadModel.and.returnValue(request.asObservable());

    state.load();
    state.clear();
    request.next(readModel(1));

    expect(state.status()).toBe('idle');
    expect(state.error()).toBeNull();
    expect(state.readModel()).toBeNull();
  });

  it('refreshes armory state after a successful shelf rename', () => {
    armory.renameShelf.and.returnValue(readModelSubject(1));

    state.renameShelf({
      shelfPosition: 2,
      newName: 'Materials',
    });

    expect(armory.renameShelf).toHaveBeenCalledWith({
      shelfPosition: 2,
      newName: 'Materials',
    });
    expect(state.actionError()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(state.status()).toBe('loaded');
    expect(state.readModel()?.visibleItems.length).toBe(1);
  });

  it('refreshes armory state after moving an item to unsorted shelf zero', () => {
    armory.moveItemToShelf.and.returnValue(readModelSubject(1));

    state.moveItemToShelf({
      itemId: 'item-1',
      targetShelfPosition: 0,
    });

    expect(armory.moveItemToShelf).toHaveBeenCalledWith({
      itemId: 'item-1',
      targetShelfPosition: 0,
    });
    expect(state.actionError()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(state.readModel()?.visibleItems.length).toBe(1);
  });

  it('vendor scraps items through the canonical lifecycle service and refreshes armory', () => {
    lifecycle.vendorScrapHeroItem.and.returnValue(of({
      itemId: 'item-1',
      itemStatus: 'scrapped',
      scrappedAt: '2026-05-08T10:00:00Z',
      recoverableUntil: null,
      resourceType: 'drachma',
      drachmaAmount: 20,
      balanceAfter: 120,
      itemAuditLogId: 'audit-item-1',
      vendorAuditLogId: 'audit-vendor-1',
    }));
    armory.getArmoryReadModel.and.returnValue(readModelSubject(0));

    state.vendorScrapItem('item-1');

    expect(lifecycle.vendorScrapHeroItem).toHaveBeenCalledWith({
      actorHeroId: 'hero-1',
      itemId: 'item-1',
      reason: 'Player vendor scrap',
    });
    expect(state.actionMessage()).toBe('Item sold to vendor.');
    expect(state.status()).toBe('empty');
  });

  it('bulk vendor scraps selected items through the canonical lifecycle service and refreshes armory', () => {
    lifecycle.bulkVendorScrapHeroItems.and.returnValue(of({
      heroId: 'hero-1',
      serverId: 'server-1',
      requestId: 'request-1',
      success: true,
      selectedCount: 2,
      soldCount: 2,
      skippedCount: 0,
      failedCount: 0,
      totalDrachmaAmount: 40,
      balanceAfter: 140,
    }));
    armory.getArmoryReadModel.and.returnValue(readModelSubject(0));
    const afterResponse = jasmine.createSpy('afterResponse');

    state.bulkVendorScrapItems(['item-1', 'item-2', 'item-1'], afterResponse);

    expect(lifecycle.bulkVendorScrapHeroItems).toHaveBeenCalledWith({
      actorHeroId: 'hero-1',
      items: [
        { itemId: 'item-1' },
        { itemId: 'item-2' },
      ],
      reason: 'Player bulk vendor scrap',
    });
    expect(afterResponse).toHaveBeenCalledTimes(1);
    expect(state.actionMessage()).toBe('Selected items sold to vendor.');
    expect(state.status()).toBe('empty');
  });

  it('keeps lifecycle success callback when post-mutation armory refresh fails', () => {
    const initial = readModel(1);
    lifecycle.vendorScrapHeroItem.and.returnValue(of({
      itemId: 'item-1',
      itemStatus: 'scrapped',
      scrappedAt: '2026-05-08T10:00:00Z',
      recoverableUntil: null,
      resourceType: 'drachma',
      drachmaAmount: 20,
      balanceAfter: 120,
      itemAuditLogId: 'audit-item-1',
      vendorAuditLogId: 'audit-vendor-1',
    }));
    armory.getArmoryReadModel.and.returnValue(
      throwError(() => new Error('armory refresh denied')),
    );
    const afterResponse = jasmine.createSpy('afterResponse');
    state.readModel.set(initial);
    state.status.set('loaded');

    state.vendorScrapItem('item-1', afterResponse);

    expect(lifecycle.vendorScrapHeroItem).toHaveBeenCalled();
    expect(afterResponse).toHaveBeenCalled();
    expect(state.actionMessage()).toBe('Item sold to vendor.');
    expect(state.actionError()).toBe('armory refresh denied');
    expect(state.status()).toBe('error');
    expect(state.readModel()).toBeNull();
    expect(state.isMutating()).toBeFalse();
  });

  it('does not refresh armory after stale lifecycle response', () => {
    const request = new Subject<{
      itemId: string;
      itemStatus: 'scrapped';
      scrappedAt: string;
      recoverableUntil: string | null;
      resourceType: string;
      drachmaAmount: number;
      balanceAfter: number;
      itemAuditLogId: string;
      vendorAuditLogId: string;
    }>();
    lifecycle.vendorScrapHeroItem.and.returnValue(request.asObservable());
    armory.getArmoryReadModel.and.returnValue(readModelSubject(0));
    const afterResponse = jasmine.createSpy('afterResponse');

    state.vendorScrapItem('item-1', afterResponse);
    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    request.next({
      itemId: 'item-1',
      itemStatus: 'scrapped',
      scrappedAt: '2026-05-08T10:00:00Z',
      recoverableUntil: null,
      resourceType: 'drachma',
      drachmaAmount: 20,
      balanceAfter: 120,
      itemAuditLogId: 'audit-item-1',
      vendorAuditLogId: 'audit-vendor-1',
    });

    expect(afterResponse).not.toHaveBeenCalled();
    expect(armory.getArmoryReadModel).not.toHaveBeenCalled();
    expect(state.actionError()).toBe('Armory shelf context changed.');
    expect(state.status()).toBe('error');
  });

  it('surfaces mutation errors without optimistic state changes', () => {
    const initial = readModel(1);
    const request = new Subject<PlayerArmoryReadModel>();
    armory.renameShelf.and.returnValue(request.asObservable());
    state.readModel.set(initial);
    state.status.set('loaded');

    state.renameShelf({
      shelfPosition: 2,
      newName: 'Materials',
    });
    request.error(new Error('rename denied'));

    expect(state.actionError()).toBe('rename denied');
    expect(state.readModel()).toBe(initial);
    expect(state.status()).toBe('loaded');
    expect(state.isMutating()).toBeFalse();
  });

  it('clears previous armory when mutation success arrives after context changes', () => {
    const initial = readModel(1);
    const request = new Subject<PlayerArmoryReadModel>();
    armory.moveItemToShelf.and.returnValue(request.asObservable());
    state.readModel.set(initial);
    state.status.set('loaded');

    state.moveItemToShelf({
      itemId: 'item-1',
      targetShelfPosition: 0,
    });
    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    request.next(readModel(2));

    expect(state.readModel()).toBeNull();
    expect(state.status()).toBe('error');
    expect(state.actionError()).toBe('Armory shelf context changed.');
    expect(state.isMutating()).toBeFalse();
  });

  it('surfaces client-side validation errors from armory actions', () => {
    armory.renameShelf.and.callFake(() => {
      throw new Error('shelfPosition must be an integer from 1 to 10.');
    });

    state.renameShelf({
      shelfPosition: 0,
      newName: 'Unsorted',
    });

    expect(state.actionError()).toBe(
      'shelfPosition must be an integer from 1 to 10.',
    );
    expect(state.isMutating()).toBeFalse();
  });
});

class FakeActiveHero {
  readonly state = signal<ActiveHeroState | null>(activeHeroState());
}

function activeHeroState(
  overrides: Partial<ActiveHeroState> = {},
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {} as never,
    hero: {} as never,
    heroRow: {} as never,
    ...overrides,
  };
}

function readModelSubject(
  visibleItemCount: number,
): Observable<PlayerArmoryReadModel> {
  return of(readModel(visibleItemCount));
}

function readModel(visibleItemCount: number): PlayerArmoryReadModel {
  const visibleItems = Array.from({ length: visibleItemCount }, (_, index) => ({
    itemId: `item-${index + 1}`,
    heroId: 'hero-1',
    serverId: 'server-1',
    itemName: `Item ${index + 1}`,
    lifecycleStatusKey: 'active',
    lifecycleStatusLabel: 'Active',
    generationQualityKey: null,
    qualityMultiplier: null,
    qualityLabel: null,
    generationBaseId: null,
    baseKey: null,
    baseName: null,
    baseTypeKey: null,
    baseTypeLabel: null,
    prefixAffixId: null,
    prefixKey: null,
    prefixName: null,
    suffixAffixId: null,
    suffixKey: null,
    suffixName: null,
    armoryShelfPosition: 1,
    drachmaValue: null,
    generatedAt: null,
    createdAt: null,
    storagePosition: 1,
    storageSlotKey: 'shelf_1',
    shelfName: 'Shelf 1',
    storageSlotName: 'Shelf 1',
    isUnsorted: false,
    visibilityIndex: index + 1,
    visibilityLimit: visibleItemCount,
    isVisible: true,
    itemCategoryKey: null,
    equipmentArea: null,
    primarySlotKey: 'main_hand',
    primarySlotLabel: 'Main hand',
    handUsageKey: null,
    handUsageLabel: null,
    allowedSlotKeys: ['main_hand'],
    allowedSlotLabel: 'Main hand',
    displayIconKey: 'box',
    meetsRequirements: true,
    requirementCount: 0,
    unmetRequirementCount: 0,
    requirementStatus: {},
    displayCore: {
      itemId: `item-${index + 1}`,
      itemName: `Item ${index + 1}`,
      lifecycleStatusKey: 'active',
      lifecycleStatusLabel: 'Active',
      generationQualityKey: null,
      qualityLabel: null,
      baseKey: null,
      baseName: null,
      baseTypeKey: null,
      baseTypeLabel: null,
      drachmaValue: null,
      displayIconKey: 'box',
      equipmentArea: null,
      handUsageKey: null,
      handUsageLabel: null,
      primarySlotKey: 'main_hand',
      primarySlotLabel: 'Main hand',
      equipmentSlotKey: null,
      equipmentSlotLabel: null,
      allowedSlotKeys: ['main_hand'],
      allowedSlotLabel: 'Main hand',
    },
  }));

  return {
    heroId: 'hero-1',
    shelves: Array.from({ length: 11 }, (_, index) => ({
      storageSlotId: index === 0 ? null : `shelf-${index}`,
      storageSlotKey: index === 0 ? null : `shelf_${index}`,
      heroId: 'hero-1',
      position: index,
      name: index === 0 ? 'Unsorted' : `Shelf ${index}`,
      displayName: index === 0 ? 'Unsorted' : `Shelf ${index}`,
      displayLabel: 'Shelf',
      displayValue: String(index),
      visibleItemCount: index === 0 ? visibleItemCount : 0,
      itemCount: index === 0 ? visibleItemCount : 0,
      sortOrder: index,
      isPersisted: index !== 0,
      isUnsortedDropArea: index === 0,
      visibleItems: index === 0 ? visibleItems : [],
    })),
    visibleItems,
    visibility: {
      visibleItemCount,
      totalOwnedItemCount: visibleItemCount,
      hiddenItemCount: 0,
      visibilityLimit: visibleItemCount,
    },
  };
}
