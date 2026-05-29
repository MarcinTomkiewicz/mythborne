import {
  mapCombatLiveState,
  mapCombatAutoResolveResult,
  mapCombatResultDetail,
  mergeCombatLiveEvents,
  toFinalizeCombatSourceResultRpcArgs,
  toSubmitCombatPlayerActionRpcArgs,
} from './combat-live-mappers';
import {
  FinalizeCombatSourceResultRpcRow,
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcRow,
} from '../types/combat-live-rpc.types';
import { Json } from '../types/database.types';

describe('combat live mappers', () => {
  it('maps DB live state rows without calculating combat authority fields', () => {
    const state = mapCombatLiveState(liveStateRow());

    expect(state.sessionId).toBe('session-1');
    expect(state.statusKey).toBe('awaiting_player');
    expect(state.awaitingPlayerAction).toBeTrue();
    expect(state.currentTimingManifest).toEqual(jasmine.objectContaining({
      manifestId: 'manifest-1',
      actorParticipantId: 'participant-hero',
      targetParticipantId: 'participant-opponent',
      greenZonePercent: 50,
      zoneStartPercent: 25,
      zoneEndPercent: 75,
      zoneWidthPercent: 50,
      speed: 1,
      speedMultiplier: 1,
      streakBefore: 0,
    }));
    expect(state.participants[0]).toEqual(jasmine.objectContaining({
      displayName: 'Hero',
      currentHp: 44,
      maxHp: 50,
    }));
    expect(state.events.map((event) => event.eventIndex)).toEqual([1, 2]);
  });

  it('keeps submit payload limited to timing input', () => {
    const args = toSubmitCombatPlayerActionRpcArgs({
      sessionId: 'session-1',
      timingInput: { positionPercent: 120 },
      requestId: 'request-1',
    });

    expect(Object.keys(args).sort()).toEqual([
      'p_request_id',
      'p_session_id',
      'p_timing_input_json',
    ]);
    expect(args.p_timing_input_json as unknown).toEqual({ positionPercent: 100 });
    expect(JSON.stringify(args)).not.toContain('stats');
    expect(JSON.stringify(args)).not.toContain('equipment');
    expect(JSON.stringify(args)).not.toContain('luck');
    expect(JSON.stringify(args)).not.toContain('damage');
    expect(JSON.stringify(args)).not.toContain('outcome');
    expect(JSON.stringify(args)).not.toContain('reward');
  });

  it('maps manual combat finalization to the canonical source-result RPC args', () => {
    const args = toFinalizeCombatSourceResultRpcArgs({
      sessionId: 'session-1',
      requestId: 'request-1',
      resolutionMode: 'manual',
    });

    expect(args).toEqual({
      p_session_id: 'session-1',
      p_request_id: 'request-1',
      p_resolution_mode: 'manual',
    });
  });

  it('maps DB participant healthCurrent and healthMax fields', () => {
    const state = mapCombatLiveState(liveStateRow({
      participants_json: [
        {
          participantId: 'participant-hero',
          displayName: 'Hero',
          healthCurrent: 37,
          healthMax: 50,
        },
      ],
    }));

    expect(state.participants[0]).toEqual(jasmine.objectContaining({
      currentHp: 37,
      maxHp: 50,
    }));
  });

  it('rejects broad legacy participant and event aliases', () => {
    const state = mapCombatLiveState(liveStateRow({
      participants_json: [
        {
          id: 'legacy-participant',
          name: 'Legacy participant',
          hp: 12,
          maxHealth: 20,
        },
        {
          participantId: 'participant-hero',
          displayName: 'Hero',
          healthCurrent: 37,
          healthMax: 50,
        },
      ],
      events_json: [
        {
          index: 1,
          message: 'Legacy event',
          summary: 'Legacy details',
        },
        eventRow(2),
      ],
    }));

    expect(state.participants.length).toBe(1);
    expect(state.participants[0]).toEqual(jasmine.objectContaining({
      participantId: 'participant-hero',
      currentHp: 37,
      maxHp: 50,
    }));
    expect(state.events.map((event) => event.eventIndex)).toEqual([2]);
  });

  it('maps the current DB timing manifest contract with centered render zone', () => {
    const state = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: dbTimingManifest(),
    }));

    expect(state.currentTimingManifest).toEqual(jasmine.objectContaining({
      manifestId: 'manifest-1',
      actorParticipantId: 'participant-hero',
      targetParticipantId: 'participant-opponent',
      greenZonePercent: 50,
      hitChancePercent: 50,
      speedMultiplier: 1,
      streakBefore: 0,
      roundNumber: 1,
      actionIndex: 0,
      attackIndex: 1,
      requiresManualInput: true,
      isPlayerControlled: true,
      zoneStartPercent: 25,
      zoneEndPercent: 75,
      zoneWidthPercent: 50,
      speed: 1,
    }));
  });

  it('preserves DB-owned combat Luck RNG context from the timing manifest', () => {
    const state = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: {
        ...dbTimingManifestRecord(),
        combatLuck: {
          attackerLuck: 18,
          attackerLuckInfluence: 6,
          defenderLuck: 9,
          defenderLuckInfluence: 3,
          hitGreenZone: 42,
          hitChancePercent: 42,
          evasionChance: 14,
          criticalChance: 11,
          critMultiplier: 1.55,
          criticalDamage: 31,
          finalDamage: 24,
          formulaContext: { formulaKey: 'combat_critical_chance' },
          explanation: 'DB combat Luck context.',
        },
      } as Json,
    }));

    const rng = state.currentTimingManifest?.luckRng;

    expect(rng?.attackerLuck).toBe(18);
    expect(rng?.attackerLuckInfluence).toBe(6);
    expect(rng?.defenderLuckInfluence).toBe(3);
    expect(rng?.hitGreenZone).toBe(42);
    expect(rng?.hitChance).toBe(42);
    expect(rng?.evasionChance).toBe(14);
    expect(rng?.criticalChance).toBe(11);
    expect(rng?.criticalMultiplier).toBe(1.55);
    expect(rng?.criticalDamage).toBe(31);
    expect(rng?.finalDamage).toBe(24);
    expect(rng?.explanation).toBe('DB combat Luck context.');
    expect((rng?.formulaContextJson as Record<string, unknown>)['formulaKey'])
      .toBe('combat_critical_chance');
  });

  it('maps combat Luck RNG only from explicit combat Luck containers', () => {
    const broadRngState = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: {
        ...dbTimingManifestRecord(),
        rng: {
          attackerLuck: 99,
          explanation: 'Broad RNG should not be consumed.',
        },
      } as Json,
    }));
    const snakeLuckState = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: {
        ...dbTimingManifestRecord(),
        luck_rng: {
          attacker_luck: 18,
          explanation: 'DB snake combat Luck context.',
        },
      } as Json,
    }));

    expect(broadRngState.currentTimingManifest?.luckRng).toBeNull();
    expect(snakeLuckState.currentTimingManifest?.luckRng?.attackerLuck).toBe(18);
    expect(snakeLuckState.currentTimingManifest?.luckRng?.explanation)
      .toBe('DB snake combat Luck context.');
  });

  it('rejects invalid DB timing manifests without falling back to legacy aliases', () => {
    const missingManifestId = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: {
        ...dbTimingManifestRecord(),
        manifestId: undefined,
      } as Json,
    }));
    const legacyOnly = mapCombatLiveState(liveStateRow({
      current_timing_manifest_json: {
        zoneStartPercent: 30,
        zoneEndPercent: 70,
        speed: 1.5,
      },
    }));

    expect(missingManifestId.currentTimingManifest).toBeNull();
    expect(legacyOnly.currentTimingManifest).toBeNull();
  });

  it('merges live event deltas by event index to avoid retry duplication', () => {
    const previous = mapCombatLiveState(liveStateRow());
    const next = mapCombatLiveState(liveStateRow({
      event_count: 3,
      events_json: [
        eventRow(2, { label: 'Event 2 retry' }),
        eventRow(3),
      ],
    }));

    const merged = mergeCombatLiveEvents(previous, next);

    expect(merged.events.map((event) => event.eventIndex)).toEqual([1, 2, 3]);
    expect(merged.events.find((event) => event.eventIndex === 2)?.label)
      .toBe('Event 2 retry');
  });

  it('maps durable combat result detail returned by DB', () => {
    const detail = mapCombatResultDetail(resultDetailRow());

    expect(detail.combatResultId).toBe('combat-result-1');
    expect(detail.outcome).toBe('initiator_victory');
    expect(detail.turnsCompleted).toBe(2);
    expect(detail.participants as unknown).toEqual([]);
    expect(detail.attacks as unknown).toEqual([]);
  });

  it('maps finalized combat source result with report handoff reference', () => {
    const result = mapCombatAutoResolveResult(finalizeCombatSourceResultRow());

    expect(result).toEqual({
      sourceEntityId: 'pvp-action-1',
      combatResultId: 'combat-result-1',
      sourceResultId: 'pvp-attack-result-1',
      gameReportId: 'report-1',
      rewardGrantId: 'reward-grant-1',
    });
  });
});

