import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import {
  CurrentEquipmentLoadout,
  EquipmentOperationJournal,
  EquippedItemSummary,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentEquipmentState } from './current-equipment.state';
import { HeroEquipment } from './hero-equipment';

describe('CurrentEquipmentState', () => {
  let activeHero: FakeActiveHero;
  let equipment: jasmine.SpyObj<HeroEquipment>;
  let state: CurrentEquipmentState;

  beforeEach(() => {
    activeHero = new FakeActiveHero();
    equipment = jasmine.createSpyObj<HeroEquipment>('HeroEquipment', [
      'getCurrentEquipment',
      'equipItem',
      'bulkEquipItems',
      'bulkUnequipItems',
      'applyLoadoutPreset',
      'unequipSlot',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CurrentEquipmentState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: HeroEquipment, useValue: equipment },
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

  it('equips an item and applies final equipment from the operation journal', () => {
    equipment.equipItem.and.returnValue(of(operationJournal({
      finalEquipment: loadout([
        equippedSlot({ itemId: 'item-equipped', slotKey: 'main_hand' }),
      ]),
      equipped: [{
        action: 'equipped',
        itemId: 'item-equipped',
        slotKey: 'main_hand',
        reason: 'equipped',
        message: 'Equipped.',
        success: true,
        detailsJson: null,
      }],
    })));

    state.equipItem({ itemId: 'item-equipped' });

    expect(equipment.equipItem).toHaveBeenCalledOnceWith({
      itemId: 'item-equipped',
    });
    expect(state.actionJournal()?.equipped[0].message).toBe('Equipped.');
    expect(state.slot('main_hand')?.itemId).toBe('item-equipped');
    expect(state.isMutating()).toBeFalse();
  });

  it('shows domain failure journal without turning it into an action error', () => {
    equipment.getCurrentEquipment.and.returnValue(loadoutSubject([
      equippedSlot({ itemId: 'still-equipped', slotKey: 'main_hand' }),
    ]));
    equipment.equipItem.and.returnValue(of(operationJournal({
      success: false,
      failed: [{
        action: 'failed',
        itemId: 'item-rejected',
        slotKey: null,
        reason: 'requirements_not_met',
        message: 'Requirements not met.',
        success: false,
        detailsJson: null,
      }],
    })));

    state.equipItem({ itemId: 'item-rejected' });

    expect(state.actionError()).toBeNull();
    expect(state.actionJournal()?.failed[0].message).toBe('Requirements not met.');
    expect(equipment.getCurrentEquipment).toHaveBeenCalledTimes(1);
    expect(state.slot('main_hand')?.itemId).toBe('still-equipped');
  });

  it('bulk equips items and preserves the operation journal without client-side stopping', () => {
    equipment.bulkEquipItems.and.returnValue(of(operationJournal({
      success: false,
      equipped: [{
        action: 'equipped',
        itemId: 'item-equipped',
        slotKey: 'main_hand',
        reason: 'equipped',
        message: 'Equipped.',
        success: true,
        detailsJson: null,
      }],
      failed: [{
        action: 'failed',
        itemId: 'item-failed',
        slotKey: null,
        reason: 'requirements_not_met',
        message: 'Requirements not met.',
        success: false,
        detailsJson: null,
      }],
      finalEquipment: loadout([
        equippedSlot({ itemId: 'item-equipped', slotKey: 'main_hand' }),
      ]),
    })));

    state.bulkEquipItems({
      items: [
        { itemId: 'item-equipped' },
        { itemId: 'item-failed' },
      ],
    });

    expect(equipment.bulkEquipItems).toHaveBeenCalledOnceWith({
      items: [
        { itemId: 'item-equipped' },
        { itemId: 'item-failed' },
      ],
    });
    expect(state.actionError()).toBeNull();
    expect(state.actionJournal()?.equipped[0].itemId).toBe('item-equipped');
    expect(state.actionJournal()?.failed[0].itemId).toBe('item-failed');
    expect(state.slot('main_hand')?.itemId).toBe('item-equipped');
  });

  it('applies a loadout preset through the service and preserves partial journal', () => {
    equipment.applyLoadoutPreset.and.returnValue(of(operationJournal({
      success: false,
      equipped: [{
        action: 'equipped',
        itemId: 'exact-item',
        slotKey: 'main_hand',
        reason: 'preset_apply_exact_item',
        message: 'Applied exact item.',
        success: true,
        detailsJson: null,
      }],
      skipped: [{
        action: 'skipped',
        itemId: 'missing-item',
        slotKey: 'ring_2',
        reason: 'preset_item_missing',
        message: 'Saved item is missing.',
        success: true,
        detailsJson: null,
      }],
      finalEquipment: loadout([
        equippedSlot({ itemId: 'exact-item', slotKey: 'main_hand' }),
      ]),
    })));

    state.applyLoadoutPreset({ presetNumber: 2 });

    expect(equipment.applyLoadoutPreset).toHaveBeenCalledOnceWith({
      presetNumber: 2,
    });
    expect(state.actionError()).toBeNull();
    expect(state.actionJournal()?.equipped[0].reason)
      .toBe('preset_apply_exact_item');
    expect(state.actionJournal()?.skipped[0].reason).toBe('preset_item_missing');
    expect(state.slot('main_hand')?.itemId).toBe('exact-item');
  });

  it('unequips a slot through the service and refreshes when no final equipment is returned', () => {
    equipment.getCurrentEquipment.and.returnValue(loadoutSubject([]));
    equipment.unequipSlot.and.returnValue(of(operationJournal({
      unequipped: [{
        action: 'unequipped',
        itemId: 'locked-item',
        slotKey: 'armor',
        reason: 'slot_cleared',
        message: 'Unequipped.',
        success: true,
        detailsJson: { itemStatus: 'locked_trade' },
      }],
    })));

    state.unequipSlot({ slotKey: 'armor' });

    expect(equipment.unequipSlot).toHaveBeenCalledOnceWith({ slotKey: 'armor' });
    expect(state.actionJournal()?.unequipped[0]).toEqual(jasmine.objectContaining({
      itemId: 'locked-item',
      slotKey: 'armor',
      message: 'Unequipped.',
    }));
    expect(equipment.getCurrentEquipment).toHaveBeenCalledTimes(1);
    expect(state.status()).toBe('empty');
  });

  it('bulk unequips items and applies final equipment from the operation journal', () => {
    equipment.bulkUnequipItems.and.returnValue(of(operationJournal({
      unequipped: [{
        action: 'unequipped',
        itemId: 'item-main',
        slotKey: 'main_hand',
        reason: 'slot_cleared',
        message: 'Unequipped.',
        success: true,
        detailsJson: null,
      }],
      finalEquipment: loadout([
        equippedSlot({ itemId: 'item-ring', slotKey: 'ring_1' }),
      ]),
    })));

    state.bulkUnequipItems({
      items: [
        { itemId: 'item-main', slotKey: 'main_hand' },
      ],
    });

    expect(equipment.bulkUnequipItems).toHaveBeenCalledOnceWith({
      items: [
        { itemId: 'item-main', slotKey: 'main_hand' },
      ],
    });
    expect(state.actionJournal()?.unequipped[0].itemId).toBe('item-main');
    expect(state.slot('ring_1')?.itemId).toBe('item-ring');
    expect(state.slot('main_hand')).toBeNull();
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

function operationJournal(
  overrides: Partial<EquipmentOperationJournal> = {},
): EquipmentOperationJournal {
  return {
    requestId: 'request-1',
    success: true,
    equipped: [],
    shifted: [],
    unequipped: [],
    failed: [],
    skipped: [],
    finalEquipment: null,
    diagnostics: null,
    ...overrides,
  };
}
