import {
  AdminPvpAttackResult,
  AdminPvpRuntimeActivitySummary,
  AdminPvpSpyResult,
  PvpActionKindEntry,
  PvpActionStartResult,
  PvpActionStatusEntry,
  PvpAttackOutcomeEntry,
  PvpAttackResult,
  PvpRuntimeActivitySummary,
  PvpSpyResult,
  PvpTargetCandidate,
} from '../domain/pvp/pvp.model';
import { Json } from '../types/database.types';
import {
  GetMyPvpAttackResultRpcRow,
  GetMyPvpSpyResultRpcRow,
  GetPvpTargetCandidatesRpcRow,
  PvpActionKindKey,
  PvpActionKindRow,
  PvpActionRow,
  PvpActionStatusKey,
  PvpActionStatusRow,
  PvpAttackOutcomeKey,
  PvpAttackOutcomeKindRow,
  PvpAttackResultRow,
  PvpSpyResultRow,
  StartPvpActionRpcRow,
} from '../types/pvp-rpc.types';

export function mapPvpActionKind(row: PvpActionKindRow): PvpActionKindEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: nullableText(row.helper_text),
    adminDescription: nullableText(row.admin_description),
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
    helperText: nullableText(row.helper_text),
    adminDescription: nullableText(row.admin_description),
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isBlocking: row.is_blocking,
    isTerminal: row.is_terminal,
  };
}

export function mapPvpAttackOutcomeKind(
  row: PvpAttackOutcomeKindRow,
): PvpAttackOutcomeEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: nullableText(row.helper_text),
    adminDescription: nullableText(row.admin_description),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapPvpTargetCandidate(
  row: GetPvpTargetCandidatesRpcRow,
): PvpTargetCandidate {
  return {
    targetHeroId: requiredText(row.target_hero_id, 'targetHeroId'),
    targetDisplayName: requiredText(row.target_display_name, 'targetDisplayName'),
    targetLevel: row.target_level,
    targetAddress: {
      estateId: requiredText(row.target_estate_id, 'targetEstateId'),
      districtCode: requiredText(row.target_district_code, 'targetDistrictCode'),
      address: requiredText(row.target_address, 'targetAddress'),
      addressNumber: row.target_address_number,
      estateRank: row.target_estate_rank,
    },
    distanceScore: row.distance_score,
    underProtection: row.under_protection,
    protectionExpiresAt: nullableText(row.protection_expires_at),
    attackEligibility: {
      canStart: row.can_attack,
      blockReason: nullableText(row.attack_block_reason),
      travelTimeSeconds: row.attack_travel_time_seconds,
      minTargetLevel: row.attack_min_target_level,
      maxTargetLevel: row.attack_max_target_level,
      attackerHasBlockingActivity: row.attacker_has_blocking_activity,
    },
    spyEligibility: {
      canStart: row.can_spy,
      blockReason: nullableText(row.spy_block_reason),
      travelTimeSeconds: row.spy_travel_time_seconds,
    },
  };
}

export function mapPvpActionStartResult(
  row: StartPvpActionRpcRow,
): PvpActionStartResult {
  return {
    pvpActionId: requiredText(row.pvp_action_id, 'pvpActionId'),
    runtimeActivityId: nullableText(row.runtime_activity_id),
    serverId: requiredText(row.server_id, 'serverId'),
    actionKind: requiredText(row.action_kind, 'actionKind') as PvpActionKindKey,
    status: requiredText(row.status, 'status') as PvpActionStatusKey,
    attackerHeroId: requiredText(row.attacker_hero_id, 'attackerHeroId'),
    attackerEstateId: nullableText(row.attacker_estate_id),
    targetHeroId: requiredText(row.target_hero_id, 'targetHeroId'),
    targetEstateId: nullableText(row.target_estate_id),
    startedAt: requiredText(row.started_at, 'startedAt'),
    arrivesAt: requiredText(row.arrives_at, 'arrivesAt'),
    travelTimeSeconds: row.travel_time_seconds,
    attackTravelTimeSeconds: row.attack_travel_time_seconds,
    spyTravelTimeSeconds: row.spy_travel_time_seconds,
    distanceScore: row.distance_score,
    manualFightWindowSeconds: nullableNumber(row.manual_fight_window_seconds),
    manualDeadlineAt: nullableText(row.manual_deadline_at),
    targetProtectionId: nullableText(row.target_protection_id),
    targetProtectionSeconds: nullableNumber(row.target_protection_seconds),
  };
}

