import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import {
  CurrentEquipmentLoadout,
  EquippedItemSummary,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentEquipmentState } from './current-equipment.state';
import { PlayerEquipment } from './player-equipment';

describe('CurrentEquipmentState', () => {
  let activeHero: FakeActiveHero;
  let equipment: jasmine.SpyObj<PlayerEquipment>;
  let state: CurrentEquipmentState;

  beforeEach(() => {
    activeHero = new FakeActiveHero();
    equipment = jasmine.createSpyObj<PlayerEquipment>('PlayerEquipment', [
      'getCurrentEquipment',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CurrentEquipmentState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerEquipment, useValue: equipment },
      ],
    });

    state = TestBed.inject(CurrentEquipmentState);
  });

  it('loads current equipment and exposes slots by literal slot key', () => {
    equipment.getCurrentEquipment.and.returnValue(loadoutSubject([
      equippedSlot({ slotKey: 'ring_1', slotSortOrder: 80 }),
      equippedSlot({ itemId: 'item-main', slotKey: 'main_hand', slotSortOrder: 10 }),
    ]));

    state.load();

    expect(state.status()).toBe('loaded');
    expect(state.isLoading()).toBeFalse();
    expect(state.slots().map((slot) => slot.slotKey)).toEqual([
      'ring_1',
      'main_hand',
    ]);
    expect(state.slot('main_hand')?.itemId).toBe('item-main');
  });

  it('surfaces an empty current equipment state', () => {
    equipment.getCurrentEquipment.and.returnValue(loadoutSubject([]));

    state.load();

    expect(state.status()).toBe('empty');
    expect(state.isEmpty()).toBeTrue();
    expect(state.loadout()).toEqual({
      heroId: 'hero-1',
      slots: [],
    });
  });

  it('surfaces missing active hero as an invariant error without RPC call', () => {
    activeHero.state.set(null);

    state.load();

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('No active hero for current equipment.');
    expect(equipment.getCurrentEquipment).not.toHaveBeenCalled();
  });

  it('ignores stale success after active hero context changes and clears loading', () => {
    const request = new Subject<CurrentEquipmentLoadout>();
    equipment.getCurrentEquipment.and.returnValue(request.asObservable());

    state.load();
    expect(state.status()).toBe('loading');

    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    request.next(loadout([equippedSlot({ itemId: 'stale-item' })]));

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('Current equipment context changed.');
    expect(state.loadout()).toBeNull();
  });

  it('ignores older load response after a newer refresh', () => {
    const first = new Subject<CurrentEquipmentLoadout>();
    const second = new Subject<CurrentEquipmentLoadout>();
    equipment.getCurrentEquipment.and.returnValues(
      first.asObservable(),
      second.asObservable(),
    );

    state.load();
    state.refresh();
    second.next(loadout([equippedSlot({ itemId: 'new-item' })]));
    first.next(loadout([equippedSlot({ itemId: 'old-item' })]));

    expect(equipment.getCurrentEquipment).toHaveBeenCalledTimes(2);
    expect(state.status()).toBe('loaded');
    expect(state.slot('main_hand')?.itemId).toBe('new-item');
  });

  it('maps service errors to read error state', () => {
    const request = new Subject<CurrentEquipmentLoadout>();
    equipment.getCurrentEquipment.and.returnValue(request.asObservable());

    state.load();
    request.error(new Error('equipment RPC denied'));

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('equipment RPC denied');
    expect(state.loadout()).toBeNull();
  });

  it('clears current state and invalidates pending loads', () => {
    const request = new Subject<CurrentEquipmentLoadout>();
    equipment.getCurrentEquipment.and.returnValue(request.asObservable());

    state.load();
    state.clear();
    request.next(loadout([equippedSlot()]));

    expect(state.status()).toBe('idle');
    expect(state.error()).toBeNull();
    expect(state.loadout()).toBeNull();
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

function loadoutSubject(
  slots: EquippedItemSummary[],
): Observable<CurrentEquipmentLoadout> {
  return of(loadout(slots));
}

function loadout(slots: EquippedItemSummary[]): CurrentEquipmentLoadout {
  return {
    heroId: 'hero-1',
    slots,
  };
}

function equippedSlot(
  overrides: Partial<EquippedItemSummary> = {},
): EquippedItemSummary {
  return {
    itemId: 'item-1',
    heroId: 'hero-1',
    ownerHeroId: 'hero-1',
    itemName: 'Bronze Blade',
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'normal',
    prefixAffixId: null,
    suffixAffixId: null,
    slotKey: 'main_hand',
    slotLabel: 'Main hand',
    slotSortOrder: 10,
    equipmentArea: 'weapon',
    equipmentSlotGroup: 'hand',
    equippedAt: '2026-05-07T10:00:00.000Z',
    baseKey: 'bronze_blade',
    baseName: 'Bronze blade',
    baseTypeKey: 'weapon',
    handUsage: 'one_handed',
    qualityLabel: 'Normal',
    qualityMultiplier: 1,
    prefixKey: null,
    prefixName: null,
    suffixKey: null,
    suffixName: null,
    isRuntimeUsable: true,
    ...overrides,
  };
}
