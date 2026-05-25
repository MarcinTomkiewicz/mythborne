import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcRow,
} from '../../types/combat-live-rpc.types';
import { Backend } from '../backend/backend';
import { ExplorationLiveCombat } from './exploration-live-combat';

describe('ExplorationLiveCombat', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ExplorationLiveCombat;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.callFake(((functionName: string) => {
      switch (functionName) {
        case RPC.start_manual_combat_session:
        case RPC.get_combat_live_state:
        case RPC.submit_combat_player_action:
          return of([liveStateRow()]);
        case RPC.get_combat_result_detail:
          return of([resultDetailRow()]);
        default:
          return of([]);
      }
    }) as Backend['rpc']);

    TestBed.configureTestingModule({
      providers: [
        ExplorationLiveCombat,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(ExplorationLiveCombat);
  });

  it('starts manual exploration combat through generic canonical RPC', async () => {
    const state = await firstValueFrom(
      service.startManualSession({
        challengeAttemptId: 'challenge-1',
        requestId: 'request-1',
      }),
    );

    expect(state.sessionId).toBe('session-1');
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.start_manual_combat_session,
      {
        p_source_entity_type: 'exploration_challenge_attempt',
        p_source_entity_id: 'challenge-1',
        p_request_id: 'request-1',
      },
    );
  });

  it('loads live state with optional event cursor', async () => {
    const state = await firstValueFrom(
      service.getState({
        sessionId: 'session-1',
        sinceEventIndex: 7,
      }),
    );

    expect(state.eventCount).toBe(1);
    expect(backend.rpc).toHaveBeenCalledOnceWith(RPC.get_combat_live_state, {
      p_session_id: 'session-1',
      p_since_event_index: 7,
    });
  });

  it('submits one player action with timing input only', async () => {
    await firstValueFrom(
      service.submitPlayerAction({
        sessionId: 'session-1',
        timingInput: { positionPercent: 42 },
        requestId: 'request-2',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.submit_combat_player_action,
      {
        p_session_id: 'session-1',
        p_timing_input_json: { positionPercent: 42 },
        p_request_id: 'request-2',
      },
    );
    const args = backend.rpc.calls.mostRecent().args[1];

    expect(JSON.stringify(args)).not.toContain('stats');
    expect(JSON.stringify(args)).not.toContain('equipment');
    expect(JSON.stringify(args)).not.toContain('luck');
    expect(JSON.stringify(args)).not.toContain('damage');
    expect(JSON.stringify(args)).not.toContain('outcome');
    expect(JSON.stringify(args)).not.toContain('reward');
  });

  it('loads durable combat result detail through read RPC', async () => {
    const detail = await firstValueFrom(
      service.getResultDetail({ combatResultId: 'combat-result-1' }),
    );

    expect(detail.outcome).toBe('initiator_victory');
    expect(backend.rpc).toHaveBeenCalledOnceWith(RPC.get_combat_result_detail, {
      p_combat_result_id: 'combat-result-1',
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
    current_timing_manifest_json: {
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
    },
    event_count: 1,
    events_json: [
      {
        eventIndex: 1,
        label: 'DB requested player action',
      },
    ],
    final_combat_result_id: null as unknown as string,
    participants_json: [
      {
        participantId: 'participant-hero',
        displayName: 'Hero',
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
