import {
  StartFlowCreateHeroRow,
  StartFlowHeroCreationResult,
  StartFlowOriginOption,
  StartFlowOriginOptionRow,
  StartFlowServerAvailability,
  StartFlowServerAvailabilityRow,
} from '../domain/start-flow/start-flow.model';

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
    imageUrl: `/images/origins/${row.origin_key.toLowerCase()}.png`,
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
