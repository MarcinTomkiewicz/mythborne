import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  ArmoryVisibilitySummary,
  EquipmentOperationJournal,
  EquipmentSlot,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import {
  ArmoryShelfReadStatus,
  ArmoryShelfState,
} from '../../../core/services/items/armory-shelf.state';
import {
  CurrentEquipmentReadStatus,
  CurrentEquipmentState,
} from '../../../core/services/items/current-equipment.state';
import { ArmoryPage } from './armory-page';
import {
  ArmoryGuildItemUsageState,
  ArmoryGuildItemUsage,
} from './armory-guild-item-usage.state';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';

describe('ArmoryPage', () => {
  let fixture: ComponentFixture<ArmoryPage>;
  let page: FakeArmoryPageFacade;
  let equipment: FakeCurrentEquipmentState;
  let armory: FakeArmoryShelfState;
  let guildItemUsage: FakeArmoryGuildItemUsageState;

  beforeEach(async () => {
    page = new FakeArmoryPageFacade();
    equipment = new FakeCurrentEquipmentState();
    armory = new FakeArmoryShelfState();
    guildItemUsage = new FakeArmoryGuildItemUsageState();

    await TestBed.configureTestingModule({
      imports: [ArmoryPage],
    })
      .overrideComponent(ArmoryPage, {
        set: {
          imports: [
            ReactiveFormsModule,
            ButtonModule,
            CheckboxModule,
            InputTextModule,
            SelectModule,
            MockEquipmentPreview,
            MockArmoryItemDetailPopover,
            MockLoadoutPresetManagement,
          ],
          providers: [
            { provide: ArmoryPageFacade, useValue: page },
            { provide: CurrentEquipmentState, useValue: equipment },
            { provide: ArmoryShelfState, useValue: armory },
            { provide: ArmoryGuildItemUsageState, useValue: guildItemUsage },
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
    expect(armory.load).toHaveBeenCalled();
    expect(guildItemUsage.load).toHaveBeenCalled();
  });

  it('renders dashboard equipment preview rows with empty slot copy', () => {
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

  it('renders equipped item name and active lifecycle status', () => {
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
    expect(text).toContain('Unequip');
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

  it('renders DB-owned armory shelves including unsorted position zero', () => {
    armory.setShelves([
      armoryShelf({
        position: 0,
        name: 'Unsorted',
        isUnsortedDropArea: true,
        visibleItems: [armoryItem({
          itemId: 'item-drop',
          name: 'Fresh Drop Blade',
          shelfPosition: 0,
          shelfName: 'Unsorted',
        })],
      }),
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [armoryItem({
          itemId: 'item-weapon',
          name: 'Shelf Sword',
          shelfPosition: 1,
          shelfName: 'Weapons',
        })],
      }),
    ], visibility({ visibleItemCount: 2, totalOwnedItemCount: 5, hiddenItemCount: 3 }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Unsorted');
    expect(text).toContain('Position 0');
    expect(text).toContain('Weapons');
    expect(text).toContain('Shelf 1');
    expect(text).toContain('Fresh Drop Blade');
    expect(text).toContain('Shelf Sword');
    expect(text).toContain('2 / 5 visible');
    expect(text).toContain('Capacity 0');
    expect(text).toContain('3 hidden');
  });

  it('renders visible shelves from highest position down with unsorted last', () => {
    armory.setShelves([
      armoryShelf({
        position: 0,
        name: 'Unsorted',
        isUnsortedDropArea: true,
      }),
      armoryShelf({ position: 1, name: 'Shelf One' }),
      armoryShelf({ position: 10, name: 'Shelf Ten' }),
      armoryShelf({ position: 7, name: 'Shelf Seven' }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text.indexOf('Shelf Ten')).toBeLessThan(text.indexOf('Shelf Seven'));
    expect(text.indexOf('Shelf Seven')).toBeLessThan(text.indexOf('Shelf One'));
    expect(text.indexOf('Shelf One')).toBeLessThan(text.indexOf('Unsorted'));
    expect(fixture.componentInstance.moveTargetShelves().map((shelf) =>
      shelf.position,
    )).toEqual([10, 7, 1, 0]);
  });

  it('uses full-width armory host and dashboard equipment preview invocation', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const preview = (fixture.nativeElement as HTMLElement)
      .querySelector('app-equipment-preview');

    expect(host.classList).toContain('w-100');
    expect(preview?.classList).toContain('d-block');
    expect(preview?.classList).toContain('w-100');
  });

  it('does not render admin links in the player-facing armory header', () => {
    const text = textContent(fixture);

    expect(text).not.toContain('Admin item catalog');
    expect(text).not.toContain('Admin balance');
  });

  it('does not expose rename action for unsorted position zero', () => {
    armory.setShelves([
      armoryShelf({
        position: 0,
        name: 'Unsorted',
        isUnsortedDropArea: true,
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Unsorted');
    expect(text).toContain('Position 0');
    expect(text).not.toContain('Rename');
  });

  it('calls shelf rename action for player shelves', () => {
    armory.setShelves([
      armoryShelf({
        position: 2,
        name: 'Materials',
      }),
    ]);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input[aria-label="Shelf name"]',
    ) as HTMLInputElement;
    const button = buttonWithText(fixture, 'Rename');
    input.value = 'Materials II';
    button.click();

    expect(armory.renameShelf).toHaveBeenCalledWith({
      shelfPosition: 2,
      newName: 'Materials II',
    });
  });

  it('renders locked armory items as owned items without unusable copy', () => {
    armory.setShelves([
      armoryShelf({
        position: 2,
        name: 'Market reserves',
        visibleItems: [armoryItem({
          itemId: 'item-locked',
          name: 'Auction Locked Shield',
          lifecycleStatus: 'locked_auction',
          shelfPosition: 2,
          shelfName: 'Market reserves',
        })],
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Auction Locked Shield');
    expect(text).toContain('Locked Auction');
    expect(text).toContain('Owned item reserved by market state.');
    expect(text).not.toContain('unusable');
    expect(text).not.toContain('Scrap');
    expect(text).not.toContain('Sell to vendor');
  });

  it('offers one vendor sell action only for active armory items', () => {
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [
          armoryItem({ itemId: 'item-active', lifecycleStatus: 'active' }),
          armoryItem({
            itemId: 'item-locked',
            name: 'Locked Blade',
            lifecycleStatus: 'locked_trade',
          }),
        ],
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);
    const sellButtons = buttonsWithText(fixture, 'Sell to vendor');

    expect(text).toContain('Sell to vendor');
    expect(text).not.toContain('Scrap');
    expect(text).toContain('Locked Blade');
    expect(text).toContain('Owned item reserved by market state.');
    expect(sellButtons.length).toBe(1);
  });

  it('shows deposited guild armory state and hides private item actions', () => {
    const item = armoryItem({ itemId: 'item-deposited', name: 'Guild Spear' });
    guildItemUsage.setUsage('item-deposited', usage({
      key: 'deposited_in_guild_armory',
      label: 'Deposited in guild armory',
      detail: 'Withdraw from guild armory before equipping, moving or selling privately.',
      privateActionsAllowed: false,
    }));
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [item],
      }),
    ]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Guild Spear');
    expect(text).toContain('Deposited in guild armory');
    expect(text).toContain('Withdraw from guild armory before equipping');
    expect(text).not.toContain('Select for bulk equip');
    expect(text).not.toContain('Sell to vendor');
    expect(buttonsWithText(fixture, 'Equip').length).toBe(0);
    expect(buttonsWithText(fixture, 'Move').length).toBe(0);
  });

  it('blocks direct private item action calls for guild armory items', () => {
    const item = armoryItem({ itemId: 'item-borrowed' });
    guildItemUsage.setUsage('item-borrowed', usage({
      key: 'borrowed_by_guild_member',
      label: 'Borrowed by Member Two',
      detail: 'Return or force-return through guild armory before private item actions.',
      privateActionsAllowed: false,
    }));

    fixture.componentInstance.equipItem(item);
    fixture.componentInstance.moveItemToShelf(item, 1);
    fixture.componentInstance.vendorScrapItem(item);

    expect(equipment.equipItem).not.toHaveBeenCalled();
    expect(armory.moveItemToShelf).not.toHaveBeenCalled();
    expect(armory.vendorScrapItem).not.toHaveBeenCalled();
  });

  it('hides bulk equip selection when guild armory context is unavailable', () => {
    guildItemUsage.error.set('Failed to load guild armory item state.');
    guildItemUsage.setUsage('item-active', usage({
      key: 'unknown',
      label: 'Guild armory state unavailable',
      detail: 'Private item actions are hidden until guild armory item state is loaded.',
      privateActionsAllowed: false,
    }));
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [armoryItem({ itemId: 'item-active' })],
      }),
    ]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Failed to load guild armory item state.');
    expect(text).toContain('Private item actions are hidden');
    expect(text).not.toContain('Select for bulk equip');
    expect(buttonsWithText(fixture, 'Equip').length).toBe(0);
  });

  it('vendor scraps active item and refreshes current equipment/runtime after response', () => {
    const item = armoryItem({ itemId: 'item-active' });
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [item],
      }),
    ]);
    fixture.detectChanges();

    fixture.componentInstance.vendorScrapItem(item);

    expect(armory.vendorScrapItem).toHaveBeenCalledWith(
      'item-active',
      jasmine.any(Function),
    );
    expect(equipment.refresh).toHaveBeenCalled();
    expect(guildItemUsage.load).toHaveBeenCalledTimes(2);
    expect(page.loadData).toHaveBeenCalledTimes(2);
  });

  it('calls item move action and supports target position zero', () => {
    const item = armoryItem({
      itemId: 'item-locked',
      name: 'Auction Locked Shield',
      lifecycleStatus: 'locked_auction',
      shelfPosition: 2,
    });
    armory.setShelves([
      armoryShelf({
        position: 0,
        name: 'Unsorted',
        isUnsortedDropArea: true,
      }),
      armoryShelf({
        position: 2,
        name: 'Market reserves',
        visibleItems: [item],
      }),
    ]);
    fixture.detectChanges();

    fixture.componentInstance.moveItemToShelf(item, '0');

    expect(armory.moveItemToShelf).toHaveBeenCalledWith({
      itemId: 'item-locked',
      targetShelfPosition: 0,
    });
  });

  it('renders simple equip action without exposing slot selection', () => {
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [armoryItem({
          itemId: 'item-dagger',
          name: 'Demonic Dagger',
        })],
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equip');
    expect(text).not.toContain(['Equip', 'slot'].join(' '));
    expect((fixture.nativeElement as HTMLElement)
      .querySelector('p-select[aria-label="Equip item slot"]')).toBeNull();
  });

  it('calls default equip without target slot and refreshes armory after response', () => {
    const item = armoryItem({
      itemId: 'item-dagger',
      name: 'Demonic Dagger',
    });
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [item],
      }),
    ]);
    fixture.detectChanges();

    fixture.componentInstance.equipItem(item);

    expect(equipment.equipItem).toHaveBeenCalledWith({
      itemId: 'item-dagger',
    }, jasmine.any(Function));
    expect(armory.refresh).toHaveBeenCalled();
    expect(guildItemUsage.load).toHaveBeenCalledTimes(2);
    expect(page.loadData).toHaveBeenCalledTimes(2);
  });

  it('bulk equips selected visible items in selection order without explicit slots', () => {
    const first = armoryItem({ itemId: 'item-first', name: 'First Blade' });
    const second = armoryItem({ itemId: 'item-second', name: 'Second Blade' });
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [first, second],
      }),
    ]);
    fixture.detectChanges();

    fixture.componentInstance.setBulkItemSelected(second, true);
    fixture.componentInstance.setBulkItemSelected(first, true);
    fixture.componentInstance.bulkEquipSelectedItems();

    expect(equipment.bulkEquipItems).toHaveBeenCalledWith({
      items: [
        { itemId: 'item-second' },
        { itemId: 'item-first' },
      ],
    }, jasmine.any(Function));
    expect(armory.refresh).toHaveBeenCalled();
    expect(page.loadData).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.selectedBulkItems()).toEqual([]);
  });

  it('renders bulk equip selection controls without exposing slot selection', () => {
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [
          armoryItem({ itemId: 'item-first', name: 'First Blade' }),
          armoryItem({ itemId: 'item-second', name: 'Second Blade' }),
        ],
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equip selected');
    expect(text).toContain('Select for bulk equip');
    expect((fixture.nativeElement as HTMLElement)
      .querySelector('p-select[aria-label="Equip item slot"]')).toBeNull();
  });

  it('calls unequip for the selected equipped slot and refreshes armory after response', () => {
    page.equipmentSlots.set([
      equipmentSlot({ slotKey: 'armor', label: 'Pancerz' }),
    ]);
    equipment.setSlots([
      equippedItem({
        itemId: 'locked-vest',
        itemName: 'Trade Locked Vest',
        lifecycleStatus: 'locked_trade',
        slotKey: 'armor',
      }),
    ]);
    fixture.detectChanges();

    fixture.componentInstance.unequipSlot('armor');

    expect(equipment.unequipSlot).toHaveBeenCalledWith({
      slotKey: 'armor',
    }, jasmine.any(Function));
    expect(armory.refresh).toHaveBeenCalled();
    expect(page.loadData).toHaveBeenCalledTimes(2);
  });

  it('renders domain failure journal as player-facing feedback', () => {
    equipment.actionJournal.set(operationJournal({
      success: false,
      failed: [{
        action: 'failed',
        itemId: 'item-dagger',
        slotKey: null,
        reason: 'requirements_not_met',
        message: 'Requirements not met.',
        success: false,
        detailsJson: null,
      }],
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equipment result');
    expect(text).toContain('Failed: Requirements not met.');
  });

  it('renders unequip journal feedback', () => {
    equipment.actionJournal.set(operationJournal({
      unequipped: [{
        action: 'unequipped',
        itemId: 'locked-vest',
        slotKey: 'armor',
        reason: 'slot_cleared',
        message: 'Unequipped.',
        success: true,
        detailsJson: null,
      }],
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equipment result');
    expect(text).toContain('Unequipped: Unequipped.');
  });

  it('renders shifted journal feedback with neutral equipment wording', () => {
    equipment.actionJournal.set(operationJournal({
      shifted: [{
        action: 'shifted',
        itemId: 'old-dagger',
        slotKey: 'off_hand',
        reason: 'hand_rotation',
        message: 'Moved to off hand.',
        success: true,
        detailsJson: null,
      }],
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equipment result');
    expect(text).toContain('Shifted: Moved to off hand.');
    expect(text).not.toContain('Already equipped:');
  });

  it('renders preset apply skipped entries and final equipment from DB journal', () => {
    equipment.actionJournal.set(operationJournal({
      success: false,
      equipped: [{
        action: 'equipped',
        itemId: 'exact-dagger',
        slotKey: 'main_hand',
        reason: 'preset_apply_exact_item',
        message: 'Applied exact item.',
        success: true,
        detailsJson: null,
      }],
      skipped: [{
        action: 'skipped',
        itemId: 'missing-ring',
        slotKey: 'ring_2',
        reason: 'preset_item_missing',
        message: 'Saved ring is missing.',
        success: true,
        detailsJson: null,
      }],
      finalEquipment: {
        heroId: 'hero-1',
        slots: [
          equippedItem({
            itemId: 'exact-dagger',
            itemName: 'Demonic Dagger',
            slotKey: 'main_hand',
            slotLabel: 'Main hand',
          }),
        ],
      },
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Equipment result');
    expect(text).toContain('Equipped: Applied exact item.');
    expect(text).toContain('Skipped: Saved ring is missing.');
    expect(text).toContain('Final equipment');
    expect(text).toContain('Main hand: Demonic Dagger');
  });

  it('rejects blank, null, and non-numeric move targets before state action', () => {
    const item = armoryItem({ itemId: 'item-1' });

    expect(() => fixture.componentInstance.moveItemToShelf(
      item,
      '',
    )).toThrowError('targetShelfPosition is required for armory action.');
    expect(() => fixture.componentInstance.moveItemToShelf(
      item,
      null,
    )).toThrowError('targetShelfPosition is required for armory action.');
    expect(() => fixture.componentInstance.moveItemToShelf(
      item,
      'not-a-number',
    )).toThrowError('targetShelfPosition must be a number.');
    expect(armory.moveItemToShelf).not.toHaveBeenCalled();
  });

  it('uses styled PrimeNG controls instead of raw browser controls', () => {
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [armoryItem()],
      }),
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('input[aria-label="Shelf name"]')).not.toBeNull();
    expect(element.querySelector('p-select[aria-label="Move item to shelf"]')).not.toBeNull();
    expect(element.querySelector('select[aria-label="Move item to shelf"]')).toBeNull();
    expect(element.querySelector('.form-control')).toBeNull();
    expect(element.querySelector('.btn.btn-secondary')).toBeNull();
  });

  it('renders armory item value without exposing raw layer ids', () => {
    armory.setShelves([
      armoryShelf({
        position: 1,
        name: 'Weapons',
        visibleItems: [armoryItem({
          itemId: 'item-layered',
          name: 'Named Blade',
          generationBaseId: 'uuid-base-raw',
          prefixAffixId: 'uuid-prefix-raw',
          suffixAffixId: 'uuid-suffix-raw',
          drachmaValue: 42,
        })],
      }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Named Blade');
    expect(text).toContain('42 drachma');
    expect(text).not.toContain('uuid-base-raw');
    expect(text).not.toContain('uuid-prefix-raw');
    expect(text).not.toContain('uuid-suffix-raw');
  });

  it('does not render raw visibility source data in player-facing shelf UI', () => {
    armory.setShelves([
      armoryShelf({ position: 1, name: 'Shelf From DB' }),
    ], visibility({
      sourceConfigJson: { target: 'visible_item_capacity', secretDebug: true },
      unsortedJson: { rawInternal: 'unsorted-json' },
      shelvesJson: [{ rawInternal: 'shelf-json' }],
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Shelf From DB');
    expect(text).toContain('current estate capacity');
    expect(text).not.toContain('visible_item_capacity');
    expect(text).not.toContain('secretDebug');
    expect(text).not.toContain('unsorted-json');
    expect(text).not.toContain('shelf-json');
  });

  it('renders the exact DB/RPC visibility limit without local recalculation', () => {
    armory.setShelves([
      armoryShelf({ position: 1, name: 'Shelf From DB' }),
    ], visibility({
      visibilityLimit: 123,
      visibilityLimitSource: 'visible_item_capacity',
    }));
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Capacity 123');
    expect(text).not.toContain('Limit 30');
    expect(text).not.toContain('Limit 35');
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
  readonly actionError = signal<string | null>(null);
  readonly actionJournal = signal<EquipmentOperationJournal | null>(null);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(true);
  readonly isMutating = signal(false);
  readonly slots = signal<EquippedItemSummary[]>([]);
  readonly load = jasmine.createSpy('load');
  readonly refresh = jasmine.createSpy('refresh');
  readonly equipItem = jasmine
    .createSpy('equipItem')
    .and.callFake((_input, afterResponse?: () => void) => afterResponse?.());
  readonly bulkEquipItems = jasmine
    .createSpy('bulkEquipItems')
    .and.callFake((_input, afterResponse?: () => void) => afterResponse?.());
  readonly applyLoadoutPreset = jasmine
    .createSpy('applyLoadoutPreset')
    .and.callFake((_input, afterResponse?: () => void) => afterResponse?.());
  readonly unequipSlot = jasmine
    .createSpy('unequipSlot')
    .and.callFake((_input, afterResponse?: () => void) => afterResponse?.());

  slot(slotKey: string): EquippedItemSummary | null {
    return this.slots().find((slot) => slot.slotKey === slotKey) ?? null;
  }

  setSlots(slots: EquippedItemSummary[]): void {
    this.slots.set(slots);
    this.status.set(slots.length ? 'loaded' : 'empty');
    this.isEmpty.set(slots.length === 0);
  }
}

class FakeArmoryShelfState {
  readonly status = signal<ArmoryShelfReadStatus>('empty');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(true);
  readonly isMutating = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly shelves = signal<ArmoryShelfReadModel[]>([]);
  readonly visibleItems = signal<ArmoryItemSummary[]>([]);
  readonly visibility = signal<ArmoryVisibilitySummary | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly refresh = jasmine.createSpy('refresh');
  readonly renameShelf = jasmine.createSpy('renameShelf');
  readonly moveItemToShelf = jasmine.createSpy('moveItemToShelf');
  readonly vendorScrapItem = jasmine
    .createSpy('vendorScrapItem')
    .and.callFake((_itemId, afterResponse?: () => void) => afterResponse?.());

  setShelves(
    shelves: ArmoryShelfReadModel[],
    summary: ArmoryVisibilitySummary = visibility({
      visibleItemCount: shelves.reduce(
        (count, shelf) => count + shelf.visibleItems.length,
        0,
      ),
    }),
  ): void {
    this.shelves.set(shelves);
    this.visibleItems.set(shelves.flatMap((shelf) => shelf.visibleItems));
    this.visibility.set(summary);
    this.status.set(summary.visibleItemCount ? 'loaded' : 'empty');
    this.isEmpty.set(summary.visibleItemCount === 0);
  }
}

class FakeArmoryGuildItemUsageState {
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly usages = signal<Record<string, ArmoryGuildItemUsage>>({});
  readonly load = jasmine.createSpy('load');

  usageForItem(item: Pick<ArmoryItemSummary, 'itemId'>): ArmoryGuildItemUsage {
    return this.usages()[item.itemId] ?? usage();
  }

  canUsePrivateItemActions(item: Pick<ArmoryItemSummary, 'itemId'>): boolean {
    return this.usageForItem(item).privateActionsAllowed;
  }

  setUsage(itemId: string, itemUsage: ArmoryGuildItemUsage): void {
    this.usages.set({
      ...this.usages(),
      [itemId]: itemUsage,
    });
  }
}

@Component({
  selector: 'app-loadout-preset-management',
  standalone: true,
  template: '<section>Loadout presets</section>',
})
class MockLoadoutPresetManagement {}

@Component({
  selector: 'app-equipment-preview',
  standalone: true,
  template: `
    <section>
      @for (row of rows(); track row.slotKey) {
        <article>
          <span>{{ row.label }}</span>
          <span>{{ row.slotKey }}</span>
          @if (row.item; as item) {
            <strong>{{ item.name }}</strong>
            @if (item.metadata) {
              <span>{{ item.metadata }}</span>
            }
          } @else {
            <strong>Empty slot</strong>
            <span>No item equipped</span>
          }
        </article>
      }
      @if (isLoading()) {
        <span>Loading</span>
      }
      @if (isUnavailable()) {
        <span>Unavailable</span>
      }
      @if (error()) {
        <span>{{ error() }}</span>
      }
    </section>
  `,
})
class MockEquipmentPreview {
  readonly rows = input.required<EquipmentPreviewSlotRow[]>();
  readonly isArmory = input(false);
  readonly isLoading = input(false);
  readonly isUnavailable = input(false);
  readonly error = input<string | null>(null);
  readonly compact = input(false);
  readonly showSlotLabels = input(true);
  readonly armoryLink = input('/game/armory');
}

@Component({
  selector: 'app-armory-item-detail-popover',
  standalone: true,
  template: '<button type="button">Details</button>',
})
class MockArmoryItemDetailPopover {
  readonly item = input.required<ArmoryItemSummary | EquippedItemSummary>();
  readonly guildContextLabel = input<string | null>(null);
  readonly guildContextDetail = input<string | null>(null);
}

function textContent(fixture: ComponentFixture<ArmoryPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function buttonWithText(
  fixture: ComponentFixture<ArmoryPage>,
  label: string,
): HTMLButtonElement {
  const button = buttonsWithText(fixture, label)[0];

  if (!button) {
    throw new Error(`Button "${label}" was not rendered.`);
  }

  return button;
}

function buttonsWithText(
  fixture: ComponentFixture<ArmoryPage>,
  label: string,
): HTMLButtonElement[] {
  const buttons = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
  ) as HTMLButtonElement[];

  return buttons.filter((entry) => (entry.textContent ?? '').trim() === label);
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

function armoryShelf(
  overrides: Partial<ArmoryShelfReadModel> = {},
): ArmoryShelfReadModel {
  return {
    shelfId: 'shelf-1',
    heroId: 'hero-1',
    position: 1,
    name: 'Shelf 1',
    updatedAt: '2026-05-07T10:00:00Z',
    isPersisted: true,
    isUnsortedDropArea: false,
    visibleItems: [],
    ...overrides,
  };
}

function armoryItem(
  overrides: Partial<ArmoryItemSummary> = {},
): ArmoryItemSummary {
  return {
    itemId: 'item-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Bronze Blade',
    description: null,
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'normal',
    prefixAffixId: null,
    suffixAffixId: null,
    armoryShelfPosition: 1,
    drachmaValue: 20,
    shelfPosition: 1,
    shelfName: 'Shelf 1',
    requirementPreview: null,
    ...overrides,
  };
}

function usage(
  overrides: Partial<ArmoryGuildItemUsage> = {},
): ArmoryGuildItemUsage {
  return {
    key: 'owned_private',
    label: 'Owned private item',
    detail: null,
    privateActionsAllowed: true,
    ...overrides,
  };
}

function visibility(
  overrides: Partial<ArmoryVisibilitySummary> = {},
): ArmoryVisibilitySummary {
  return {
    visibleItemCount: 0,
    totalOwnedItemCount: 0,
    hiddenItemCount: 0,
    visibilityLimit: 0,
    visibilityLimitSource: 'visible_item_capacity',
    sourceConfigJson: { target: 'visible_item_capacity' },
    visibleStatuses: ['active', 'locked_trade', 'locked_auction'],
    unsortedJson: {},
    shelvesJson: [],
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