export function mapPvpRuntimeActivitySummary(
  row: PvpActionRow,
): PvpRuntimeActivitySummary {
  return {
    pvpActionId: requiredText(row.id, 'pvpActionId'),
    runtimeActivityId: nullableText(row.runtime_activity_id),
    actionKind: requiredText(row.action_kind, 'actionKind') as PvpActionKindKey,
    status: requiredText(row.status, 'status') as PvpActionStatusKey,
    targetHeroId: requiredText(row.target_hero_id, 'targetHeroId'),
    targetLevelSnapshot: row.target_level_snapshot,
    targetAddress: {
      estateId: nullableText(row.target_estate_id),
      districtCode: nullableText(row.target_district_code_snapshot),
      addressNumber: nullableNumber(row.target_address_number_snapshot),
    },
    startedAt: requiredText(row.started_at, 'startedAt'),
    arrivesAt: requiredText(row.arrives_at, 'arrivesAt'),
    resolvedAt: nullableText(row.resolved_at),
    travelTimeSeconds: row.travel_time_seconds,
    manualDeadlineAt: nullableText(row.manual_deadline_at),
  };
}

export function mapAdminPvpRuntimeActivitySummary(
  row: PvpActionRow,
): AdminPvpRuntimeActivitySummary {
  return {
    ...mapPvpRuntimeActivitySummary(row),
    serverId: requiredText(row.server_id, 'serverId'),
    attackerHeroId: requiredText(row.attacker_hero_id, 'attackerHeroId'),
    attackerLevelSnapshot: row.attacker_level_snapshot,
    attackerAddress: {
      estateId: nullableText(row.attacker_estate_id),
      districtCode: nullableText(row.attacker_district_code_snapshot),
      addressNumber: nullableNumber(row.attacker_address_number_snapshot),
    },
    attackTravelTimeSeconds: row.attack_travel_time_seconds,
    spyTravelTimeSeconds: row.spy_travel_time_seconds,
    targetProtectionId: nullableText(row.target_protection_id),
    targetProtectionSeconds: nullableNumber(row.target_protection_seconds),
    reason: nullableText(row.reason),
    requestId: nullableText(row.request_id),
    metadataJson: jsonValue(row.metadata_json),
  };
}

export function mapPvpSpyResult(row: GetMyPvpSpyResultRpcRow): PvpSpyResult {
  return mapPvpSpyResultBase({
    spyResultId: row.spy_result_id,
    pvpActionId: row.pvp_action_id,
    serverId: row.server_id,
    createdAt: row.created_at,
    spyHeroId: row.spy_hero_id,
    spyLevelSnapshot: row.spy_level_snapshot,
    targetHeroId: row.target_hero_id,
    targetDisplayName: row.target_display_name_snapshot,
    targetLevelSnapshot: row.target_level_snapshot,
    targetAddress: row.target_address_snapshot,
    visibilityKey: row.visibility_key,
    resultSummary: row.result_summary,
    estateSnapshotJson: row.estate_snapshot_json,
    buildingsSnapshotJson: row.buildings_snapshot_json,
    resourcesSnapshotJson: row.resources_snapshot_json,
    equipmentSnapshotJson: row.equipment_snapshot_json,
    baseStatsSnapshotJson: row.base_stats_snapshot_json,
    derivedCombatStatsJson: row.derived_combat_stats_json,
  });
}

