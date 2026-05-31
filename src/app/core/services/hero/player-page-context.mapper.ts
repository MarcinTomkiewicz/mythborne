import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';
import {
  EquipmentPreviewIconClass,
  equipmentPreviewIconClassForSlot,
} from '../../domain/equipment/equipment-preview-icons.config';
import { HeroDashboardRuntimeStatsReadModel } from '../../domain/hero/hero-dashboard-runtime-stats.model';
import { mapHeroDashboardRuntimeStats } from '../../domain/hero/hero-dashboard-runtime-stats.mapper';
import { Origin } from '../../domain/origin/origin.model';
import { CORE_RESOURCE_DISPLAY_DEFINITIONS } from '../../config/resource-display.config';
import { Json } from '../../types/database.types';
import { GetHeroDashboardRuntimeStatsRpcRow } from '../../types/hero-runtime-stats-rpc.types';
import { GetHeroEquipmentRuntimeSlotsRpcRow } from '../../types/item-equipment-rpc.types';
import { HeroResourceRow } from '../../types/resource-display.types';
import {
  JsonRecord,
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from '../../utils/json-read';
import { originImageUrl } from '../../utils/origin-mappers';
import {
  DashboardPersistentStateRow,
  DashboardWorldStateActionKey,
  DashboardWorldStateKey,
  DashboardWorldStateTone,
} from './dashboard-persistent-state.model';
import {
  PlayerDashboardExperienceContext,
  PlayerDashboardPageContext,
} from './player-page-context.model';

const DASHBOARD_WORLD_STATE_ROW_KEYS = new Set<DashboardWorldStateKey>([
  'active_state',
  'vicinity',
  'active_job',
  'trials_left',
  'attacks_left',
  'active_effect',
  'prestige_rank',
]);
const DASHBOARD_WORLD_STATE_TONES = new Set<DashboardWorldStateTone>([
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
  'golden',
]);
const DASHBOARD_WORLD_STATE_ACTION_KEYS = new Set<DashboardWorldStateActionKey>([
  'open_vicinity',
  'open_estate',
  'open_exploration',
]);

export function mapPlayerDashboardPageContext(value: Json): PlayerDashboardPageContext {
  const root = requireRecord(value, 'get_player_dashboard_page_context');
  const hero = requireRecord(read(root, 'hero'), 'dashboard hero');
  const heroId = requiredText(read(hero, 'id'), 'hero.id');
  const serverId = requiredText(read(hero, 'serverId', 'server_id'), 'hero.server_id');
  const estateSummary = nullableRecord(
    requireValue(root, ['estateSummary'], 'estateSummary'),
    'estateSummary',
  );

  return {
    heroId,
    serverId,
    heroName: requiredText(read(hero, 'name'), 'hero.name'),
    heroLevel: requiredPositiveInteger(read(hero, 'level'), 'hero.level'),
    characterPoints: requiredNonNegativeInteger(
      read(hero, 'characterPoints', 'character_points'),
      'hero.character_points',
    ),
    estateSummary,
    estateAddress: null,
    experience: mapExperienceContext(root),
    origin: mapOriginContext(requireValue(root, ['origin'], 'origin'), hero),
    runtimeStats: mapRuntimeStatsContext(root, heroId),
    heroResources: mapHeroResourcesContext(root),
    equipmentPreviewRows: mapEquipmentPreviewRowsContext(root),
    persistentStateRows: mapPersistentStateRowsContext(root),
  };
}

function mapExperienceContext(root: JsonRecord): PlayerDashboardExperienceContext {
  const experienceState = requireRecord(
    read(root, 'experienceState'),
    'experienceState',
  );

  return {
    level: requiredPositiveInteger(
      read(experienceState, 'level'),
      'experienceState.level',
    ),
    currentExperience: requiredNonNegativeInteger(
      read(experienceState, 'currentExperience'),
      'experienceState.currentExperience',
    ),
    experienceToNextLevel: requiredNonNegativeInteger(
      read(experienceState, 'experienceToNextLevel'),
      'experienceState.experienceToNextLevel',
    ),
    totalExperienceEarned: requiredNonNegativeInteger(
      read(experienceState, 'totalExperienceEarned'),
      'experienceState.totalExperienceEarned',
    ),
    experienceProgressPercent: requiredNonNegativeInteger(
      read(experienceState, 'experienceProgressPercent'),
      'experienceState.experienceProgressPercent',
    ),
    isAvailable: requiredBoolean(read(experienceState, 'isAvailable'), 'experienceState.isAvailable'),
    unavailableReason: optionalText(read(experienceState, 'unavailableReason')),
  };
}

function mapOriginContext(value: Json, hero: JsonRecord): Origin | null {
  if (value === null) {
    const originId = optionalText(read(hero, 'originId', 'origin_id'));

    if (originId) {
      throw new Error('Player dashboard page context is missing origin for hero.origin_id.');
    }

    return null;
  }

  const origin = requireRecord(value, 'origin');
  const key = requiredText(read(origin, 'key'), 'origin.key');

  return {
    id: requiredText(read(origin, 'id'), 'origin.id'),
    key,
    name: requiredText(read(origin, 'name'), 'origin.name'),
    description: optionalText(read(origin, 'description')),
    imageUrl: optionalText(read(origin, 'imageUrl', 'image_url')) ?? originImageUrl(key),
    createdAt: optionalText(read(origin, 'createdAt', 'created_at')),
  };
}

function mapRuntimeStatsContext(
  root: JsonRecord,
  heroId: string,
): HeroDashboardRuntimeStatsReadModel {
  const dashboardRuntimeStats = requireRecord(
    requireValue(
      root,
      ['dashboardRuntimeStats', 'dashboard_runtime_stats'],
      'dashboardRuntimeStats',
    ),
    'dashboardRuntimeStats',
  );

  const runtimeStats = mapHeroDashboardRuntimeStats({
    hero_id: optionalText(read(dashboardRuntimeStats, 'heroId', 'hero_id')) ?? heroId,
    attack_plan_json: requireJsonValue(
      dashboardRuntimeStats,
      ['attackPlanJson', 'attack_plan_json'],
      'dashboardRuntimeStats.attack_plan_json',
    ),
    damage_rows_json: requireJsonValue(
      dashboardRuntimeStats,
      ['damageRowsJson', 'damage_rows_json'],
      'dashboardRuntimeStats.damage_rows_json',
    ),
    display_stats_json: requireJsonValue(
      dashboardRuntimeStats,
      ['displayStatsJson', 'display_stats_json'],
      'dashboardRuntimeStats.display_stats_json',
    ),
    source_json: requireJsonValue(
      dashboardRuntimeStats,
      ['sourceJson', 'source_json'],
      'dashboardRuntimeStats.source_json',
    ),
    stats_json: requireJsonValue(
      dashboardRuntimeStats,
      ['statsJson', 'stats_json'],
      'dashboardRuntimeStats.stats_json',
    ),
    defense: requiredNonNegativeInteger(
      read(dashboardRuntimeStats, 'defense'),
      'dashboardRuntimeStats.defense',
    ),
    current_health: requiredNonNegativeInteger(
      read(dashboardRuntimeStats, 'currentHealth', 'current_health'),
      'dashboardRuntimeStats.current_health',
    ),
    max_health: requiredNonNegativeInteger(
      read(dashboardRuntimeStats, 'maxHealth', 'max_health'),
      'dashboardRuntimeStats.max_health',
    ),
    luck: requiredNonNegativeInteger(
      read(dashboardRuntimeStats, 'luck'),
      'dashboardRuntimeStats.luck',
    ),
    critical_chance_bonus: requiredNumber(
      read(dashboardRuntimeStats, 'criticalChanceBonus', 'critical_chance_bonus'),
      'dashboardRuntimeStats.critical_chance_bonus',
    ),
    critical_damage: requiredNumber(
      read(dashboardRuntimeStats, 'criticalDamage', 'critical_damage'),
      'dashboardRuntimeStats.critical_damage',
    ),
    evasion_chance_bonus: requiredNumber(
      read(dashboardRuntimeStats, 'evasionChanceBonus', 'evasion_chance_bonus'),
      'dashboardRuntimeStats.evasion_chance_bonus',
    ),
    attack_count: requiredNonNegativeInteger(
      read(dashboardRuntimeStats, 'attackCount', 'attack_count'),
      'dashboardRuntimeStats.attack_count',
    ),
  } satisfies GetHeroDashboardRuntimeStatsRpcRow);

  assertDashboardRuntimeDisplayStats(runtimeStats);

  return runtimeStats;
}

function assertDashboardRuntimeDisplayStats(
  runtimeStats: HeroDashboardRuntimeStatsReadModel,
): void {
  if (runtimeStats.displayStats.heroStats.length === 0) {
    throw new Error(
      'Player dashboard page context is missing dashboardRuntimeStats.display_stats_json.heroStats rows.',
    );
  }

  if (runtimeStats.displayStats.derivedStats.length === 0) {
    throw new Error(
      'Player dashboard page context is missing dashboardRuntimeStats.display_stats_json.derivedStats rows.',
    );
  }

  if (runtimeStats.displayStats.damageRows.length === 0) {
    throw new Error(
      'Player dashboard page context is missing dashboardRuntimeStats.display_stats_json.damageRows rows.',
    );
  }
}

function mapHeroResourcesContext(root: JsonRecord): HeroResourceRow[] {
  const rows = requireArray(
    requireValue(root, ['heroResources', 'hero_resources'], 'heroResources'),
    'heroResources',
  ).map((row) => ({
    id: requiredText(read(row, 'id'), 'heroResources.id'),
    hero_id: optionalText(read(row, 'heroId', 'hero_id')),
    resource_type: requiredText(read(row, 'resourceType', 'resource_type'), 'heroResources.resource_type'),
    amount: requiredNonNegativeInteger(read(row, 'amount'), 'heroResources.amount'),
    per_hour: requiredNumber(read(row, 'perHour', 'per_hour'), 'heroResources.per_hour'),
    updated_at: optionalText(read(row, 'updatedAt', 'updated_at')),
  }));
  const missingResourceTypes = CORE_RESOURCE_DISPLAY_DEFINITIONS.filter((definition) =>
    !rows.some((row) => row.resource_type === definition.type)
  ).map((definition) => definition.type);

  if (missingResourceTypes.length > 0) {
    throw new Error(
      `Player dashboard page context is missing heroResources rows for: ${missingResourceTypes.join(', ')}.`,
    );
  }

  return rows;
}

function mapEquipmentPreviewRowsContext(root: JsonRecord): EquipmentPreviewSlotRow[] {
  return requireArray(
    requireValue(root, ['equipmentSlots', 'equipment_slots'], 'equipmentSlots'),
    'equipmentSlots',
  ).map(mapEquipmentPreviewRow)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function mapEquipmentPreviewRow(row: JsonRecord): EquipmentPreviewSlotRow {
  const slotKey = requiredText(read(row, 'slotKey', 'slot_key'), 'equipmentSlots.slot_key');
  const hasItem = optionalBoolean(read(row, 'hasItem', 'has_item')) ?? !!read(row, 'itemId', 'item_id');
  const runtimeSlot = row as unknown as GetHeroEquipmentRuntimeSlotsRpcRow;

  return {
    slotKey,
    label: requiredText(read(row, 'slotLabel', 'slot_label'), 'equipmentSlots.slot_label'),
    sortOrder: requiredNonNegativeInteger(
      read(row, 'slotSortOrder', 'slot_sort_order'),
      'equipmentSlots.slot_sort_order',
    ),
    iconClass: equipmentPreviewIcon(row, slotKey),
    item: hasItem
      ? {
          itemId: requiredText(read(row, 'itemId', 'item_id'), 'equipmentSlots.item_id'),
          name: requiredText(read(row, 'itemName', 'item_name'), 'equipmentSlots.item_name'),
          metadata: [
            optionalText(read(row, 'slotLabel', 'slot_label')),
            optionalText(read(row, 'qualityLabel', 'quality_label')),
          ].filter(Boolean).join(' - '),
          statusLabel: optionalText(read(row, 'itemStatusKey', 'item_status_key')),
          qualityLabel: optionalText(read(row, 'qualityLabel', 'quality_label')),
          kindLabel: optionalText(read(row, 'baseName', 'base_name')),
          slotLabel: optionalText(read(row, 'slotLabel', 'slot_label')),
        }
      : null,
  };

  function equipmentPreviewIcon(
    value: JsonRecord,
    fallbackSlotKey: string,
  ): EquipmentPreviewIconClass {
    const iconClass = optionalText(read(value, 'iconClass', 'icon_class'));

    if (iconClass) {
      return iconClass as EquipmentPreviewIconClass;
    }

    if (runtimeSlot.has_item && runtimeSlot.base_type_key) {
      return equipmentPreviewIconClassForSlot(runtimeSlot.slot_key);
    }

    return equipmentPreviewIconClassForSlot(fallbackSlotKey);
  }
}

function mapPersistentStateRowsContext(root: JsonRecord): DashboardPersistentStateRow[] {
  const rows = requireArray(
    requireValue(root, ['worldStateRows'], 'worldStateRows'),
    'worldStateRows',
  ).map(mapDashboardWorldStateRow)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  if (!rows.length) {
    throw new Error('Player dashboard page context is missing worldStateRows entries.');
  }

  return rows;
}

function mapDashboardWorldStateRow(row: JsonRecord): DashboardPersistentStateRow {
  const key = requiredDashboardWorldStateKey(read(row, 'key'));

  return {
    key,
    label: requiredText(read(row, 'label'), 'worldStateRows.label'),
    value: requireValue(row, ['value'], 'worldStateRows.value'),
    displayValue: requiredText(read(row, 'displayValue'), 'worldStateRows.displayValue'),
    tone: requiredDashboardWorldStateTone(read(row, 'tone')),
    sortOrder: requiredNumber(read(row, 'sortOrder'), 'worldStateRows.sortOrder'),
    actionKey: optionalDashboardWorldStateActionKey(read(row, 'actionKey')),
    source: optionalText(read(row, 'source')) ?? undefined,
  };
}

function requiredDashboardWorldStateKey(value: Json | undefined): DashboardWorldStateKey {
  const key = requiredText(value, 'worldStateRows.key');

  if (!DASHBOARD_WORLD_STATE_ROW_KEYS.has(key as DashboardWorldStateKey)) {
    throw new Error(`Player dashboard page context has unsupported worldStateRows key: ${key}.`);
  }

  return key as DashboardWorldStateKey;
}

function requiredDashboardWorldStateTone(value: Json | undefined): DashboardWorldStateTone {
  const tone = requiredText(value, 'worldStateRows.tone');

  if (!DASHBOARD_WORLD_STATE_TONES.has(tone as DashboardWorldStateTone)) {
    throw new Error(`Player dashboard page context has unsupported worldStateRows tone: ${tone}.`);
  }

  return tone as DashboardWorldStateTone;
}

function optionalDashboardWorldStateActionKey(
  value: Json | undefined,
): DashboardWorldStateActionKey | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const actionKey = requiredText(value, 'worldStateRows.actionKey');

  if (!DASHBOARD_WORLD_STATE_ACTION_KEYS.has(actionKey as DashboardWorldStateActionKey)) {
    throw new Error(`Player dashboard page context has unsupported worldStateRows actionKey: ${actionKey}.`);
  }

  return actionKey as DashboardWorldStateActionKey;
}

function requiredText(value: Json | undefined, field: string): string {
  const text = optionalText(value)?.trim();

  if (!text) {
    throw new Error(`Player dashboard page context is missing ${field}.`);
  }

  return text;
}

function requiredNumber(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null) {
    throw new Error(`Player dashboard page context is missing ${field}.`);
  }

  return number;
}