function liveStateRow(
  patch: Partial<GetCombatLiveStateRpcRow> = {},
): GetCombatLiveStateRpcRow {
  return {
    awaiting_player_action: true,
    combat_session_id: 'session-1',
    current_action_index: 1,
    current_actor_participant_id: 'participant-hero',
    current_round_number: 1,
    current_timing_manifest_json: dbTimingManifest(),
    event_count: 2,
    events_json: [eventRow(2), eventRow(1)],
    final_combat_result_id: null as unknown as string,
    participants_json: [
      {
        participantId: 'participant-hero',
        displayName: 'Hero',
        side: 'initiator',
        statusKey: 'active',
        healthCurrent: 44,
        healthMax: 50,
        heroId: 'hero-1',
      },
      {
        participantId: 'participant-opponent',
        displayName: 'Opponent',
        side: 'defender',
        statusKey: 'active',
        healthCurrent: 20,
        healthMax: 30,
      },
    ],
    round_order_json: [],
    server_id: 'server-1',
    source_entity_id: 'challenge-1',
    source_entity_type: 'hero_exploration_challenge_attempt',
    source_type: 'trial',
    status_key: 'awaiting_player',
    status_label: 'Awaiting player',
    updated_at: '2026-05-06T10:00:00.000Z',
    ...patch,
  };
}

