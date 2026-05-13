import { IStat } from '../../interfaces/i-stats/i-stats';
import { IHeroDerived } from '../../types/hero.types';
import {
  EquipmentSlot,
  EquippedItemSummary,
} from '../../domain/item/item-equipment.model';
import {
  HeroDashboardRuntimeStatsReadModel,
  HeroRuntimeDamageRow,
} from './hero-dashboard-runtime-stats';
import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';
import {
  EQUIPMENT_PREVIEW_ICON_CLASSES,
  EquipmentPreviewIconClass,
  EQUIPMENT_PREVIEW_SLOT_KEYS,
  equipmentPreviewIconClassForSlot,
} from '../../domain/equipment/equipment-preview-icons.config';

export interface DashboardBaseStatRow {
  key: string;
  label: string;
  value: number;
}

export interface DashboardDerivedStatRow {
  key: string;
  label: string;
  value: number | string | null;
}

export interface DashboardHealthSource {
  currentHealth: number;
  maxHealth: number;
}

export function mapDashboardBaseStatRows(
  statsList: IStat[],
  stats: Record<string, number>,
): DashboardBaseStatRow[] {
  return statsList
    .filter((stat) => Object.hasOwn(stats, stat.key))
    .map((stat) => ({
      key: stat.key,
      label: stat.label,
      value: stats[stat.key],
    }));
}

export function mapDashboardDerivedDisplay(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): IHeroDerived {
  return {
    health: runtime?.maxHealth ?? 0,
    def: runtime?.defense ?? 0,
    minDmg: 0,
    maxDmg: 0,
    luck: runtime?.luck ?? 0,
    critical: runtime?.criticalChanceBonus ?? 0,
    criticalDamage: runtime?.criticalDamage ?? 0,
    evasion: runtime?.evasionChanceBonus ?? 0,
  };
}

export function mapDashboardHealthDisplay(
  runtime: DashboardHealthSource | null,
): { currentHealth: number; maxHealth: number } {
  return {
    currentHealth: runtime?.currentHealth ?? 0,
    maxHealth: runtime?.maxHealth ?? 0,
  };
}

export function mapDashboardEquipmentPreviewRows(
  slots: EquipmentSlot[],
  equippedItems: EquippedItemSummary[],
): EquipmentPreviewSlotRow[] {
  const equippedBySlot = new Map(
    equippedItems.map((item) => [item.slotKey, item]),
  );

  return slots.map((slot) => {
    const item = equippedBySlot.get(slot.slotKey);

    return {
      slotKey: slot.slotKey,
      label: slot.label,
      sortOrder: slot.sortOrder,
      iconClass: equipmentPreviewIconClass(slot.slotKey, item),
      item: item
        ? {
            name: item.itemName,
            metadata: itemMetadataLabel(slot.label, item.qualityLabel),
          }
        : null,
    };
  });
}

export function mapDashboardDerivedStatRows(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): DashboardDerivedStatRow[] {
  if (!runtime) {
    return [];
  }

  return [
    ...runtime.damageRows.map(damageRow),
    derivedRow('defense', 'Defense', runtime.defense),
    derivedRow('luck', 'Luck', runtime.luck),
    derivedRow(
      'critical_chance',
      'Critical chance',
      percentValue(runtime.criticalChanceBonus),
    ),
    derivedRow(
      'critical_damage',
      'Critical damage',
      percentValue(runtime.criticalDamage),
    ),
    derivedRow(
      'evasion',
      'Evasion',
      percentValue(runtime.evasionChanceBonus),
    ),
    derivedRow('attack_count', 'Attack count', runtime.attackCount),
  ];
}

function damageRow(row: HeroRuntimeDamageRow): DashboardDerivedStatRow {
  return {
    key: `damage-${row.key}`,
    label: row.label,
    value: row.displayValue || null,
  };
}

function derivedRow(
  key: string,
  label: string,
  value: number | string,
): DashboardDerivedStatRow {
  return {
    key,
    label,
    value,
  };
}

function percentValue(value: number): string {
  return `${value}%`;
}

function itemMetadataLabel(slotLabel: string, qualityLabel: string | null): string {
  return [slotLabel, qualityLabel].filter(Boolean).join(' \u00b7 ');
}

function equipmentPreviewIconClass(
  slotKey: string,
  item: EquippedItemSummary | undefined,
): EquipmentPreviewIconClass {
  switch (slotKey) {
    case EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand:
    case EQUIPMENT_PREVIEW_SLOT_KEYS.offHand:
      return weaponIconClass(item);
    default:
      return equipmentPreviewIconClassForSlot(slotKey);
  }
}

function weaponIconClass(
  item: EquippedItemSummary | undefined,
): EquipmentPreviewIconClass {
  const handUsage = item?.handUsage?.toLowerCase() ?? '';
  const baseTypeKey = item?.baseTypeKey?.toLowerCase() ?? '';
  const baseKey = item?.baseKey?.toLowerCase() ?? '';
  const weaponSource = [handUsage, baseTypeKey, baseKey].join(' ');

  if (weaponSource.includes('two')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.twoHanded;
  }

  if (
    weaponSource.includes('bow')
    || weaponSource.includes('ranged')
  ) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.bowWeapon;
  }

  if (weaponSource.includes('shield')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.shield;
  }

  if (weaponSource.includes('one')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded;
  }

  return EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded;
}
