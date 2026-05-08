import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
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
      'getArmory',
      'renameShelf',
      'moveItemToShelf',
    ]);
    lifecycle = jasmine.createSpyObj<ItemLifecycleService>('ItemLifecycleService', [
      'vendorScrapHeroItem',
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
    armory.getArmory.and.returnValue(readModelSubject(2));

    state.load();

    expect(state.status()).toBe('loaded');
    expect(state.isLoading()).toBeFalse();
    expect(state.shelves().length).toBe(11);
    expect(state.visibleItems().length).toBe(2);
    expect(state.visibility()?.visibleItemCount).toBe(2);
  });

  it('surfaces empty armory without dropping shelf structure', () => {
    armory.getArmory.and.returnValue(readModelSubject(0));

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
    expect(armory.getArmory).not.toHaveBeenCalled();
  });

  it('ignores stale success after active hero context changes', () => {
    const request = new Subject<HeroArmoryReadModel>();
    armory.getArmory.and.returnValue(request.asObservable());

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
    const first = new Subject<HeroArmoryReadModel>();
    const second = new Subject<HeroArmoryReadModel>();
    armory.getArmory.and.returnValues(first.asObservable(), second.asObservable());

    state.load();
    state.refresh();
    second.next(readModel(2));
    first.next(readModel(1));

    expect(armory.getArmory).toHaveBeenCalledTimes(2);
    expect(state.status()).toBe('loaded');
    expect(state.visibleItems().length).toBe(2);
  });

  it('maps service errors to read error state', () => {
    const request = new Subject<HeroArmoryReadModel>();
    armory.getArmory.and.returnValue(request.asObservable());

    state.load();
    request.error(new Error('armory read denied'));

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('armory read denied');
    expect(state.readModel()).toBeNull();
  });

  it('clears state and invalidates pending loads', () => {
    const request = new Subject<HeroArmoryReadModel>();
    armory.getArmory.and.returnValue(request.asObservable());

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
    armory.getArmory.and.returnValue(readModelSubject(0));

    state.vendorScrapItem('item-1');

    expect(lifecycle.vendorScrapHeroItem).toHaveBeenCalledWith({
      actorHeroId: 'hero-1',
      itemId: 'item-1',
      reason: 'Player vendor scrap',
    });
    expect(state.actionMessage()).toBe('Item sold to vendor.');
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
    armory.getArmory.and.returnValue(
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
    armory.getArmory.and.returnValue(readModelSubject(0));
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
    expect(armory.getArmory).not.toHaveBeenCalled();
    expect(state.actionError()).toBe('Armory shelf context changed.');
    expect(state.status()).toBe('error');
  });

  it('surfaces mutation errors without optimistic state changes', () => {
    const initial = readModel(1);
    const request = new Subject<HeroArmoryReadModel>();
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
    const request = new Subject<HeroArmoryReadModel>();
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
): Observable<HeroArmoryReadModel> {
  return of(readModel(visibleItemCount));
}

function readModel(visibleItemCount: number): HeroArmoryReadModel {
  const visibleItems = Array.from({ length: visibleItemCount }, (_, index) => ({
    itemId: `item-${index + 1}`,
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: `Item ${index + 1}`,
    description: null,
    lifecycleStatus: 'active' as const,
    generationBaseId: null,
    generationQualityKey: null,
    prefixAffixId: null,
    suffixAffixId: null,
    armoryShelfPosition: 1,
    drachmaValue: null,
    shelfPosition: 1,
    shelfName: 'Shelf 1',
    requirementPreview: null,
  }));

  return {
    heroId: 'hero-1',
    shelves: Array.from({ length: 11 }, (_, index) => ({
      shelfId: index === 0 ? null : `shelf-${index}`,
      heroId: 'hero-1',
      position: index,
      name: index === 0 ? 'Unsorted' : `Shelf ${index}`,
      updatedAt: index === 0 ? null : '2026-05-07T10:00:00Z',
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
      visibilityLimitSource: 'visible_item_capacity',
      sourceConfigJson: { target: 'visible_item_capacity' },
      visibleStatuses: ['active', 'locked_trade', 'locked_auction'],
      unsortedJson: {
        id: null,
        position: 0,
        name: 'Unsorted',
      },
      shelvesJson: [],
    },
  };
}
