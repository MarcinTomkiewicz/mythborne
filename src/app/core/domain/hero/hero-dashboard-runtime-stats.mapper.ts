import { Json } from '../../types/database.types';
import { GetHeroDashboardRuntimeStatsRpcRow } from '../../types/hero-runtime-stats-rpc.types';
import {
  JsonRecord,
  jsonRecord,
  mapJsonArray,
  mapJsonObject,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from '../../utils/json-read';
import {
  HeroDashboardDisplayDamageRow,
  HeroDashboardDisplayDamageValue,
  HeroDashboardDisplayStatRow,
  HeroDashboardDisplayStats,
  HeroDashboardRuntimeStatsReadModel,
  HeroDashboardStatTone,
} from './hero-dashboard-runtime-stats.model';

export function mapHeroDashboardRuntimeStats(
  row: GetHeroDashboardRuntimeStatsRpcRow,
): HeroDashboardRuntimeStatsReadModel {
  return {
    heroId: row.hero_id,
    displayStats: mapDisplayStats(row.display_stats_json),
    defense: row.defense,
    currentHealth: row.current_health,
    maxHealth: row.max_health,
    luck: row.luck,
    criticalChanceBonus: row.critical_chance_bonus,
    criticalDamage: row.critical_damage,
    evasionChanceBonus: row.evasion_chance_bonus,
    attackCount: row.attack_count,
  };
}

function mapDisplayStats(value: Json): HeroDashboardDisplayStats {
  return mapJsonObject(value, (record) => ({
    heroStats: sortDisplayRows(mapJsonArray(
      read(record, 'heroStats', 'hero_stats'),
      mapDisplayStatRow,
    )),
    derivedStats: sortDisplayRows(mapJsonArray(
      read(record, 'derivedStats', 'derived_stats'),
      mapDisplayStatRow,
    )),
    damageRows: sortDisplayRows(mapJsonArray(
      read(record, 'damageRows', 'damage_rows'),
      mapDisplayDamageRow,
    )),
  })) ?? {
    heroStats: [],
    derivedStats: [],
    damageRows: [],
  };
}

function mapDisplayStatRow(row: JsonRecord): HeroDashboardDisplayStatRow {
  const statKey = optionalText(read(row, 'statKey', 'stat_key', 'key')) ?? '';
  const finalValue = displayScalar(read(row, 'finalValue', 'final_value', 'value'));
  const displayValue = optionalText(read(
    row,
    'displayValue',
    'display_value',
    'valueLabel',
    'value_label',
  )) ?? displayText(finalValue);

  return {
    statKey,
    label: optionalText(read(row, 'label')) ?? statKey,
    displayValue,
    finalValue,
    tone: statTone(read(row, 'tone')),
    colorableFinalValue: optionalBoolean(read(
      row,
      'colorableFinalValue',
      'colorable_final_value',
    )) ?? false,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}

function mapDisplayDamageRow(row: JsonRecord): HeroDashboardDisplayDamageRow {
  const key = optionalText(read(
    row,
    'key',
    'sourceKey',
    'source_key',
    'slotKey',
    'slot_key',
    'attackSourceKey',
    'attack_source_key',
  )) ?? '';

  return {
    key,
    label: optionalText(read(
      row,
      'sourceLabel',
      'source_label',
      'label',
      'name',
      'slotLabel',
      'slot_label',
    )) ?? 'Damage',
    displayValue: optionalText(read(row, 'displayValue', 'display_value')) ?? '',
    baseDamage: damageValue(read(row, 'baseDamage', 'base_damage')),
    finalDamage: damageValue(read(row, 'finalDamage', 'final_damage')),
    minDelta: optionalNumber(read(row, 'minDelta', 'min_delta')),
    maxDelta: optionalNumber(read(row, 'maxDelta', 'max_delta')),
    minTone: statTone(read(row, 'minTone', 'min_tone')),
    maxTone: statTone(read(row, 'maxTone', 'max_tone')),
    tone: statTone(read(row, 'tone')),
    colorableFinalValue: optionalBoolean(read(
      row,
      'colorableFinalValue',
      'colorable_final_value',
    )) ?? false,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
  };
}

function sortDisplayRows<T extends { sortOrder: number }>(rows: T[]): T[] {
  return rows.slice().sort((first, second) => first.sortOrder - second.sortOrder);
}

function damageValue(value: Json | undefined): HeroDashboardDisplayDamageValue {
  const scalar = displayScalar(value);

  if (scalar !== null) {
    return { min: displayText(scalar), max: null };
  }

  const record = jsonRecord(value);

  if (!record) {
    return { min: null, max: null };
  }

  return {
    min: displayText(displayScalar(read(
      record,
      'min',
      'minDamage',
      'min_damage',
      'finalMinDamage',
      'final_min_damage',
    ))),
    max: displayText(displayScalar(read(
      record,
      'max',
      'maxDamage',
      'max_damage',
      'finalMaxDamage',
      'final_max_damage',
    ))),
  };
}

function displayScalar(value: Json | undefined): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

function displayText(value: string | number | null): string {
  return value === null ? '' : `${value}`;
}

function statTone(value: Json | undefined): HeroDashboardStatTone {
  return value === 'positive' || value === 'negative' ? value : 'neutral';
}
