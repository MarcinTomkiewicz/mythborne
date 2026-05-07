import { Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EquipmentSlot,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import {
  CurrentEquipmentReadStatus,
  CurrentEquipmentState,
} from '../../../core/services/items/current-equipment.state';
import { ArmoryPage } from './armory-page';

describe('ArmoryPage', () => {
  let fixture: ComponentFixture<ArmoryPage>;
  let page: FakeArmoryPageFacade;
  let equipment: FakeCurrentEquipmentState;

  beforeEach(async () => {
    page = new FakeArmoryPageFacade();
    equipment = new FakeCurrentEquipmentState();

    await TestBed.configureTestingModule({
      imports: [ArmoryPage],
    })
      .overrideComponent(ArmoryPage, {
        set: {
          imports: [MockItemGeneratorPanel],
          providers: [
            { provide: ArmoryPageFacade, useValue: page },
            { provide: CurrentEquipmentState, useValue: equipment },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ArmoryPage);
    fixture.detectChanges();
  });

  it('loads armory support data and current equipment on init', () => {
    expect(page.loadData).toHaveBeenCalled();
    expect(equipment.load).toHaveBeenCalled();
  });

  it('renders all paperdoll slots with empty slot copy', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'main_hand', label: 'Main hand', sortOrder: 10 }),
      equipmentSlot({ slotKey: 'off_hand', label: 'Off hand', sortOrder: 20 }),
      equipmentSlot({ slotKey: 'helmet', label: 'Helmet', sortOrder: 30 }),
      equipmentSlot({ slotKey: 'armor', label: 'Armor', sortOrder: 40 }),
      equipmentSlot({ slotKey: 'pants', label: 'Pants', sortOrder: 50 }),
      equipmentSlot({ slotKey: 'boots', label: 'Boots', sortOrder: 60 }),
      equipmentSlot({ slotKey: 'amulet', label: 'Amulet', sortOrder: 70 }),
      equipmentSlot({ slotKey: 'ring_1', label: 'Ring 1', sortOrder: 80 }),
      equipmentSlot({ slotKey: 'ring_2', label: 'Ring 2', sortOrder: 90 }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Main hand');
    expect(text).toContain('Off hand');
    expect(text).toContain('Helmet');
    expect(text).toContain('Armor');
    expect(text).toContain('Pants');
    expect(text).toContain('Boots');
    expect(text).toContain('Amulet');
    expect(text).toContain('Ring 1');
    expect(text).toContain('Ring 2');
    expect(text).toContain('Empty slot');
    expect(text).toContain('No item equipped');
  });

  it('renders equipped item layers and active lifecycle status', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'main_hand', label: 'Blade slot', sortOrder: 30 }),
    ]);
    equipment.setSlots([
      equippedItem({
        itemName: 'Fine Bronze Blade',
        slotKey: 'main_hand',
        qualityLabel: 'Fine',
        baseName: 'Bronze blade',
        prefixName: 'Dawn',
        suffixName: 'Guard',
        lifecycleStatus: 'active',
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Fine Bronze Blade');
    expect(text).toContain('Blade slot');
    expect(text).toContain('Fine - Bronze blade - Dawn - Guard');
    expect(text).toContain('Active');
  });

  it('shows locked equipped item as equipped instead of hiding it', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'off_hand', label: 'Shield slot', sortOrder: 20 }),
    ]);
    equipment.setSlots([
      equippedItem({
        itemName: 'Trade Locked Shield',
        slotKey: 'off_hand',
        lifecycleStatus: 'locked_trade',
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Trade Locked Shield');
    expect(text).toContain('Locked Trade');
    expect(text).not.toContain('unusable');
  });

  it('renders custom DB slot labels and slots not present in the old local list', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'custom_trophy', label: 'Trophy hook', sortOrder: 5 }),
      equipmentSlot({ slotKey: 'main_hand', label: 'Weapon hand', sortOrder: 10 }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Trophy hook');
    expect(text).toContain('custom_trophy');
    expect(text.indexOf('Trophy hook')).toBeLessThan(text.indexOf('Weapon hand'));
    expect(text).not.toContain('Helmet');
  });

  it('joins equipped items by exact DB slot key', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'custom_trophy', label: 'Trophy hook', sortOrder: 5 }),
    ]);
    equipment.setSlots([
      equippedItem({
        itemName: 'Golden Trophy',
        slotKey: 'custom_trophy',
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Trophy hook');
    expect(text).toContain('Golden Trophy');
  });

  it('renders equipment error without blocking the fixed slot layout', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'main_hand', label: 'Main hand', sortOrder: 10 }),
      equipmentSlot({ slotKey: 'ring_2', label: 'Ring 2', sortOrder: 90 }),
    ]);
    equipment.status.set('error');
    equipment.isEmpty.set(false);
    equipment.error.set('Failed to load current equipment.');
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Unavailable');
    expect(text).toContain('Failed to load current equipment.');
    expect(text).toContain('Main hand');
    expect(text).toContain('Ring 2');
  });
});

class FakeArmoryPageFacade {
  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<EquipmentSlot[]>([]);
  readonly loadData = jasmine.createSpy('loadData');
}

class FakeCurrentEquipmentState {
  readonly status = signal<CurrentEquipmentReadStatus>('empty');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(true);
  readonly slots = signal<EquippedItemSummary[]>([]);
  readonly load = jasmine.createSpy('load');

  slot(slotKey: string): EquippedItemSummary | null {
    return this.slots().find((slot) => slot.slotKey === slotKey) ?? null;
  }

  setSlots(slots: EquippedItemSummary[]): void {
    this.slots.set(slots);
    this.status.set(slots.length ? 'loaded' : 'empty');
    this.isEmpty.set(slots.length === 0);
  }
}

@Component({
  selector: 'app-item-generator-panel',
  standalone: true,
  template: '',
})
class MockItemGeneratorPanel {
  readonly luck = input(0);
}

function textContent(fixture: ComponentFixture<ArmoryPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function equippedItem(
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

function equipmentSlot(overrides: Partial<EquipmentSlot> = {}): EquipmentSlot {
  return {
    slotKey: 'main_hand',
    label: 'Main hand',
    sortOrder: 10,
    equipmentArea: 'weapon',
    equipmentSlotGroup: 'weapon',
    ...overrides,
  };
}
