import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  ClearLoadoutPresetResult,
  EquipmentSlot,
  LoadoutPreset,
  LoadoutPresetPreview,
  RenameLoadoutPresetResult,
  SaveLoadoutPresetResult,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { HeroEquipment } from './hero-equipment';
import { HeroLoadoutPresetsState } from './hero-loadout-presets.state';

describe('HeroLoadoutPresetsState', () => {
  let activeHero: FakeActiveHero;
  let equipment: jasmine.SpyObj<HeroEquipment>;
  let state: HeroLoadoutPresetsState;

  beforeEach(() => {
    activeHero = new FakeActiveHero();
    equipment = jasmine.createSpyObj<HeroEquipment>('HeroEquipment', [
      'getLoadoutPresets',
      'getEquipmentSlots',
      'previewLoadoutPreset',
      'renameLoadoutPreset',
      'saveCurrentLoadoutPreset',
      'clearLoadoutPreset',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HeroLoadoutPresetsState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: HeroEquipment, useValue: equipment },
      ],
    });

    state = TestBed.inject(HeroLoadoutPresetsState);
  });

  it('loads loadout presets through hero equipment service', () => {
    equipment.getLoadoutPresets.and.returnValue(of([
      loadoutPreset({ presetNumber: 1, name: 'Travel' }),
      loadoutPreset({ presetNumber: 2, name: 'Trials' }),
    ]));

    state.load();

    expect(state.status()).toBe('loaded');
    expect(state.presets().map((preset) => preset.name))
      .toEqual(['Travel', 'Trials']);
  });

  it('surfaces missing active hero without calling preset RPCs', () => {
    activeHero.state.set(null);

    state.load();
    state.renamePreset({ presetNumber: 1, name: 'Travel' });

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('No active hero for loadout presets.');
    expect(state.actionError()).toBe('No active hero for loadout preset action.');
    expect(equipment.getLoadoutPresets).not.toHaveBeenCalled();
    expect(equipment.renameLoadoutPreset).not.toHaveBeenCalled();
  });

  it('renames a preset and refreshes headers after success', () => {
    equipment.renameLoadoutPreset.and.returnValue(of(renameResult({
      presetNumber: 2,
      name: 'Boss loadout',
    })));
    equipment.getLoadoutPresets.and.returnValue(of([
      loadoutPreset({ presetNumber: 2, name: 'Boss loadout' }),
    ]));

    state.renamePreset({ presetNumber: 2, name: 'Boss loadout' });

    expect(equipment.renameLoadoutPreset).toHaveBeenCalledOnceWith({
      presetNumber: 2,
      name: 'Boss loadout',
    });
    expect(equipment.getLoadoutPresets).toHaveBeenCalledTimes(1);
    expect(state.actionMessage()).toBe('Preset 2 renamed.');
    expect(state.presets()[0].name).toBe('Boss loadout');
  });

  it('shows controlled blank rename feedback', () => {
    equipment.renameLoadoutPreset.and.throwError(
      'rename_hero_loadout_preset_name_invalid',
    );

    state.renamePreset({ presetNumber: 1, name: ' ' });

    expect(state.actionError()).toBe('Preset name is required.');
    expect(state.isMutating()).toBeFalse();
  });

  it('saves current loadout and clears presets through canonical service methods', () => {
    equipment.saveCurrentLoadoutPreset.and.returnValue(of(saveResult({
      presetNumber: 1,
      savedSlotCount: 3,
    })));
    equipment.clearLoadoutPreset.and.returnValue(of(clearResult({
      presetNumber: 2,
      clearedSlotCount: 4,
    })));
    equipment.getLoadoutPresets.and.returnValue(of([]));

    state.saveCurrentLoadout({ presetNumber: 1, name: 'Travel' });
    state.clearPreset({ presetNumber: 2 });

    expect(equipment.saveCurrentLoadoutPreset).toHaveBeenCalledWith({
      presetNumber: 1,
      name: 'Travel',
    });
    expect(equipment.clearLoadoutPreset).toHaveBeenCalledWith({
      presetNumber: 2,
    });
    expect(state.actionMessage()).toBe('Preset 2 cleared from 4 slots.');
  });

  it('previews a preset with literal equipment slots and exact item rows', () => {
    equipment.previewLoadoutPreset.and.returnValue(of(loadoutPreview({
      slotItems: [previewItem({
        slotKey: 'main_hand',
        savedItemId: 'exact-item-id',
      })],
    })));
    equipment.getEquipmentSlots.and.returnValue(of([
      equipmentSlot({ slotKey: 'main_hand', label: 'Main hand' }),
      equipmentSlot({ slotKey: 'off_hand', label: 'Off hand' }),
    ]));

    state.previewPreset({ presetNumber: 2 });

    expect(equipment.previewLoadoutPreset).toHaveBeenCalledOnceWith({
      presetNumber: 2,
    });
    expect(equipment.getEquipmentSlots).toHaveBeenCalledTimes(1);
    expect(state.previewStatus()).toBe('loaded');
    expect(state.preview()?.slotItems[0].savedItemId).toBe('exact-item-id');
    expect(state.previewSlots().map((slot) => slot.slotKey))
      .toEqual(['main_hand', 'off_hand']);
  });

  it('ignores stale preset preview success after active hero context changes', () => {
    const previewRequest = new Subject<LoadoutPresetPreview>();
    equipment.previewLoadoutPreset.and.returnValue(previewRequest.asObservable());
    equipment.getEquipmentSlots.and.returnValue(of([equipmentSlot()]));

    state.previewPreset({ presetNumber: 1 });
    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    previewRequest.next(loadoutPreview());
    previewRequest.complete();

    expect(state.previewStatus()).toBe('error');
    expect(state.previewError()).toBe('Loadout preset context changed.');
    expect(state.preview()).toBeNull();
  });

  it('ignores stale loadout preset success after active hero context changes', () => {
    const request = new Subject<LoadoutPreset[]>();
    equipment.getLoadoutPresets.and.returnValue(request.asObservable());

    state.load();
    activeHero.state.set(activeHeroState({
      heroId: 'hero-2',
      serverId: 'server-1',
    }));
    request.next([loadoutPreset({ name: 'Stale' })]);

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('Loadout preset context changed.');
    expect(state.presets()).toEqual([]);
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

function loadoutPreset(overrides: Partial<LoadoutPreset> = {}): LoadoutPreset {
  return {
    presetId: 'preset-1',
    heroId: 'hero-1',
    presetNumber: 1,
    name: 'Preset 1',
    slotCount: 0,
    savedAt: null,
    clearedAt: null,
    updatedAt: '2026-05-08T10:00:00.000Z',
    ...overrides,
  };
}

function renameResult(
  overrides: Partial<RenameLoadoutPresetResult> = {},
): RenameLoadoutPresetResult {
  return {
    heroId: 'hero-1',
    presetId: 'preset-1',
    presetNumber: 1,
    name: 'Preset 1',
    requestId: 'request-1',
    updatedAt: '2026-05-08T10:00:00.000Z',
    ...overrides,
  };
}

function saveResult(
  overrides: Partial<SaveLoadoutPresetResult> = {},
): SaveLoadoutPresetResult {
  return {
    heroId: 'hero-1',
    presetId: 'preset-1',
    presetNumber: 1,
    name: 'Preset 1',
    savedSlotCount: 0,
    requestId: 'request-1',
    slotsJson: [],
    ...overrides,
  };
}

function clearResult(
  overrides: Partial<ClearLoadoutPresetResult> = {},
): ClearLoadoutPresetResult {
  return {
    heroId: 'hero-1',
    presetId: 'preset-1',
    presetNumber: 1,
    name: 'Preset 1',
    clearedSlotCount: 0,
    requestId: 'request-1',
    ...overrides,
  };
}

function loadoutPreview(
  overrides: Partial<LoadoutPresetPreview> = {},
): LoadoutPresetPreview {
  return {
    preset: loadoutPreset(),
    slotItems: [],
    ...overrides,
  };
}

function previewItem(
  overrides: Partial<LoadoutPresetPreview['slotItems'][number]> = {},
): LoadoutPresetPreview['slotItems'][number] {
  return {
    presetId: 'preset-1',
    presetNumber: 1,
    slotKey: 'main_hand',
    slotLabel: 'Main hand',
    slotSortOrder: 10,
    savedItemId: 'item-1',
    savedItemNameSnapshot: 'Saved item',
    currentItemName: 'Current item',
    currentOwnerHeroId: 'hero-1',
    lifecycleStatus: 'active',
    isOwnedByHero: true,
    isRuntimeUsable: true,
    previewStatus: 'available',
    statusMessage: null,
    ...overrides,
  };
}

function equipmentSlot(overrides: Partial<EquipmentSlot> = {}): EquipmentSlot {
  return {
    slotKey: 'main_hand',
    label: 'Main hand',
    sortOrder: 10,
    equipmentArea: 'weapon',
    equipmentSlotGroup: 'hand',
    ...overrides,
  };
}