export function mapAdminPvpSpyResult(row: PvpSpyResultRow): AdminPvpSpyResult {
  return {
    ...mapPvpSpyResultBase({
      spyResultId: row.id,
      pvpActionId: row.pvp_action_id,
      serverId: row.server_id,
      createdAt: row.created_at,
      spyHeroId: row.spy_hero_id,
      spyLevelSnapshot: row.spy_level_snapshot,
      targetHeroId: row.target_hero_id,
      targetDisplayName: row.target_display_name_snapshot,
      targetLevelSnapshot: row.target_level_snapshot,
      targetAddress: row.target_address_snapshot,
      visibilityKey: row.visibility_key,
      resultSummary: row.result_summary,
      estateSnapshotJson: row.estate_snapshot_json,
      buildingsSnapshotJson: row.buildings_snapshot_json,
      resourcesSnapshotJson: row.resources_snapshot_json,
      equipmentSnapshotJson: row.equipment_snapshot_json,
      baseStatsSnapshotJson: row.base_stats_snapshot_json,
      derivedCombatStatsJson: row.derived_combat_stats_json,
    }),
    metadataJson: jsonValue(row.metadata_json),
    targetEstateId: nullableText(row.target_estate_id),
  };
}

export function mapPvpAttackResult(
  row: GetMyPvpAttackResultRpcRow,
): PvpAttackResult {
  return mapPvpAttackResultBase({
    attackResultId: row.attack_result_id,
    pvpActionId: row.pvp_action_id,
    serverId: row.server_id,
    createdAt: row.created_at,
    attackerHeroId: row.attacker_hero_id,
    attackerLevelSnapshot: row.attacker_level_snapshot,
    defenderHeroId: row.defender_hero_id,
    defenderLevelSnapshot: row.defender_level_snapshot,
    combatResultId: row.combat_result_id,
    combatOutcome: row.combat_outcome,
    outcomeKey: row.outcome_key,
    outcomeLabel: row.outcome_label,
    winnerHeroId: row.winner_hero_id,
    loserHeroId: row.loser_hero_id,
    levelDifference: row.level_difference,
    resourceOutcomeJson: row.resource_outcome_json,
    rewardContextJson: row.reward_context_json,
    prestigeContextJson: row.prestige_context_json,
    reportContextJson: row.report_context_json,
    notificationContextJson: row.notification_context_json,
  });
}

export function mapAdminPvpAttackResult(
  row: PvpAttackResultRow,
  outcomeLabel = row.outcome_key,
): AdminPvpAttackResult {
  return {
    ...mapPvpAttackResultBase({
      attackResultId: row.id,
      pvpActionId: row.pvp_action_id,
      serverId: row.server_id,
      createdAt: row.created_at,
      attackerHeroId: row.attacker_hero_id,
      attackerLevelSnapshot: row.attacker_level_snapshot,
      defenderHeroId: row.defender_hero_id,
      defenderLevelSnapshot: row.defender_level_snapshot,
      combatResultId: row.combat_result_id,
      combatOutcome: row.combat_outcome,
      outcomeKey: row.outcome_key,
      outcomeLabel,
      winnerHeroId: row.winner_hero_id,
      loserHeroId: row.loser_hero_id,
      levelDifference: row.level_difference,
      resourceOutcomeJson: row.resource_outcome_json,
      rewardContextJson: row.reward_context_json,
      prestigeContextJson: row.prestige_context_json,
      reportContextJson: row.report_context_json,
      notificationContextJson: row.notification_context_json,
    }),
    metadataJson: jsonValue(row.metadata_json),
    attackerEstateId: nullableText(row.attacker_estate_id),
    defenderEstateId: nullableText(row.defender_estate_id),
  };
}