function dbTimingManifest(): Json {
  return dbTimingManifestRecord() as Json;
}

function dbTimingManifestRecord(): Record<string, unknown> {
  return {
    manifestId: 'manifest-1',
    actorParticipantId: 'participant-hero',
    targetParticipantId: 'participant-opponent',
    greenZonePercent: 50,
    hitChancePercent: 50,
    speedMultiplier: 1,
    streakBefore: 0,
    roundNumber: 1,
    actionIndex: 0,
    attackIndex: 1,
    requiresManualInput: true,
    isPlayerControlled: true,
  };
}

function eventRow(index: number, patch: Record<string, unknown> = {}): Json {
  return {
    eventIndex: index,
    eventKind: 'player_action_requested',
    label: `Event ${index}`,
    actorParticipantId: 'participant-hero',
    targetParticipantId: 'participant-opponent',
    roundNumber: 1,
    actionIndex: index,
    happenedAt: '2026-05-06T10:00:00.000Z',
    details: [`Detail ${index}`],
    ...patch,
  } as Json;
}

function resultDetailRow(
  patch: Partial<GetCombatResultDetailRpcRow> = {},
): GetCombatResultDetailRpcRow {
  return {
    attacks_json: [],
    combat_result_id: 'combat-result-1',
    completed_at: '2026-05-06T10:01:00.000Z',
    created_at: '2026-05-06T10:01:00.000Z',
    defender_hero_id: 'defender-hero-1',
    initiator_hero_id: 'hero-1',
    loser_side: 'defender',
    outcome: 'initiator_victory',
    participants_json: [],
    server_id: 'server-1',
    source_entity_id: 'challenge-1',
    source_type: 'trial',
    started_at: '2026-05-06T10:00:00.000Z',
    turns_completed: 2,
    winner_side: 'initiator',
    ...patch,
  };
}

function finalizeCombatSourceResultRow(
  patch: Partial<FinalizeCombatSourceResultRpcRow> = {},
): FinalizeCombatSourceResultRpcRow {
  return {
    attacks_created: 2,
    combat_result_id: 'combat-result-1',
    combat_session_id: 'session-1',
    completion_mode: 'manual',
    exploration_status: 'unchanged',
    final_event_count: 4,
    game_report_id: 'report-1',
    outcome: 'initiator_victory',
    outcome_key: 'initiator_victory',
    participant_stats_created: 2,
    participants_created: 2,
    remaining_trials: 0,
    report_attacks_count: 2,
    reward_grant_id: 'reward-grant-1',
    runtime_activity_id: 'runtime-1',
    source_entity_id: 'pvp-action-1',
    source_entity_type: 'pvp_action',
    source_result_id: 'pvp-attack-result-1',
    source_result_kind: 'pvp_attack',
    source_type: 'pvp',
    status: 'completed',
    success: true,
    ...patch,
  };
}
