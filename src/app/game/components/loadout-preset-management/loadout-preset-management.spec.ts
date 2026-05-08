import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  EquipmentSlot,
  LoadoutPreset,
  LoadoutPresetPreview,
} from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import { LoadoutPresetManagement } from './loadout-preset-management';

describe('LoadoutPresetManagement', () => {
  let fixture: ComponentFixture<LoadoutPresetManagement>;
  let presets: FakeHeroLoadoutPresetsState;
  let equipment: FakeCurrentEquipmentState;
  let armory: FakeArmoryShelfState;
  let page: FakeArmoryPageFacade;

  beforeEach(async () => {
    presets = new FakeHeroLoadoutPresetsState();
    equipment = new FakeCurrentEquipmentState();
    armory = new FakeArmoryShelfState();
    page = new FakeArmoryPageFacade();

    await TestBed.configureTestingModule({
      imports: [LoadoutPresetManagement],
    })
      .overrideComponent(LoadoutPresetManagement, {
        set: {
          imports: [
            ReactiveFormsModule,
            ButtonModule,
            InputTextModule,
          ],
          providers: [
            { provide: HeroLoadoutPresetsState, useValue: presets },
            { provide: CurrentEquipmentState, useValue: equipment },
            { provide: ArmoryShelfState, useValue: armory },
            { provide: ArmoryPageFacade, useValue: page },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoadoutPresetManagement);
    fixture.detectChanges();
  });

  it('loads preset headers on init', () => {
    expect(presets.load).toHaveBeenCalled();
  });

  it('renders preset management actions', () => {
    presets.setPresets([
      loadoutPreset({ presetNumber: 1, name: 'Travel', slotCount: 2 }),
      loadoutPreset({ presetNumber: 2, name: 'Trials', slotCount: 5 }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);
    const firstInput = (fixture.nativeElement as HTMLElement)
      .querySelector('input[aria-label="Preset 1 name"]') as HTMLInputElement;

    expect(text).toContain('Loadout presets');
    expect(text).toContain('Preset 1');
    expect(firstInput.value).toBe('Travel');
    expect(text).toContain('2 slots');
    expect(text).toContain('Rename');
    expect(text).toContain('Save current loadout');
    expect(text).toContain('Preview');
    expect(text).toContain('Apply preset');
    expect(text).toContain('Clear');
  });

  it('renames, saves and clears presets through preset state', () => {
    presets.setPresets([loadoutPreset({ presetNumber: 2, name: 'Trials' })]);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement)
      .querySelector('input[aria-label="Preset 2 name"]') as HTMLInputElement;
    input.value = 'Boss loadout';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const preset = component.presetRows()[0];
    component.renamePreset(preset);
    component.saveCurrentLoadout(preset);
    component.previewPreset(preset);
    component.applyPreset(preset);
    component.clearPreset(preset);

    expect(presets.renamePreset).toHaveBeenCalledWith({
      presetNumber: 2,
      name: 'Boss loadout',
    });
    expect(presets.saveCurrentLoadout).toHaveBeenCalledWith({
      presetNumber: 2,
      name: 'Boss loadout',
    });
    expect(presets.previewPreset).toHaveBeenCalledWith({
      presetNumber: 2,
    });
    expect(equipment.applyLoadoutPreset).toHaveBeenCalledWith({
      presetNumber: 2,
    }, jasmine.any(Function));
    expect(armory.refresh).toHaveBeenCalled();
    expect(page.loadData).toHaveBeenCalled();
    expect(presets.clearPreset).toHaveBeenCalledWith({
      presetNumber: 2,
    });
  });

  it('renders preview exact items, unavailable statuses and empty literal slots', () => {
    presets.setPresets([loadoutPreset({ presetNumber: 1, name: 'Trials' })]);
    presets.preview.set(loadoutPreview({
      slotItems: [
        previewItem({
          slotKey: 'main_hand',
          slotLabel: 'Main hand',
          savedItemId: 'item-owned',
          currentItemName: 'Demonic Dagger',
          previewStatus: 'available',
        }),
        previewItem({
          slotKey: 'ring_1',
          slotLabel: 'Ring 1',
          savedItemId: 'item-gone',
          savedItemNameSnapshot: 'Old Ring',
          currentItemName: null,
          previewStatus: 'no_longer_owned',
          statusMessage: 'Item is no longer owned by this hero.',
        }),
        previewItem({
          slotKey: 'ring_2',
          slotLabel: 'Ring 2',
          savedItemId: 'item-scrapped',
          savedItemNameSnapshot: 'Broken Ring',
          currentItemName: null,
          previewStatus: 'scrapped',
        }),
      ],
    }));
    presets.previewSlots.set([
      equipmentSlot({ slotKey: 'main_hand', label: 'Main hand', sortOrder: 10 }),
      equipmentSlot({ slotKey: 'off_hand', label: 'Off hand', sortOrder: 20 }),
      equipmentSlot({ slotKey: 'ring_1', label: 'Ring 1', sortOrder: 80 }),
      equipmentSlot({ slotKey: 'ring_2', label: 'Ring 2', sortOrder: 90 }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Preset 1 preview');
    expect(text).toContain('Demonic Dagger');
    expect(text).toContain('Exact item ID: item-owned');
    expect(text).toContain('No longer owned');
    expect(text).toContain('Scrapped');
    expect(text).toContain('Empty slot');
    expect(text).toContain('No saved item for this literal slot.');
    expect(text).not.toContain('requirements');
    expect(text).not.toContain('similar');
  });

  it('shows controlled preset feedback', () => {
    presets.actionError.set('Preset name is required.');
    presets.actionMessage.set('Preset 1 renamed.');
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Preset name is required.');
    expect(text).toContain('Preset 1 renamed.');
  });
});

class FakeHeroLoadoutPresetsState {
  readonly presets = signal<LoadoutPreset[]>([]);
  readonly preview = signal<LoadoutPresetPreview | null>(null);
  readonly previewSlots = signal<EquipmentSlot[]>([]);
  readonly status = signal<'empty' | 'loaded'>('empty');
  readonly previewStatus = signal<'idle' | 'loading' | 'loaded' | 'empty' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly previewError = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(true);
  readonly isPreviewLoading = signal(false);
  readonly isMutating = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly renamePreset = jasmine.createSpy('renamePreset');
  readonly saveCurrentLoadout = jasmine.createSpy('saveCurrentLoadout');
  readonly previewPreset = jasmine.createSpy('previewPreset');
  readonly clearPreset = jasmine.createSpy('clearPreset');

  setPresets(presets: LoadoutPreset[]): void {
    this.presets.set(presets);
    this.status.set(presets.length ? 'loaded' : 'empty');
    this.isEmpty.set(presets.length === 0);
  }
}

class FakeCurrentEquipmentState {
  readonly isMutating = signal(false);
  readonly applyLoadoutPreset = jasmine
    .createSpy('applyLoadoutPreset')
    .and.callFake((_input, afterResponse?: () => void) => afterResponse?.());
}

class FakeArmoryShelfState {
  readonly refresh = jasmine.createSpy('refresh');
}

class FakeArmoryPageFacade {
  readonly loadData = jasmine.createSpy('loadData');
}

function textContent(fixture: ComponentFixture<LoadoutPresetManagement>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
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
