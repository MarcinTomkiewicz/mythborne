import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_OUTCOME,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
  CombatResolutionResult,
} from '../domain/combat/combat.model';
import {
  toPersistCombatResultSnapshotRpcArgs,
  toPersistedCombatResultSnapshot,
} from './combat-result-rpc';

describe('combat result RPC mapper', () => {
  it('maps a completed combat result into the canonical snapshot RPC payload', () => {
    const args = toPersistCombatResultSnapshotRpcArgs({
      result: combatResult(),
      reason: ' Sandbox result. ',
      requestId: ' request-1 ',
    });

    expect(args).toEqual(jasmine.objectContaining({
      p_server_id: 'server-1',
      p_source_type: COMBAT_SOURCE_TYPE.sandbox,
      p_source_entity_id: 'sandbox-run-1',
      p_outcome: COMBAT_OUTCOME.initiatorVictory,
      p_turns_completed: 1,
      p_started_at: '2026-05-02T10:00:00.000Z',
      p_completed_at: '2026-05-02T10:01:00.000Z',
      p_reason: 'Sandbox result.',
      p_request_id: 'request-1',
    }));
    expect(args.p_participants_json as unknown).toEqual([
      jasmine.objectContaining({
        side: COMBAT_SIDE.initiator,
        participant_kind: COMBAT_PARTICIPANT_KIND.hero,
        hero_id: 'hero-1',
        display_name: 'Hero',
        health_start: 30,
        health_end: 12,
        max_health: 30,
        defense: 2,
        min_damage: 4,
        max_damage: 6,
        luck: 3,
        critical_chance: 10,
        critical_damage: 50,
        evasion_chance: 5,
        stats: [
          { stat_key: 'strength', stat_value: 11 },
          { stat_key: 'agility', stat_value: 12 },
        ],
      }),
      jasmine.objectContaining({
        side: COMBAT_SIDE.defender,
        participant_kind: COMBAT_PARTICIPANT_KIND.opponent,
        opponent_definition_id: 'opponent-1',
        display_name: 'Opponent',
        stats: [
          { stat_key: 'strength', stat_value: 8 },
        ],
      }),
    ]);
    expect(args.p_attacks_json as unknown).toEqual([
      {
        turn_number: 1,
        attack_order: 1,
        actor_side: COMBAT_SIDE.initiator,
        target_side: COMBAT_SIDE.defender,
        attack_slot_index: 0,
        attack_source_kind: COMBAT_ATTACK_SOURCE_KIND.playerItem,
        attack_source_label: 'Bronze Sword',
        opponent_attack_source_id: null,
        source_item_id: 'item-1',
        source_base_id: 'base-1',
        source_quality_key: 'common',
        source_prefix_affix_id: 'prefix-1',
        source_suffix_affix_id: 'suffix-1',
        timing_hit: true,
        evaded: false,
        critical: true,
        critical_damage: 9,
        rolled_damage: 6,
        final_damage: 9,
        target_health_before: 10,
        target_health_after: 1,
        display_text: 'Hero critically hits Opponent.',
      },
    ]);
  });

  it('requires explicit backend authority for production gameplay source types', () => {
    expect(() => toPersistCombatResultSnapshotRpcArgs({
      result: combatResult({ sourceType: COMBAT_SOURCE_TYPE.trial }),
    })).toThrowError(
      'Combat result source "trial" requires an explicit backend validation/finalization authority boundary before snapshot persistence.',
    );

    expect(() => toPersistCombatResultSnapshotRpcArgs({
      result: combatResult({ sourceType: COMBAT_SOURCE_TYPE.trial }),
      authority: 'backend_validated',
    })).not.toThrow();
  });

  it('maps the RPC return row into a stable domain result', () => {
    expect(toPersistedCombatResultSnapshot({
      combat_result_id: 'combat-result-1',
      server_id: 'server-1',
      source_type: COMBAT_SOURCE_TYPE.sandbox,
      source_entity_id: '',
      outcome: COMBAT_OUTCOME.draw,
      participants_created: 2,
      participant_stats_created: 5,
      attacks_created: 4,
      audit_log_id: 'audit-1',
    })).toEqual({
      combatResultId: 'combat-result-1',
      serverId: 'server-1',
      sourceType: COMBAT_SOURCE_TYPE.sandbox,
      sourceEntityId: null,
      outcome: COMBAT_OUTCOME.draw,
      participantsCreated: 2,
      participantStatsCreated: 5,
      attacksCreated: 4,
      auditLogId: 'audit-1',
    });
  });
});

function combatResult(overrides: {
  sourceType?: CombatResolutionResult['source']['sourceType'];
} = {}): CombatResolutionResult {
  return {
    source: {
      sourceType: overrides.sourceType ?? COMBAT_SOURCE_TYPE.sandbox,
      sourceEntityId: 'sandbox-run-1',
      serverId: 'server-1',
      startedAt: '2026-05-02T10:00:00.000Z',
      completedAt: '2026-05-02T10:01:00.000Z',
    },
    outcome: COMBAT_OUTCOME.initiatorVictory,
    winnerSide: COMBAT_SIDE.initiator,
    loserSide: COMBAT_SIDE.defender,
    turnsCompleted: 1,
    initiatorHeroId: 'hero-1',
    defenderHeroId: null,
    participants: [
      {
        side: COMBAT_SIDE.initiator,
        displayName: 'Hero',
        level: 3,
        reference: {
          participantKind: COMBAT_PARTICIPANT_KIND.hero,
          heroId: 'hero-1',
          opponentDefinitionId: null,
        },
        stats: {
          maxHealth: 30,
          defense: 2,
          minDamage: 4,
          maxDamage: 6,
          luck: 3,
          criticalChance: 10,
          criticalDamage: 50,
          evasionChance: 5,
        },
        healthStart: 30,
        healthEnd: 12,
      },
      {
        side: COMBAT_SIDE.defender,
        displayName: 'Opponent',
        level: 2,
        reference: {
          participantKind: COMBAT_PARTICIPANT_KIND.opponent,
          heroId: null,
          opponentDefinitionId: 'opponent-1',
        },
        stats: {
          maxHealth: 10,
          defense: 1,
          minDamage: 2,
          maxDamage: 4,
          luck: 0,
          criticalChance: 0,
          criticalDamage: 50,
          evasionChance: 0,
        },
        healthStart: 10,
        healthEnd: 1,
      },
    ],
    participantStats: [
      { side: COMBAT_SIDE.initiator, statKey: 'strength', statValue: 11 },
      { side: COMBAT_SIDE.initiator, statKey: 'agility', statValue: 12 },
      { side: COMBAT_SIDE.defender, statKey: 'strength', statValue: 8 },
    ],
    attacks: [
      {
        turnNumber: 1,
        attackOrder: 1,
        actorSide: COMBAT_SIDE.initiator,
        targetSide: COMBAT_SIDE.defender,
        attackSlotIndex: 0,
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.playerItem,
          label: 'Bronze Sword',
          opponentAttackSourceId: null,
          sourceItemId: 'item-1',
          sourceBaseId: 'base-1',
          sourceQualityKey: 'common',
          sourcePrefixAffixId: 'prefix-1',
          sourceSuffixAffixId: 'suffix-1',
        },
        timingHit: true,
        evaded: false,
        critical: true,
        rolledDamage: 6,
        criticalDamage: 9,
        finalDamage: 9,
        targetHealthBefore: 10,
        targetHealthAfter: 1,
        displayText: 'Hero critically hits Opponent.',
      },
    ],
  };
}
