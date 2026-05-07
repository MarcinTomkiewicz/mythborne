import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { ArmoryShelfState } from './armory-shelf.state';
import { PlayerArmory } from './player-armory';

describe('ArmoryShelfState', () => {
  let activeHero: FakeActiveHero;
  let armory: jasmine.SpyObj<PlayerArmory>;
  let state: ArmoryShelfState;

  beforeEach(() => {
    activeHero = new FakeActiveHero();
    armory = jasmine.createSpyObj<PlayerArmory>('PlayerArmory', [
      'getArmory',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ArmoryShelfState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerArmory, useValue: armory },
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
