import {
  ActivePvpActionOffer,
  HeroPvpDailyAttackState,
  PvpActionKindEntry,
  PvpActionStartResult,
  PvpActionStatusEntry,
  PvpSpyGameReportResult,
  PvpSpySettlementResult,
  PvpTargetCandidate,
} from '../domain/pvp/pvp.model';
import {
  CreatePvpSpyGameReportRpcRow,
  GetActivePvpActionOfferRpcRow,
  GetHeroPvpDailyAttackStateRpcRow,
  GetPvpTargetCandidatesRpcRow,
  GetPvpVisibleAddressTargetOverlayRpcRow,
  PvpActionKindKey,
  PvpActionKindRow,
  PvpActionStatusKey,
  PvpActionStatusRow,
  SettleDuePvpSpyActionRpcRow,
  StartPvpActionRpcRow,
} from '../types/pvp-rpc.types';
import { optionalInteger } from './number';
import { requiredTrimmedText, trimToNull } from './normalize-text';

export function mapPvpActionKind(row: PvpActionKindRow): PvpActionKindEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: trimToNull(row.helper_text),
    adminDescription: trimToNull(row.admin_description),
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createsCombat: row.creates_combat,
    createsRuntimeActivity: row.creates_runtime_activity,
    createsSpyResult: row.creates_spy_result,
    isTravelAction: row.is_travel_action,
  };
}

export function mapPvpActionStatus(row: PvpActionStatusRow): PvpActionStatusEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: trimToNull(row.helper_text),
    adminDescription: trimToNull(row.admin_description),
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isBlocking: row.is_blocking,
    isTerminal: row.is_terminal,
  };
}

export function mapPvpTargetCandidate(
  row: GetPvpTargetCandidatesRpcRow,
): PvpTargetCandidate {
  return mapPvpTargetCandidateBase(row);
}

export function mapPvpVisibleAddressTargetOverlay(
  row: GetPvpVisibleAddressTargetOverlayRpcRow,
): PvpTargetCandidate {
  return mapPvpTargetCandidateBase(row);
}

function mapPvpTargetCandidateBase(
  row: GetPvpTargetCandidatesRpcRow | GetPvpVisibleAddressTargetOverlayRpcRow,
): PvpTargetCandidate {
  return {
    targetHeroId: requiredTrimmedText(row.target_hero_id, 'targetHeroId', 'PvP read model'),
    targetDisplayName: requiredTrimmedText(row.target_display_name, 'targetDisplayName', 'PvP read model'),
    targetLevel: row.target_level,
    targetGuildId: 'target_guild_id' in row ? trimToNull(row.target_guild_id) : null,
    targetGuildName: 'target_guild_name' in row ? trimToNull(row.target_guild_name) : null,
    targetGuildTag: 'target_guild_tag' in row ? trimToNull(row.target_guild_tag) : null,
    targetGuildDisplayLabel: 'target_guild_display_label' in row
      ? trimToNull(row.target_guild_display_label)
      : null,
    targetAddress: {
      estateId: requiredTrimmedText(row.target_estate_id, 'targetEstateId', 'PvP read model'),
      districtCode: requiredTrimmedText(row.target_district_code, 'targetDistrictCode', 'PvP read model'),
      address: requiredTrimmedText(row.target_address, 'targetAddress', 'PvP read model'),
      addressNumber: row.target_address_number,
      estateRank: row.target_estate_rank,
    },
    distanceScore: row.distance_score,
    underProtection: row.under_protection,
    protectionExpiresAt: trimToNull(row.protection_expires_at),
    attackEligibility: {
      canStart: row.can_attack,
      blockReason: trimToNull(row.attack_block_reason),
      travelTimeSeconds: row.attack_travel_time_seconds,
      minTargetLevel: row.attack_min_target_level,
      maxTargetLevel: row.attack_max_target_level,
      attackerHasBlockingActivity: row.attacker_has_blocking_activity,
    },
    spyEligibility: {
      canStart: row.can_spy,
      blockReason: trimToNull(row.spy_block_reason),
      travelTimeSeconds: row.spy_travel_time_seconds,
    },
  };
}