function requiredBoolean(value: Json | undefined, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Player dashboard page context is missing ${field}.`);
  }

  return value;
}

function requiredNonNegativeInteger(value: Json | undefined, field: string): number {
  const number = requiredNumber(value, field);

  if (number < 0) {
    throw new Error(`Player dashboard page context field ${field} must be non-negative.`);
  }

  return Math.floor(number);
}

function requiredPositiveInteger(value: Json | undefined, field: string): number {
  const number = requiredNumber(value, field);

  if (number < 1) {
    throw new Error(`Player dashboard page context field ${field} must be positive.`);
  }

  return Math.floor(number);
}

function requireRecord(value: Json | undefined, field: string): JsonRecord {
  const record = jsonRecord(value);

  if (!record) {
    throw new Error(`Player dashboard page context is missing ${field}.`);
  }

  return record;
}

function nullableRecord(value: Json, field: string): JsonRecord | null {
  if (value === null) {
    return null;
  }

  return requireRecord(value, field);
}

function requireValue(
  record: JsonRecord,
  keys: readonly string[],
  field: string,
): Json {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined) {
      return value;
    }
  }

  throw new Error(`Player dashboard page context is missing ${field}.`);
}

function requireJsonValue(
  record: JsonRecord,
  keys: readonly string[],
  field: string,
): Json {
  return requireValue(record, keys, field);
}

function requireArray(value: Json, field: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`Player dashboard page context field ${field} must be an array.`);
  }

  return value.map((entry, index) => requireRecord(entry, `${field}[${index}]`));
}
