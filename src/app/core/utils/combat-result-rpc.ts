import {
  COMBAT_SOURCE_TYPE,
  CombatAttackEvent,
  CombatParticipantSnapshot,
  CombatParticipantStatSnapshot,
  CombatResolutionResult,
  CombatSourceType,
} from '../domain/combat/combat.model';
import {
  CombatResultPersistenceAuthority,
  PersistCombatResultSnapshotInput,
  PersistedCombatResultSnapshot,
} from '../domain/combat/combat-result-snapshot.model';
import { Json } from '../types/database.types';
import {
  PersistCombatResultSnapshotRpcArgs,
  PersistCombatResultSnapshotRpcRow,
} from '../types/combat-result-rpc.types';
import { trimToNull } from './normalize-text';

const FRONTEND_CORE_ALLOWED_SOURCE_TYPES: readonly CombatSourceType[] = [
  COMBAT_SOURCE_TYPE.sandbox,
  COMBAT_SOURCE_TYPE.adminTest,
];

export function toPersistCombatResultSnapshotRpcArgs(
  input: PersistCombatResultSnapshotInput,
): PersistCombatResultSnapshotRpcArgs {
  assertPersistenceAuthority(input.result.source.sourceType, input.authority);

  return {
    p_server_id: input.result.source.serverId,
    p_source_type: input.result.source.sourceType,
    p_source_entity_id: trimToNull(input.result.source.sourceEntityId) ?? undefined,
    p_outcome: input.result.outcome,
    p_turns_completed: input.result.turnsCompleted,
    p_participants_json: participantRows(input.result) as Json,
    p_attacks_json: attackRows(input.result.attacks) as Json,
    p_started_at: input.result.source.startedAt ?? undefined,
    p_completed_at: input.result.source.completedAt,
    p_reason: trimToNull(input.reason) ?? undefined,
    p_request_id: trimToNull(input.requestId) ?? undefined,
  };
}

export function toPersistedCombatResultSnapshot(
  row: PersistCombatResultSnapshotRpcRow,
): PersistedCombatResultSnapshot {
  return {
    combatResultId: row.combat_result_id,
    serverId: row.server_id,
    sourceType: row.source_type,
    sourceEntityId: trimToNull(row.source_entity_id),
    outcome: row.outcome,
    participantsCreated: row.participants_created,
    participantStatsCreated: row.participant_stats_created,
    attacksCreated: row.attacks_created,
    auditLogId: row.audit_log_id,
  };
}

function assertPersistenceAuthority(
  sourceType: CombatSourceType,
  authority: CombatResultPersistenceAuthority | undefined,
): void {
  if (FRONTEND_CORE_ALLOWED_SOURCE_TYPES.includes(sourceType)) {
    return;
  }

  if (authority === 'backend_authoritative' || authority === 'backend_validated') {
    return;
  }

  throw new Error(
    `Combat result source "${sourceType}" requires an explicit backend validation/finalization authority boundary before snapshot persistence.`,
  );
}

function participantRows(result: CombatResolutionResult) {
  return result.participants.map((participant) => ({
    side: participant.side,
    participant_kind: participant.reference.participantKind,
    hero_id: participant.reference.heroId,
    opponent_definition_id: participant.reference.opponentDefinitionId,
    display_name: participant.displayName,
    level: participant.level,
    health_start: participant.healthStart,
    health_end: participant.healthEnd,
    max_health: participant.stats.maxHealth,
    defense: participant.stats.defense,
    min_damage: participant.stats.minDamage,
    max_damage: participant.stats.maxDamage,
    luck: participant.stats.luck,
    critical_chance: participant.stats.criticalChance,
    critical_damage: participant.stats.criticalDamage,
    evasion_chance: participant.stats.evasionChance,
    stats: statRowsForParticipant(participant, result.participantStats),
  }));
}

function statRowsForParticipant(
  participant: CombatParticipantSnapshot,
  stats: readonly CombatParticipantStatSnapshot[],
) {
  return stats
    .filter((stat) => stat.side === participant.side)
    .map((stat) => ({
      stat_key: stat.statKey,
      stat_value: stat.statValue,
    }));
}

function attackRows(attacks: readonly CombatAttackEvent[]) {
  return attacks.map((attack) => ({
    turn_number: attack.turnNumber,
    attack_order: attack.attackOrder,
    actor_side: attack.actorSide,
    target_side: attack.targetSide,
    attack_slot_index: attack.attackSlotIndex,
    attack_source_kind: attack.source.kind,
    attack_source_label: attack.source.label,
    opponent_attack_source_id: attack.source.opponentAttackSourceId,
    source_item_id: attack.source.sourceItemId,
    source_base_id: attack.source.sourceBaseId,
    source_quality_key: attack.source.sourceQualityKey,
    source_prefix_affix_id: attack.source.sourcePrefixAffixId,
    source_suffix_affix_id: attack.source.sourceSuffixAffixId,
    timing_hit: attack.timingHit,
    evaded: attack.evaded,
    critical: attack.critical,
    critical_damage: attack.criticalDamage,
    rolled_damage: attack.rolledDamage,
    final_damage: attack.finalDamage,
    target_health_before: attack.targetHealthBefore,
    target_health_after: attack.targetHealthAfter,
    display_text: attack.displayText,
  }));
}