export function mapHeroPvpDailyAttackState(
  row: GetHeroPvpDailyAttackStateRpcRow,
): HeroPvpDailyAttackState {
  return {
    heroId: requiredTrimmedText(row.hero_id, 'heroId', 'PvP read model'),
    serverId: requiredTrimmedText(row.server_id, 'serverId', 'PvP read model'),
    actionDate: requiredTrimmedText(row.action_date, 'actionDate', 'PvP read model'),
    actionKind: requiredTrimmedText(row.action_kind, 'actionKind', 'PvP read model'),
    usedDailyAttacks: row.used_daily_attacks,
    remainingDailyAttacks: row.remaining_daily_attacks,
    dailyAttackLimit: row.daily_attack_limit,
    extraDailyAttacks: row.extra_daily_attacks,
    canStartAttack: row.can_start_attack,
    attackerHasBlockingActivity: row.attacker_has_blocking_activity,
    counterExists: row.counter_exists,
    generatedAt: requiredTrimmedText(row.generated_at, 'generatedAt', 'PvP read model'),
  };
}

export function mapPvpActionStartResult(
  row: StartPvpActionRpcRow,
): PvpActionStartResult {
  return {
    pvpActionId: requiredTrimmedText(row.pvp_action_id, 'pvpActionId', 'PvP read model'),
    runtimeActivityId: trimToNull(row.runtime_activity_id),
    serverId: requiredTrimmedText(row.server_id, 'serverId', 'PvP read model'),
    actionKind: requiredTrimmedText(row.action_kind, 'actionKind', 'PvP read model') as PvpActionKindKey,
    status: requiredTrimmedText(row.status, 'status', 'PvP read model') as PvpActionStatusKey,
    attackerHeroId: requiredTrimmedText(row.attacker_hero_id, 'attackerHeroId', 'PvP read model'),
    attackerEstateId: trimToNull(row.attacker_estate_id),
    targetHeroId: requiredTrimmedText(row.target_hero_id, 'targetHeroId', 'PvP read model'),
    targetEstateId: trimToNull(row.target_estate_id),
    startedAt: requiredTrimmedText(row.started_at, 'startedAt', 'PvP read model'),
    arrivesAt: requiredTrimmedText(row.arrives_at, 'arrivesAt', 'PvP read model'),
    travelTimeSeconds: row.travel_time_seconds,
    attackTravelTimeSeconds: row.attack_travel_time_seconds,
    spyTravelTimeSeconds: row.spy_travel_time_seconds,
    distanceScore: row.distance_score,
    manualFightWindowSeconds: optionalInteger(row.manual_fight_window_seconds),
    manualDeadlineAt: trimToNull(row.manual_deadline_at),
    targetProtectionId: trimToNull(row.target_protection_id),
    targetProtectionSeconds: optionalInteger(row.target_protection_seconds),
  };
}

export function mapPvpSpySettlementResult(
  row: SettleDuePvpSpyActionRpcRow,
): PvpSpySettlementResult {
  return {
    pvpActionId: requiredTrimmedText(row.pvp_action_id, 'pvpActionId', 'PvP spy settlement'),
    pvpSpyResultId: trimToNull(row.pvp_spy_result_id),
    runtimeActivityId: trimToNull(row.runtime_activity_id),
    status: requiredTrimmedText(row.status, 'status', 'PvP spy settlement'),
    settledAsOf: requiredTrimmedText(row.settled_as_of, 'settledAsOf', 'PvP spy settlement'),
  };
}

export function mapPvpSpyGameReportResult(
  row: CreatePvpSpyGameReportRpcRow,
): PvpSpyGameReportResult {
  return {
    gameReportId: requiredTrimmedText(row.game_report_id, 'gameReportId', 'PvP spy report'),
    pvpSpyResultId: requiredTrimmedText(row.pvp_spy_result_id, 'pvpSpyResultId', 'PvP spy report'),
    createdNewReport: row.created_new_report,
    participantsCreated: row.participants_created,
    accessRowsTouched: row.access_rows_touched,
  };
}

