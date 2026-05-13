import { mapEquipmentPreviewRows } from './equipment-preview.mapper';

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
          name: 'Demonic Dagger',
          metadata: 'Main hand \u00b7 Normal',
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
