import { ArmoryItemSummary, EquipmentSlot } from '../domain/item/item-equipment.model';
import {
  filterArmoryItems,
  matchesArmorySlotFilter,
} from './armory-inventory-filter';

describe('armory-inventory-filter', () => {
  it('matches shields when the off-hand slot is selected even without literal allowed slot rows', () => {
    const shield = armoryItem({
      name: 'Hoplite Shield',
      baseTypeKey: 'shield',
      equipmentArea: 'shield',
      primarySlotKey: null,
      allowedSlotKeys: [],
    });

    expect(matchesArmorySlotFilter(shield, 'off_hand')).toBeTrue();
  });

  it('searches list-backed type and slot labels only', () => {
    const shield = armoryItem({
      name: 'Bronze Guard',
      baseTypeKey: 'shield',
      equipmentArea: 'shield',
    });
    const ring = armoryItem({
      itemId: 'ring-1',
      name: 'Moon Band',
      baseName: 'Silver Signet',
      baseTypeKey: 'ring',
    });
    const slots: EquipmentSlot[] = [
      equipmentSlot({ slotKey: 'off_hand', label: 'Druga ręka' }),
      equipmentSlot({ slotKey: 'ring_1', label: 'Pierścień 1' }),
    ];

    expect(filterArmoryItems([shield, ring], {
      searchTerm: 'druga ręka',
      slotKey: 'all',
      availability: 'all',
    }, slots)).toEqual([shield]);
    expect(filterArmoryItems([shield, ring], {
      searchTerm: 'silver',
      slotKey: 'all',
      availability: 'all',
    }, slots)).toEqual([ring]);
  });
});

function armoryItem(
  overrides: Partial<ArmoryItemSummary> = {},
): ArmoryItemSummary {
  return {
    itemId: 'shield-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Bronze Shield',
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

function equipmentSlot(overrides: Partial<EquipmentSlot>): EquipmentSlot {
  return {
    slotKey: 'main_hand',
    label: 'Main hand',
    sortOrder: 10,
    equipmentArea: 'weapon',
    equipmentSlotGroup: 'weapon',
    ...overrides,
  };
}
