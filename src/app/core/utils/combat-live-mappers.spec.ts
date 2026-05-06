import {
  mapCombatLiveState,
  mapCombatResultDetail,
  mergeCombatLiveEvents,
  toSubmitCombatPlayerActionRpcArgs,
} from './combat-live-mappers';
import {
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
      zoneStartPercent: 30,
      zoneEndPercent: 70,
      speed: 1.5,
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
    current_timing_manifest_json: {
      zoneStartPercent: 30,
      zoneEndPercent: 70,
      speed: 1.5,
    },
    event_count: 2,
    events_json: [eventRow(2), eventRow(1)],
    final_combat_result_id: null as unknown as string,
    participants_json: [
      {
        participantId: 'participant-hero',
        displayName: 'Hero',
        side: 'initiator',
        statusKey: 'active',
        currentHp: 44,
        maxHp: 50,
        heroId: 'hero-1',
      },
      {
        participantId: 'participant-opponent',
        displayName: 'Opponent',
        side: 'defender',
        statusKey: 'active',
        currentHp: 20,
        maxHp: 30,
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
