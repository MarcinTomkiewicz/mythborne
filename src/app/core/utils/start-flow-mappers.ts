import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageImageUrl,
} from '../config/storage-assets.config';
import {
  AccountEntryActiveHeroContext,
  AccountEntryActiveHeroContextRow,
  AccountEntryHeroContext,
  AccountEntryHeroContextRow,
  StartFlowCreateHeroRow,
  StartFlowHeroOption,
  StartFlowHeroCreationResult,
  StartFlowOriginOption,
  StartFlowOriginOptionRow,
  StartFlowServerAvailability,
  StartFlowServerAvailabilityRow,
} from '../domain/start-flow/start-flow.model';
import {
  jsonRecord,
  optionalNumber,
  optionalText,
  read,
} from './json-read';

export function mapStartFlowServerAvailability(
  row: StartFlowServerAvailabilityRow,
): StartFlowServerAvailability {
  return {
    serverId: row.server_id,
    serverKey: row.server_key,
    serverName: row.server_name,
    serverKind: row.server_kind,
    serverStatus: row.server_status,
    description: row.description,
    membershipStatus: row.membership_status,
    isVisible: row.is_visible,
    isStandard: row.is_standard,
    isSandbox: row.is_sandbox,
    isStaffContext: row.is_staff_context,
    canEnterGame: row.can_enter_game,
    canCreateHero: row.can_create_hero,
    nextAction: row.next_action,
    blockReason: row.block_reason || null,
    userHeroCount: row.user_hero_count,
    defaultHeroId: row.default_hero_id || null,
    defaultHeroName: row.default_hero_name || null,
    isServerFull: row.is_server_full,
    isDistrictAFull: row.is_district_a_full,
    districtACapacity: row.district_a_capacity,
    districtAOccupied: row.district_a_occupied,
    districtAFree: row.district_a_free,
    heroesJson: row.heroes_json,
    eligibilityJson: row.eligibility_json,
    heroes: mapStartFlowHeroOptions(row.heroes_json),
  };
}

export function mapStartFlowHeroOptions(json: unknown): StartFlowHeroOption[] {
  if (!Array.isArray(json)) {
    return [];
  }

  return json
    .map((entry) => mapStartFlowHeroOption(entry))
    .filter((entry): entry is StartFlowHeroOption => !!entry)
    .sort((left, right) => {
      const leftCreatedAt = left.createdAt ?? '';
      const rightCreatedAt = right.createdAt ?? '';

      if (leftCreatedAt !== rightCreatedAt) {
        return leftCreatedAt.localeCompare(rightCreatedAt);
      }

      return left.heroName.localeCompare(right.heroName);
    });
}

export function mapAccountEntryHeroContext(
  row: AccountEntryHeroContextRow,
): AccountEntryHeroContext {
  const context = jsonRecord(row.hero_context_json);

  return {
    heroId: requiredText(read(context, 'heroId'), row.hero_id, 'heroId'),
    serverId: requiredText(read(context, 'serverId'), row.server_id, 'serverId'),
    serverKey: requiredText(read(context, 'serverKey'), row.server_key, 'serverKey'),
    serverName: requiredText(read(context, 'serverName'), row.server_name, 'serverName'),
    heroName: requiredText(read(context, 'heroName'), row.hero_name, 'heroName'),
    heroLevel: requiredNumber(read(context, 'heroLevel'), row.hero_level, 'heroLevel'),
    estateId: optionalText(read(context, 'estateId')) ?? nullableString(row.estate_id),
    districtCode: optionalText(read(context, 'districtCode')) ?? nullableString(row.district_code),
    addressNumber: optionalNumber(read(context, 'addressNumber')) ?? nullableNumber(row.address_number),
    address: optionalText(read(context, 'address')) ?? nullableString(row.address),
    addressLabel: optionalText(read(context, 'addressLabel')) ?? nullableString(row.address_label),
    createdAt: optionalText(read(context, 'createdAt')) ?? nullableString(row.created_at),
    routeNextAction: requiredText(
      read(context, 'routeNextAction'),
      row.route_next_action,
      'routeNextAction',
    ),
  };
}

export function mapAccountEntryActiveHeroContext(
  row: AccountEntryActiveHeroContextRow,
): AccountEntryActiveHeroContext {
  return {
    ...mapAccountEntryHeroContext(row),
    activeHeroJson: row.active_hero_json,
    heroContextJson: row.hero_context_json,
    serverContextJson: row.server_context_json,
    accessJson: row.access_json,
  };
}

function mapStartFlowHeroOption(entry: unknown): StartFlowHeroOption | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const heroId = stringValue(record['hero_id'] ?? record['heroId'] ?? record['id']);
  const heroName = stringValue(record['hero_name'] ?? record['heroName'] ?? record['name']);

  if (!heroId || !heroName) {
    return null;
  }

  return {
    heroId,
    heroName,
    createdAt: stringValue(record['created_at'] ?? record['createdAt']) || null,
  };
}

export function mapStartFlowOriginOption(
  row: StartFlowOriginOptionRow,
): StartFlowOriginOption {
  return {
    id: row.origin_id,
    key: row.origin_key,
    name: row.origin_label,
    description: row.origin_description || null,
    imageUrl: supabaseStorageImageUrl(
      `origins/${row.origin_key.toLowerCase()}.png`,
      SUPABASE_ASSET_IMAGE_TRANSFORMS.originCard,
    ),
    createdAt: null,
    originId: row.origin_id,
    originKey: row.origin_key,
    originLabel: row.origin_label,
    originDescription: row.origin_description || null,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    bonusesJson: row.bonuses_json,
    bonusSummaryText: row.bonus_summary_text,
  };
}

export function mapStartFlowHeroCreationResult(
  row: StartFlowCreateHeroRow,
): StartFlowHeroCreationResult {
  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    heroName: row.hero_name,
    originId: row.origin_id,
    originKey: row.origin_key,
    originLabel: row.origin_label,
    estateId: row.estate_id,
    districtCode: row.district_code,
    addressNumber: row.address_number,
    address: row.address,
    characterPointsBalance: row.character_points_balance,
    characterPointLedgerId: row.character_point_ledger_id,
    prestigeRankNumber: row.prestige_rank_number,
    prestigeRankName: row.prestige_rank_name,
    resourcesJson: row.resources_json,
    heroStatsJson: row.hero_stats_json,
    routeNextAction: row.route_next_action,
    createdNewHero: row.created_new_hero,
    auditLogId: row.audit_log_id,
  };
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function requiredText(
  value: unknown,
  fallback: unknown,
  fieldName: string,
): string {
  const text = stringValue(value) || stringValue(fallback);

  if (!text) {
    throw new Error(`Account entry hero context is missing ${fieldName}.`);
  }

  return text;
}

function requiredNumber(
  value: unknown,
  fallback: unknown,
  fieldName: string,
): number {
  const numeric = typeof value === 'number' && Number.isFinite(value)
    ? value
    : typeof fallback === 'number' && Number.isFinite(fallback)
      ? fallback
      : null;

  if (numeric === null) {
    throw new Error(`Account entry hero context is missing ${fieldName}.`);
  }

  return numeric;
}

function nullableString(value: unknown): string | null {
  return stringValue(value) || null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