export function mapActivePvpActionOffer(
  row: GetActivePvpActionOfferRpcRow,
): ActivePvpActionOffer {
  return {
    pvpActionId: requiredTrimmedText(row.pvp_action_id, 'pvpActionId', 'PvP read model'),
    runtimeActivityId: trimToNull(row.runtime_activity_id),
    serverId: requiredTrimmedText(row.server_id, 'serverId', 'PvP read model'),
    actionKind: requiredTrimmedText(row.action_kind, 'actionKind', 'PvP read model') as PvpActionKindKey,
    actionKindLabel: pvpActionKindDisplayLabel(row.action_kind),
    phase: requiredTrimmedText(row.phase, 'phase', 'PvP read model'),
    phaseLabel: requiredTrimmedText(row.phase_label, 'phaseLabel', 'PvP read model'),
    statusLabel: requiredTrimmedText(row.status_label, 'statusLabel', 'PvP read model'),
    rawStatus: trimToNull(row.raw_status),
    attackerHeroId: trimToNull(row.attacker_hero_id),
    attackerName: trimToNull(row.attacker_name),
    defenderHeroId: trimToNull(row.defender_hero_id),
    defenderName: trimToNull(row.defender_name),
    targetHeroId: trimToNull(row.defender_hero_id),
    targetHeroDisplayName: trimToNull(row.target_name) ?? trimToNull(row.defender_name),
    targetAddressLabel: pvpAddressLabel({
      districtCode: trimToNull(row.target_district_code),
      address: trimToNull(row.target_address),
      addressNumber: optionalInteger(row.target_address_number),
    }),
    targetDistrictCode: trimToNull(row.target_district_code),
    targetAddressNumber: optionalInteger(row.target_address_number),
    attackerAddressLabel: pvpAddressLabel({
      districtCode: optionalRowText(row, 'attacker_district_code'),
      address: optionalRowText(row, 'attacker_address'),
      addressNumber: optionalRowInteger(row, 'attacker_address_number'),
    }),
    startedAt: requiredTrimmedText(row.started_at, 'startedAt', 'PvP read model'),
    arrivesAt: trimToNull(row.arrives_at),
    availableAt: trimToNull(row.available_at),
    expiresAt: trimToNull(row.expires_at),
    resolvedAt: trimToNull(row.resolved_at),
    phaseStartedAt: trimToNull(row.phase_started_at),
    phaseEndsAt: trimToNull(row.phase_ends_at),
    returnStartedAt: trimToNull(row.return_started_at),
    returnAvailableAt: trimToNull(row.return_available_at),
    manualDeadlineAt: trimToNull(row.manual_deadline_at),
    remainingSeconds: optionalInteger(row.remaining_seconds),
    secondsUntilArrival: optionalInteger(row.seconds_until_arrival),
    secondsUntilExpiry: optionalInteger(row.seconds_until_expiry),
    secondsUntilManualDeadline: optionalInteger(row.seconds_until_manual_deadline),
    isBlockingRuntimeActivity: row.is_blocking_runtime_activity,
    isTravelPhase: row.is_travel_phase,
    isManualWindow: row.is_manual_window,
    isResolved: row.is_resolved,
    viewerRole: trimToNull(row.viewer_role),
    viewerIsAttacker: row.viewer_role === 'attacker',
    viewerIsTarget: row.viewer_role === 'defender',
    pvpSpyResultId: optionalRowText(row, 'pvp_spy_result_id'),
    pvpAttackResultId: trimToNull(row.pvp_attack_result_id),
    combatLiveSessionId: trimToNull(row.combat_live_session_id),
    combatResultId: trimToNull(row.combat_result_id),
  };
}

function pvpAddressLabel(input: {
  districtCode: string | null;
  address: string | null;
  addressNumber: number | null;
}): string | null {
  if (input.address) {
    return input.address;
  }

  if (input.districtCode && input.addressNumber !== null) {
    return `${input.districtCode}-${input.addressNumber}`;
  }

  return null;
}

function optionalRowText(row: object, key: string): string | null {
  return key in row
    ? trimToNull((row as Record<string, unknown>)[key])
    : null;
}

function optionalRowInteger(row: object, key: string): number | null {
  return key in row
    ? optionalInteger((row as Record<string, unknown>)[key])
    : null;
}

function pvpActionKindDisplayLabel(actionKind: string): string {
  if (actionKind === 'attack') {
    return 'Atak';
  }

  if (actionKind === 'spy') {
    return 'Szpiegowanie';
  }

  return requiredTrimmedText(actionKind, 'actionKind', 'PvP read model');
}
