import {
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardEquipmentPreviewRows,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import { HeroDashboardRuntimeStatsReadModel } from './hero-dashboard-runtime-stats';

describe('dashboard page mappers', () => {
  const runtimeStats: HeroDashboardRuntimeStatsReadModel = {
    heroId: 'hero-1',
    damageRows: [
      { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
      { key: 'off_hand', label: 'Unarmed', displayValue: '20-21' },
    ],
    stats: {
      strength: 19,
      dexterity: 6,
    },
    defense: 104,
    currentHealth: 84,
    maxHealth: 120,
    luck: 3,
    criticalChanceBonus: 2,
    criticalDamage: 50,
    evasionChanceBonus: 8,
    attackCount: 2,
    attackPlanJson: {},
    sourceJson: {},
    statsJson: {},
  };

  it('pairs DB stat labels with runtime stat values and omits missing runtime values', () => {
    expect(
      mapDashboardBaseStatRows(
        [
          {
            id: 'stat-strength',
            key: 'strength',
            label: 'Strength',
            order: 1,
            description: null,
          },
          {
            id: 'stat-vitality',
            key: 'vitality',
            label: 'Vitality',
            order: 2,
            description: null,
          },
        ],
        runtimeStats.stats,
      ),
    ).toEqual([{ key: 'strength', label: 'Strength', value: 19 }]);
  });

  it('maps runtime stats to the legacy dashboard derived display contract', () => {
    expect(mapDashboardDerivedDisplay(runtimeStats)).toEqual({
      health: 120,
      def: 104,
      minDmg: 0,
      maxDmg: 0,
      luck: 3,
      critical: 2,
      criticalDamage: 50,
      evasion: 8,
    });
  });

  it('maps dashboard health display from DB-returned current and max health', () => {
    expect(mapDashboardHealthDisplay(runtimeStats)).toEqual({
      currentHealth: 84,
      maxHealth: 120,
    });
  });

  it('maps confirmed equipment slots with current equipped items without inventing empty slots', () => {
    expect(
      mapDashboardEquipmentPreviewRows(
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
          {
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
          },
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
    const rows = mapDashboardEquipmentPreviewRows(
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
    const rows = mapDashboardEquipmentPreviewRows(
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

  it('maps player-safe derived stat rows from the runtime read model', () => {
    expect(mapDashboardDerivedStatRows(runtimeStats)).toEqual([
      { key: 'damage-main_hand', label: 'Demonic Dagger', value: '21-28' },
      { key: 'damage-off_hand', label: 'Unarmed', value: '20-21' },
      { key: 'defense', label: 'Defense', value: 104 },
      { key: 'luck', label: 'Luck', value: 3 },
      { key: 'critical_chance', label: 'Critical chance', value: '2%' },
      { key: 'critical_damage', label: 'Critical damage', value: '50%' },
      { key: 'evasion', label: 'Evasion', value: '8%' },
      { key: 'attack_count', label: 'Attack count', value: 2 },
    ]);
  });

  it('omits derived stat rows when runtime stats are unavailable', () => {
    expect(mapDashboardDerivedStatRows(null)).toEqual([]);
  });

  it('omits damage when the runtime read model has no attack rows', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        damageRows: [],
      }).map((row) => row.key),
    ).toEqual([
      'defense',
      'luck',
      'critical_chance',
      'critical_damage',
      'evasion',
      'attack_count',
    ]);
  });

  it('keeps an equipment source label without inventing damage when DB returns no value', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        damageRows: [
          { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
          { key: 'off_hand', label: 'Bronze Shield', displayValue: '' },
        ],
      }).slice(0, 2),
    ).toEqual([
      { key: 'damage-main_hand', label: 'Demonic Dagger', value: '21-28' },
      { key: 'damage-off_hand', label: 'Bronze Shield', value: null },
    ]);
  });
});

function equippedItem(
  overrides: Partial<Parameters<typeof mapDashboardEquipmentPreviewRows>[1][number]>,
): Parameters<typeof mapDashboardEquipmentPreviewRows>[1][number] {
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
