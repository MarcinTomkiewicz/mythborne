import {
  classifyItemDisplay,
} from '../domain/equipment/equipment-preview.mapper';
import {
  ArmoryItemDetailBonus,
  ArmoryItemDetailReadModel,
  ArmoryItemDetailStat,
} from '../domain/item/item-equipment.model';
import { Json } from '../types/database.types';
import { GetHeroArmoryItemDetailRpcRow } from '../types/item-equipment-rpc.types';
import {
  jsonRecord,
  JsonRecord,
  mapJsonArray,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { normalizeBonusTargetKey } from './bonus';

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
    itemStats: itemStats(bonuses, {
      baseTypeKey: row.base_type_key,
    }),
    bonuses: bonusRows(bonuses),
    requirementPreview: null,
  };
}

function itemStats(
  bonuses: JsonRecord | null,
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): ArmoryItemDetailStat[] {
  const finalStats = jsonRecord(read(bonuses, 'finalStats', 'final_stats'));
  const finalStatRows = [
    ...damageStatRows(jsonRecord(read(finalStats, 'damage')), item),
    ...defenseStatRows(read(finalStats, 'totals'), item),
  ];

  if (finalStatRows.length) {
    return finalStatRows;
  }

  const itemStatsRecord = jsonRecord(read(bonuses, 'itemStats', 'item_stats'));

  return mapJsonArray(read(itemStatsRecord, 'rows'), statRow)
    .filter((stat) => basicItemStat(stat, item));
}

function damageStatRows(
  damage: JsonRecord | null,
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): ArmoryItemDetailStat[] {
  if (!isWeaponItem(item)) {
    return [];
  }

  const displayValue = optionalText(read(damage, 'displayValue', 'display_value'));
  if (!displayValue?.trim()) {
    return [];
  }

  return [{
    statKey: optionalText(read(damage, 'statKey', 'stat_key', 'key')) ?? 'damage',
    label: playerLabel(
      optionalText(read(damage, 'displayLabel', 'display_label', 'label')) ?? 'Damage',
      optionalText(read(damage, 'statKey', 'stat_key', 'key')) ?? 'damage',
    ),
    displayValue,
    ...statNumericValue(damage),
  }];
}

function defenseStatRows(
  value: Json | undefined,
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): ArmoryItemDetailStat[] {
  if (!isDefensiveItem(item)) {
    return [];
  }

  if (Array.isArray(value)) {
    return mapJsonArray(value, statRow)
      .filter((stat) => basicItemStat(stat, item));
  }

  const totals = jsonRecord(value);
  if (!totals) {
    return [];
  }

  return Object.entries(totals).flatMap(([key, entry]) => {
    const record = jsonRecord(entry);
    const numericValue = optionalNumber(entry);
    const displayValue = record
      ? optionalText(read(record, 'displayValue', 'display_value'))
      : numericValue === null
        ? null
        : String(numericValue);

    const statKey = record
      ? optionalText(read(record, 'statKey', 'stat_key', 'key', 'targetKey', 'target_key')) ?? key
      : key;

    if (normalizeBonusTargetKey(statKey) !== 'defense') {
      return [];
    }

    return displayValue?.trim()
      ? [{
          statKey,
          label: playerLabel(
            record
              ? optionalText(read(record, 'displayLabel', 'display_label', 'label')) ?? key
              : key,
            statKey,
          ),
          displayValue,
          ...statNumericValue(record, numericValue),
        }]
      : [];
  });
}

function basicItemStat(
  stat: ArmoryItemDetailStat,
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): boolean {
  const normalized = normalizeBonusTargetKey(stat.statKey);

  return (normalized === 'damage' && isWeaponItem(item))
    || (normalized === 'defense' && isDefensiveItem(item));
}

function isWeaponItem(
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): boolean {
  return classifyItemDisplay({ baseTypeKey: item.baseTypeKey }).statProfile === 'weapon';
}

function isDefensiveItem(
  item: Pick<ArmoryItemDetailReadModel, 'baseTypeKey'>,
): boolean {
  return classifyItemDisplay({ baseTypeKey: item.baseTypeKey }).statProfile === 'armor';
}

function statRow(row: JsonRecord): ArmoryItemDetailStat {
  const statKey = optionalText(read(row, 'statKey', 'stat_key', 'key', 'targetKey', 'target_key'));

  return {
    statKey,
    label: playerLabel(
      optionalText(read(row, 'displayLabel', 'display_label', 'label')) ?? 'Stat',
      statKey,
    ),
    displayValue: optionalText(read(row, 'displayValue', 'display_value')) ?? '',
    ...statNumericValue(row),
  };
}

function statNumericValue(
  row: JsonRecord | null,
  fallback: number | null = null,
): Pick<ArmoryItemDetailStat, 'numericValue'> | Record<string, never> {
  const numericValue = row
    ? optionalNumber(
      read(row, 'effectiveValue', 'effective_value', 'numericValue', 'numeric_value', 'value'),
    ) ?? fallback
    : fallback;

  return numericValue === null ? {} : { numericValue };
}

function bonusRows(bonuses: JsonRecord | null): ArmoryItemDetailBonus[] {
  return mapJsonArray(read(bonuses, 'modifierRows', 'modifier_rows'), modifierBonus)
    .filter((bonus): bonus is ArmoryItemDetailBonus => bonus !== null)
    .filter(visibleBonus)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function modifierBonus(row: JsonRecord): ArmoryItemDetailBonus | null {
  const numericValue = optionalNumber(
    read(
      row,
      'effectiveValue',
      'effective_value',
      'numericValue',
      'numeric_value',
      'value',
      'rawValue',
      'raw_value',
    ),
  );
  const displayValue = bonusDisplayValue(row, numericValue);
  if (!displayValue.trim()) {
    return null;
  }

  const sourceLabel = optionalText(read(row, 'sourceLabel', 'source_label'));
  const sourceKey = optionalText(read(row, 'sourceKey', 'source_key'));
  const targetKey = normalizeBonusTargetKey(optionalText(
    read(
      row,
      'targetKey',
      'target_key',
      'statKey',
      'stat_key',
      'typeKey',
      'type_key',
      'bonusTemplateKey',
      'bonus_template_key',
    ),
  ));

  return {
    label: playerLabel(
      optionalText(read(row, 'targetLabel', 'target_label'))
        ?? optionalText(read(row, 'displayLabel', 'display_label'))
        ?? optionalText(read(row, 'targetKey', 'target_key', 'statKey', 'stat_key'))
        ?? optionalText(read(row, 'label'))
        ?? optionalText(
          read(row, 'statKey', 'stat_key', 'typeKey', 'type_key', 'targetKey', 'target_key'),
        )
        ?? 'Bonus',
      optionalText(
        read(row, 'targetKey', 'target_key', 'statKey', 'stat_key', 'typeKey', 'type_key'),
      ),
    ),
    targetKey,
    displayValue,
    numericValue,
    rowKind: 'modifier_bonus',
    displaySection: 'bonuses',
    sourceKey,
    sourceLabel,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}

function bonusDisplayValue(row: JsonRecord, numericValue: number | null): string {
  const displayValue = optionalText(read(row, 'displayValue', 'display_value'));
  if (displayValue?.trim()) {
    return displayValue;
  }

  const effectiveText = optionalText(
    read(row, 'effectiveValue', 'effective_value'),
  );
  if (effectiveText?.trim()) {
    return effectiveText;
  }

  if (numericValue === null) {
    return '';
  }

  return numericValue > 0 ? `+${numericValue}` : `${numericValue}`;
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
