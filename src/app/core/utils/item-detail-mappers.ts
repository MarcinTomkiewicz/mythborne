import {
  ArmoryItemDetailBonus,
  ArmoryItemDetailReadModel,
  ArmoryItemDetailStat,
} from '../domain/item/item-equipment.model';
import { GetHeroArmoryItemDetailRpcRow } from '../types/item-equipment-rpc.types';
import {
  jsonRecord,
  JsonRecord,
  mapJsonArray,
  optionalNumber,
  optionalText,
  read,
} from './json-read';

export function mapArmoryItemDetail(
  row: GetHeroArmoryItemDetailRpcRow,
): ArmoryItemDetailReadModel {
  const bonuses = jsonRecord(row.bonuses_json);

  return {
    itemId: row.item_id,
    heroId: row.hero_id,
    serverId: row.server_id,
    name: row.item_name,
    lifecycleStatus: row.item_status,
    qualityLabel: row.generation_quality_key,
    baseLabel: row.base_name,
    baseTypeKey: row.base_type_key,
    prefixLabel: row.prefix_name,
    suffixLabel: row.suffix_name,
    shelfName: row.shelf_name,
    shelfPosition: row.armory_shelf_position,
    drachmaValue: row.drachma_value,
    itemStats: itemStats(bonuses),
    bonuses: bonusRows(bonuses),
  };
}

function itemStats(bonuses: JsonRecord | null): ArmoryItemDetailStat[] {
  const itemStatsRecord = jsonRecord(read(bonuses, 'itemStats', 'item_stats'));

  return mapJsonArray(read(itemStatsRecord, 'rows'), statRow);
}

function statRow(row: JsonRecord): ArmoryItemDetailStat {
  return {
    label: playerLabel(
      optionalText(read(row, 'displayLabel', 'display_label', 'label')) ?? 'Stat',
      optionalText(read(row, 'key', 'targetKey', 'target_key')),
    ),
    displayValue: optionalText(read(row, 'displayValue', 'display_value')) ?? '',
  };
}

function bonusRows(bonuses: JsonRecord | null): ArmoryItemDetailBonus[] {
  const itemStatsRecord = jsonRecord(read(bonuses, 'itemStats', 'item_stats'));
  const primaryRows = read(itemStatsRecord, 'bonusRows', 'bonus_rows');
  const hasPrimaryRows = Array.isArray(primaryRows) && primaryRows.length > 0;
  const rows = hasPrimaryRows
    ? primaryRows
    : read(bonuses, 'modifierRows', 'modifier_rows');
  const mapper = hasPrimaryRows ? playerFacingBonus : modifierBonus;

  return mapJsonArray(rows, mapper)
    .filter((bonus): bonus is ArmoryItemDetailBonus => bonus !== null)
    .filter(visibleBonus)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function playerFacingBonus(row: JsonRecord): ArmoryItemDetailBonus | null {
  const displayValue = optionalText(read(row, 'displayValue', 'display_value'));
  if (!displayValue?.trim()) {
    return null;
  }

  return {
    label: playerLabel(
      optionalText(read(row, 'displayLabel', 'display_label', 'targetLabel', 'target_label', 'label')) ?? 'Bonus',
      optionalText(read(row, 'targetKey', 'target_key', 'statKey', 'stat_key', 'key')),
    ),
    displayValue,
    numericValue: optionalNumber(read(row, 'numericValue', 'numeric_value')),
    rowKind: 'modifier_bonus',
    displaySection: 'bonuses',
    sourceKey: optionalText(read(row, 'sourceKey', 'source_key')),
    sourceLabel: optionalText(read(row, 'sourceLabel', 'source_label')),
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}

function modifierBonus(row: JsonRecord): ArmoryItemDetailBonus | null {
  const displayValue = optionalText(read(row, 'displayValue', 'display_value'));
  if (!displayValue?.trim()) {
    return null;
  }

  const sourceLabel = optionalText(read(row, 'sourceLabel', 'source_label'));
  const sourceKey = optionalText(read(row, 'sourceKey', 'source_key'));
  const numericValue = optionalNumber(
    read(row, 'value', 'numericValue', 'numeric_value'),
  );

  return {
    label: playerLabel(
      optionalText(read(row, 'displayLabel', 'display_label', 'label'))
        ?? optionalText(read(row, 'statKey', 'stat_key', 'targetKey', 'target_key'))
        ?? 'Bonus',
      optionalText(read(row, 'statKey', 'stat_key', 'targetKey', 'target_key')),
    ),
    displayValue,
    numericValue,
    rowKind: 'modifier_bonus',
    displaySection: 'bonuses',
    sourceKey,
    sourceLabel,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}

function visibleBonus(bonus: ArmoryItemDetailBonus): boolean {
  const value = bonus.displayValue.trim();

  return bonus.numericValue !== 0
    && value !== '0'
    && value !== '+0'
    && value !== '0%';
}

function playerLabel(label: string, key: string | null): string {
  const base = key?.trim()
    ? key.replace(/_flat$/i, '')
    : label.replace(/\s+flat$/i, '');
  const normalized = base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^max\b/, 'maximum')
    .replace(/^min\b/, 'minimum');

  return normalized
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : label;
}