function mapPvpSpyResultBase(input: {
  spyResultId: string | null | undefined;
  pvpActionId: string | null | undefined;
  serverId: string | null | undefined;
  createdAt: string | null | undefined;
  spyHeroId: string | null | undefined;
  spyLevelSnapshot: number;
  targetHeroId: string | null | undefined;
  targetDisplayName: string | null | undefined;
  targetLevelSnapshot: number;
  targetAddress: string | null | undefined;
  visibilityKey: string | null | undefined;
  resultSummary: string | null | undefined;
  estateSnapshotJson: Json;
  buildingsSnapshotJson: Json;
  resourcesSnapshotJson: Json;
  equipmentSnapshotJson: Json;
  baseStatsSnapshotJson: Json;
  derivedCombatStatsJson: Json;
}): PvpSpyResult {
  return {
    spyResultId: requiredText(input.spyResultId, 'spyResultId'),
    pvpActionId: requiredText(input.pvpActionId, 'pvpActionId'),
    serverId: requiredText(input.serverId, 'serverId'),
    createdAt: requiredText(input.createdAt, 'createdAt'),
    spyHeroId: requiredText(input.spyHeroId, 'spyHeroId'),
    spyLevelSnapshot: input.spyLevelSnapshot,
    targetHeroId: requiredText(input.targetHeroId, 'targetHeroId'),
    targetDisplayName: requiredText(input.targetDisplayName, 'targetDisplayName'),
    targetLevelSnapshot: input.targetLevelSnapshot,
    targetAddress: nullableText(input.targetAddress),
    visibilityKey: requiredText(input.visibilityKey, 'visibilityKey'),
    resultSummary: nullableText(input.resultSummary),
    snapshots: {
      estate: jsonValue(input.estateSnapshotJson),
      buildings: jsonValue(input.buildingsSnapshotJson),
      resources: jsonValue(input.resourcesSnapshotJson),
      equipment: jsonValue(input.equipmentSnapshotJson),
      baseStats: jsonValue(input.baseStatsSnapshotJson),
      derivedCombatStats: jsonValue(input.derivedCombatStatsJson),
    },
  };
}

function mapPvpAttackResultBase(input: {
  attackResultId: string | null | undefined;
  pvpActionId: string | null | undefined;
  serverId: string | null | undefined;
  createdAt: string | null | undefined;
  attackerHeroId: string | null | undefined;
  attackerLevelSnapshot: number;
  defenderHeroId: string | null | undefined;
  defenderLevelSnapshot: number;
  combatResultId: string | null | undefined;
  combatOutcome: PvpAttackResult['combatOutcome'];
  outcomeKey: string | null | undefined;
  outcomeLabel: string | null | undefined;
  winnerHeroId: string | null | undefined;
  loserHeroId: string | null | undefined;
  levelDifference: number;
  resourceOutcomeJson: Json;
  rewardContextJson: Json;
  prestigeContextJson: Json;
  reportContextJson: Json;
  notificationContextJson: Json;
}): PvpAttackResult {
  return {
    attackResultId: requiredText(input.attackResultId, 'attackResultId'),
    pvpActionId: requiredText(input.pvpActionId, 'pvpActionId'),
    serverId: requiredText(input.serverId, 'serverId'),
    createdAt: requiredText(input.createdAt, 'createdAt'),
    attacker: {
      heroId: requiredText(input.attackerHeroId, 'attackerHeroId'),
      levelSnapshot: input.attackerLevelSnapshot,
    },
    defender: {
      heroId: requiredText(input.defenderHeroId, 'defenderHeroId'),
      levelSnapshot: input.defenderLevelSnapshot,
    },
    combatResultId: requiredText(input.combatResultId, 'combatResultId'),
    combatOutcome: input.combatOutcome,
    outcomeKey: requiredText(input.outcomeKey, 'outcomeKey') as PvpAttackOutcomeKey,
    outcomeLabel: requiredText(input.outcomeLabel, 'outcomeLabel'),
    winnerHeroId: nullableText(input.winnerHeroId),
    loserHeroId: nullableText(input.loserHeroId),
    levelDifference: input.levelDifference,
    resourceOutcome: { raw: jsonValue(input.resourceOutcomeJson) },
    rewardContext: { raw: jsonValue(input.rewardContextJson) },
    prestigeContext: jsonValue(input.prestigeContextJson),
    reportContext: { raw: jsonValue(input.reportContextJson) },
    notificationContext: { raw: jsonValue(input.notificationContextJson) },
  };
}

function jsonValue(value: Json | null | undefined): Json {
  return value ?? {};
}

function nullableNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = nullableText(value);

  if (!normalized) {
    throw new Error(`${field} must be a non-empty PvP field.`);
  }

  return normalized;
}

function nullableText(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
