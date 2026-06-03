import {
  armoryItemIconClass,
  classifyItemDisplay,
  mapEquipmentPreviewRows,
} from './equipment-preview.mapper';

describe('equipment preview mapper', () => {
  it('maps confirmed equipment slots with current equipped items without inventing empty slots', () => {
    expect(
      mapEquipmentPreviewRows(
        [
          {
            slotKey: 'main_hand',
            label: 'Main hand',
            sortOrder: 10,
            equipmentArea: 'weapon',
            equipmentSlotGroup: 'hand',
          },
          {
            slotKey: 'off_hand',
            label: 'Off hand',
            sortOrder: 20,
            equipmentArea: 'weapon',
            equipmentSlotGroup: 'hand',
          },
        ],
        [
          equippedItem({
            slotKey: 'main_hand',
            itemName: 'Demonic Dagger',
          }),
        ],
      ),
    ).toEqual([
      {
        slotKey: 'main_hand',
        label: 'Main hand',
        sortOrder: 10,
        iconClass: 'pi pi-one-handed',
        item: {
          itemId: 'item-main',
          name: 'Demonic Dagger',
          metadata: 'Main hand \u00b7 Normal',
          statusLabel: 'active',
          qualityLabel: 'Normal',
          kindLabel: 'Dagger',
          slotLabel: 'Main hand',
        },
      },
      {
        slotKey: 'off_hand',
        label: 'Off hand',
        sortOrder: 20,
        iconClass: 'pi pi-one-handed',
        item: null,
      },
    ]);
  });

  it('maps non-weapon equipment preview icons by stable slot key before item fields', () => {
    const rows = mapEquipmentPreviewRows(
      [
        {
          slotKey: 'ring_1',
          label: 'Ring 1',
          sortOrder: 10,
          equipmentArea: 'jewelry',
          equipmentSlotGroup: 'finger',
        },
        {
          slotKey: 'pants',
          label: 'Pants',
          sortOrder: 20,
          equipmentArea: 'armor',
          equipmentSlotGroup: 'legs',
        },
        {
          slotKey: 'boots',
          label: 'Boots',
          sortOrder: 30,
          equipmentArea: 'armor',
          equipmentSlotGroup: 'feet',
        },
      ],
      [
        equippedItem({ slotKey: 'ring_1' }),
        equippedItem({ slotKey: 'pants' }),
        equippedItem({ slotKey: 'boots' }),
      ],
    );

    expect(rows.map((row) => `${row.slotKey}:${row.iconClass}`)).toEqual([
      'ring_1:pi pi-ring',
      'pants:pi pi-greaves',
      'boots:pi pi-boots',
    ]);
  });

  it('maps hand slot equipment preview icons from weapon item fields', () => {
    const rows = mapEquipmentPreviewRows(
      [
        {
          slotKey: 'main_hand',
          label: 'Main hand',
          sortOrder: 10,
          equipmentArea: 'weapon',
          equipmentSlotGroup: 'hand',
        },
        {
          slotKey: 'off_hand',
          label: 'Off hand',
          sortOrder: 20,
          equipmentArea: 'weapon',
          equipmentSlotGroup: 'hand',
        },
      ],
      [
        equippedItem({
          slotKey: 'main_hand',
          baseTypeKey: 'two_handed_weapon',
          handUsage: 'two_handed',
        }),
        equippedItem({
          slotKey: 'off_hand',
          baseTypeKey: 'shield',
          handUsage: 'shield',
        }),
      ],
    );

    expect(rows.map((row) => `${row.slotKey}:${row.iconClass}`)).toEqual([
      'main_hand:pi pi-two-handed',
      'off_hand:pi pi-shield-bash',
    ]);
  });

  it('maps armory inventory card icons from structural DB classification fields', () => {
    expect(armoryItemIconClass(armoryItem({ baseTypeKey: 'one_handed_weapon' })))
      .toBe('pi pi-one-handed');
    expect(armoryItemIconClass(armoryItem({ baseTypeKey: 'two_handed_weapon' })))
      .toBe('pi pi-two-handed');
    expect(armoryItemIconClass(armoryItem({ baseTypeKey: 'ranged_weapon' })))
      .toBe('pi pi-bow-weapon');
    expect(armoryItemIconClass(armoryItem({
      baseTypeKey: 'helmet',
      itemCategoryKey: 'armor',
      equipmentArea: 'armor',
      handUsageKey: '',
      primarySlotKey: 'helmet',
      allowedSlotKeys: ['helmet'],
    })))
      .toBe('pi pi-armory-helmet');
    expect(armoryItemIconClass(armoryItem({
      baseTypeKey: 'ring',
      itemCategoryKey: 'jewelry',
      equipmentArea: 'jewelry',
      handUsageKey: '',
      primarySlotKey: 'ring_1',
      allowedSlotKeys: ['ring_1', 'ring_2'],
    })))
      .toBe('pi pi-ring');
  });

  it('classifies one-handed items from base type and hand usage variants', () => {
    expect(classifyItemDisplay({ baseTypeKey: 'one_handed_weapon' }).iconClass)
      .toBe('pi pi-one-handed');
    expect(classifyItemDisplay({ handUsageKey: 'one_hand' }).kindLabel)
      .toBe('One Handed');
    expect(classifyItemDisplay({ handUsageKey: 'one_handed' }).iconClass)
      .toBe('pi pi-one-handed');
  });

  it('classifies two-handed items from hand usage variants', () => {
    expect(classifyItemDisplay({ handUsageKey: 'two_hand' }).iconClass)
      .toBe('pi pi-two-handed');
    expect(classifyItemDisplay({ handUsageKey: 'two_hands' }).iconClass)
      .toBe('pi pi-two-handed');
    expect(classifyItemDisplay({ handUsageKey: 'two_handed' }).iconClass)
      .toBe('pi pi-two-handed');
    expect(classifyItemDisplay({ handUsageKey: 'two_hands' }).slotLabel)
      .toBe('Hands');
  });

  it('classifies ranged and off-hand shield items from structural keys', () => {
    expect(classifyItemDisplay({ handUsageKey: 'ranged' }).kindLabel)
      .toBe('Ranged');
    expect(classifyItemDisplay({ handUsageKey: 'off_hand_only' }).iconClass)
      .toBe('pi pi-shield-bash');
    expect(classifyItemDisplay({ baseTypeKey: 'shield' }).slotLabel)
      .toBe('Off Hand');
  });

  it('classifies jewelry and armor from allowed slots and base type', () => {
    expect(classifyItemDisplay({ allowedSlotKeys: ['ring_1', 'ring_2'] }).iconClass)
      .toBe('pi pi-ring');
    expect(classifyItemDisplay({ allowedSlotKeys: ['ring_1', 'ring_2'] }).slotLabel)
      .toBe('Ring');
    expect(classifyItemDisplay({ baseTypeKey: 'armor' }).iconClass)
      .toBe('pi pi-armor');
    expect(classifyItemDisplay({ primarySlotKey: 'helmet' }).kindLabel)
      .toBe('Armor');
  });
});

function equippedItem(
  overrides: Partial<Parameters<typeof mapEquipmentPreviewRows>[1][number]>,
): Parameters<typeof mapEquipmentPreviewRows>[1][number] {
  return {
    itemId: 'item-main',
    heroId: 'hero-1',
    ownerHeroId: 'hero-1',
    itemName: 'Demonic Dagger',
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
    equippedAt: '2026-05-13T10:00:00.000Z',
    baseKey: 'dagger',
    baseName: 'Dagger',
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

function armoryItem(
  overrides: Partial<Parameters<typeof armoryItemIconClass>[0]>,
): Parameters<typeof armoryItemIconClass>[0] {
  return {
    itemId: 'item-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Named item',
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
    baseKey: 'base-key',
    baseName: 'Base name',
    baseTypeKey: 'one_handed_weapon',
    itemCategoryKey: 'weapon',
    equipmentArea: 'weapon',
    handUsageKey: 'one_handed',
    primarySlotKey: 'main_hand',
    allowedSlotKeys: ['main_hand'],
    requirementPreview: null,
    ...overrides,
  };
}
