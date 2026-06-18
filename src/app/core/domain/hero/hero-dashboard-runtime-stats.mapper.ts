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
  requiredText,
} from '../../utils/json-read';
import {
  HeroDashboardDisplayDamageRow,
  HeroDashboardDisplayDamageValue,
  HeroDashboardDisplayValueSegment,
  HeroDashboardDisplayStatRow,
  HeroDashboardDisplayStats,
  HeroDashboardRuntimeStatsReadModel,
} from './hero-dashboard-runtime-stats.model';
import {
  displayScalar,
  displayText,
  sortBySortOrder,
} from '../../utils/stat-row-display';
import { statTone } from '../../utils/stat-tone-class';

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
    heroStats: sortBySortOrder(mapJsonArray(
      read(record, 'heroStats', 'hero_stats'),
      mapDisplayStatRow,
    )),
    derivedStats: sortBySortOrder(mapJsonArray(
      read(record, 'derivedStats', 'derived_stats'),
      mapDisplayStatRow,
    )),
    damageRows: sortBySortOrder(mapJsonArray(
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
  const displaySegments = mapDisplayValueSegments(row);

  return {
    statKey,
    label: optionalText(read(row, 'label')) ?? statKey,
    displayValue,
    tone: statTone(read(row, 'tone', 'displayTone', 'display_tone')),
    colorableFinalValue: optionalBoolean(read(
      row,
      'colorableFinalValue',
      'colorable_final_value',
    )) ?? false,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
    ...(displaySegments.length ? { displaySegments } : {}),
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
  const displaySegments = mapDisplayValueSegments(row);

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
    )) ?? 'dashboard.displayStats.damageRows.label',
    displayValue: optionalText(read(row, 'displayValue', 'display_value')) ?? '',
    finalDamage: damageValue(read(row, 'finalDamage', 'final_damage')),
    minTone: statTone(read(row, 'minTone', 'min_tone')),
    maxTone: statTone(read(row, 'maxTone', 'max_tone')),
    tone: statTone(read(row, 'tone', 'displayTone', 'display_tone')),
    colorableFinalValue: optionalBoolean(read(
      row,
      'colorableFinalValue',
      'colorable_final_value',
    )) ?? false,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')) ?? 0,
    ...(displaySegments.length ? { displaySegments } : {}),
  };
}

function mapDisplayValueSegments(row: JsonRecord): HeroDashboardDisplayValueSegment[] {
  return mapJsonArray(
    read(
      row,
      'displaySegments',
      'display_segments',
      'displayValueSegments',
      'display_value_segments',
      'valueParts',
      'value_parts',
    ),
    (segment) => ({
      text: requiredText(
        read(segment, 'text', 'displayValue', 'display_value'),
        'displaySegments.text',
      ),
      tone: statTone(read(segment, 'tone')),
    }),
  );
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
