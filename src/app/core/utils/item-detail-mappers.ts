import {
  ArmoryItemDetailBonus,
  ArmoryItemDetailReadModel,
  ArmoryItemDetailStat,
} from '../domain/item/item-equipment.model';
import { GetHeroArmoryItemDetailRpcRow } from '../types/item-equipment-rpc.types';
import {
  jsonRecord,
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapPlayerItemDisplayCore } from './player-item-display-core.mapper';

export function mapArmoryItemDetail(
  row: GetHeroArmoryItemDetailRpcRow,
): ArmoryItemDetailReadModel {
  const bonuses = jsonRecord(row.bonuses_json);

  return {
    itemId: row.item_id,
    heroId: row.hero_id,
    serverId: row.server_id,
    displayCore: mapPlayerItemDisplayCore(
      read(bonuses, 'displayMeta'),
      'bonuses_json.displayMeta',
    ),
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
    requirementPreview: null,
  };
}

function itemStats(bonuses: JsonRecord | null): ArmoryItemDetailStat[] {
  const itemStatsRecord = requiredRecord(
    read(bonuses, 'itemStats'),
    'bonuses_json.itemStats',
  );

  return requiredArray(
    read(itemStatsRecord, 'rows'),
    'bonuses_json.itemStats.rows',
  ).map(statRow);
}

function statRow(row: JsonRecord): ArmoryItemDetailStat {
  return {
    statKey: optionalText(read(row, 'statKey')),
    label: requiredText(
      read(row, 'displayLabel'),
      'bonuses_json.itemStats.rows[].displayLabel',
    ),
    displayValue: requiredText(
      read(row, 'displayValue'),
      'bonuses_json.itemStats.rows[].displayValue',
    ),
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
  return requiredArray(
    read(bonuses, 'modifierRows'),
    'bonuses_json.modifierRows',
  )
    .map(modifierBonus)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function modifierBonus(row: JsonRecord): ArmoryItemDetailBonus {
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
  const sourceLabel = optionalText(read(row, 'sourceLabel', 'source_label'));
  const sourceKey = optionalText(read(row, 'sourceKey', 'source_key'));
  const targetKey = optionalText(read(row, 'targetKey'));

  return {
    label: requiredText(
      read(row, 'displayLabel'),
      'bonuses_json.modifierRows[].displayLabel',
    ),
    displayValue: requiredText(
      read(row, 'displayValue'),
      'bonuses_json.modifierRows[].displayValue',
    ),
    targetKey,
    numericValue,
    rowKind: 'modifier_bonus',
    displaySection: 'bonuses',
    sourceKey,
    sourceLabel,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}
