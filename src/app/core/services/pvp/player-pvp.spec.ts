import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetMyPvpAttackResultRpcRow,
  GetMyPvpSpyResultRpcRow,
  GetHeroActiveRuntimeActivityRpcRow,
  GetPvpTargetCandidatesRpcRow,
  StartPvpActionRpcRow,
} from '../../types/pvp-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerPvp } from './player-pvp';

describe('PlayerPvp', () => {
  let service: PlayerPvp;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'update',
      'delete',
      'upsert',
    ]);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'active-hero-1' } as never,
      heroId: 'active-hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));

    TestBed.configureTestingModule({
      providers: [
        PlayerPvp,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerPvp);
  });

  it('loads PvP target candidates through canonical RPC using active hero context', async () => {
    backend.rpc.and.returnValue(of([targetCandidateRow()]));

    const candidates = await firstValueFrom(service.getTargetCandidates({
      districtCode: ' agora ',
      limit: 20,
      offset: 5,
      search: ' target ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_pvp_target_candidates,
      {
        p_attacker_hero_id: 'active-hero-1',
        p_district_code: 'agora',
        p_limit: 20,
        p_offset: 5,
        p_search: 'target',
      },
    );
    expect(candidates[0]).toEqual(jasmine.objectContaining({
      targetHeroId: 'target-hero-1',
      targetDisplayName: 'Target Hero',
      attackEligibility: jasmine.objectContaining({
        canStart: true,
      }),
    }));
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('starts PvP action through canonical RPC without assuming auth user id', async () => {
    backend.rpc.and.returnValue(of([startActionRow()]));

    const result = await firstValueFrom(service.startAction({
      actionKind: 'attack',
      targetHeroId: ' target-hero-1 ',
      reason: ' player action ',
      requestId: ' request-1 ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.start_pvp_action,
      {
        p_action_kind: 'attack',
        p_attacker_hero_id: 'active-hero-1',
        p_reason: 'player action',
        p_request_id: 'request-1',
        p_target_hero_id: 'target-hero-1',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      pvpActionId: 'pvp-action-1',
      attackerHeroId: 'active-hero-1',
      targetHeroId: 'target-hero-1',
    }));
    expect(JSON.stringify(backend.rpc.calls.mostRecent().args[1]))
      .not.toContain('user-1');
  });

  it('loads my spy result through canonical owner-safe RPC', async () => {
    backend.rpc.and.returnValue(of([spyResultRow()]));

    const result = await firstValueFrom(
      service.getMySpyResult(' spy-result-1 '),
    );

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_my_pvp_spy_result,
      {
        p_hero_id: 'active-hero-1',
        p_spy_result_id: 'spy-result-1',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      spyResultId: 'spy-result-1',
      spyHeroId: 'active-hero-1',
      targetHeroId: 'target-hero-1',
    }));
    expect(JSON.stringify(result)).not.toContain('requestId');
  });

  it('loads active runtime activity through canonical owner-safe RPC', async () => {
    backend.rpc.and.returnValue(of([activeRuntimeActivityRow()]));

    const result = await firstValueFrom(service.getActiveRuntimeActivity());

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_hero_active_runtime_activity,
      {
        p_hero_id: 'active-hero-1',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      activityId: 'runtime-1',
      activityKind: 'pvp_spy',
      sourceEntityId: 'pvp-action-1',
    }));
  });

  it('returns null when active runtime activity RPC returns no rows', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.getActiveRuntimeActivity()))
      .toBeResolvedTo(null);
  });

  it('loads my attack result through canonical owner-safe RPC', async () => {
    backend.rpc.and.returnValue(of([attackResultRow()]));

    const result = await firstValueFrom(
      service.getMyAttackResult(' attack-result-1 '),
    );

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_my_pvp_attack_result,
      {
        p_attack_result_id: 'attack-result-1',
        p_hero_id: 'active-hero-1',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      attackResultId: 'attack-result-1',
      pvpActionId: 'pvp-action-1',
      outcomeKey: 'attacker_won',
    }));
    expect(JSON.stringify(result)).not.toContain('requestId');
  });

  it('rejects empty action and result identifiers before RPC', () => {
    expect(() => service.startAction({
      actionKind: 'attack',
      targetHeroId: ' ',
    })).toThrowError('targetHeroId is required for PvP RPC.');
    expect(() => service.getMySpyResult(' '))
      .toThrowError('spyResultId is required for PvP RPC.');
    expect(() => service.getMyAttackResult(''))
      .toThrowError('attackResultId is required for PvP RPC.');
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('surfaces empty single-row RPC responses clearly', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(
      service.getMyAttackResult('attack-result-1'),
    )).toBeRejectedWithError(
      'get_my_pvp_attack_result returned no PvP row.',
    );
  });

  it('does not query or mutate PvP tables directly', async () => {
    backend.rpc.and.returnValue(of([targetCandidateRow()]));

    await firstValueFrom(service.getTargetCandidates());

    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });
});

function targetCandidateRow(
  overrides: Partial<GetPvpTargetCandidatesRpcRow> = {},
): GetPvpTargetCandidatesRpcRow {
  return {
    attack_block_reason: '',
    attack_max_target_level: 14,
    attack_min_target_level: 8,
    attack_travel_time_seconds: 1800,
    attacker_has_blocking_activity: false,
    can_attack: true,
    can_spy: true,
    distance_score: 7,
    protection_expires_at: '',
    spy_block_reason: '',
    spy_travel_time_seconds: 900,
    target_address: 'Agora 12',
    target_address_number: 12,
    target_display_name: 'Target Hero',
    target_district_code: 'agora',
    target_estate_id: 'target-estate-1',
    target_estate_rank: 3,
    target_hero_id: 'target-hero-1',
    target_level: 10,
    under_protection: false,
    ...overrides,
  };
}

function startActionRow(
  overrides: Partial<StartPvpActionRpcRow> = {},
): StartPvpActionRpcRow {
  return {
    action_kind: 'attack',
    arrives_at: '2026-05-05T10:30:00.000Z',
    attack_travel_time_seconds: 1800,
    attacker_estate_id: 'attacker-estate-1',
    attacker_hero_id: 'active-hero-1',
    distance_score: 7,
    manual_deadline_at: '2026-05-05T10:35:00.000Z',
    manual_fight_window_seconds: 300,
    pvp_action_id: 'pvp-action-1',
    runtime_activity_id: 'runtime-1',
    server_id: 'server-1',
    spy_travel_time_seconds: 900,
    started_at: '2026-05-05T10:00:00.000Z',
    status: 'traveling',
    target_estate_id: 'target-estate-1',
    target_hero_id: 'target-hero-1',
    target_protection_id: '',
    target_protection_seconds: 0,
    travel_time_seconds: 1800,
    ...overrides,
  };
}

function spyResultRow(
  overrides: Partial<GetMyPvpSpyResultRpcRow> = {},
): GetMyPvpSpyResultRpcRow {
  return {
    base_stats_snapshot_json: { strength: 10 },
    buildings_snapshot_json: [{ key: 'mansion', level: 4 }],
    created_at: '2026-05-05T11:00:00.000Z',
    derived_combat_stats_json: { attack: 20 },
    equipment_snapshot_json: [],
    estate_snapshot_json: { rank: 3 },
    metadata_json: { requestId: 'hidden' },
    pvp_action_id: 'pvp-action-1',
    resources_snapshot_json: { drachma: 1000 },
    result_summary: 'Scouted target.',
    server_id: 'server-1',
    spy_hero_id: 'active-hero-1',
    spy_level_snapshot: 12,
    spy_result_id: 'spy-result-1',
    target_address_snapshot: 'Agora 12',
    target_display_name_snapshot: 'Target Hero',
    target_hero_id: 'target-hero-1',
    target_level_snapshot: 10,
    visibility_key: 'standard',
    ...overrides,
  };
}

function activeRuntimeActivityRow(
  overrides: Partial<GetHeroActiveRuntimeActivityRpcRow> = {},
): GetHeroActiveRuntimeActivityRpcRow {
  return {
    activity_id: 'runtime-1',
    activity_kind: 'pvp_spy',
    activity_kind_label: 'PvP spy',
    available_at: '2026-05-06T10:01:30.000Z',
    ended_at: '',
    expires_at: '',
    hero_id: 'active-hero-1',
    metadata_json: { travelTimeSeconds: 90 },
    reason: '',
    request_id: 'request-1',
    server_id: 'server-1',
    source_entity_id: 'pvp-action-1',
    source_entity_type: 'pvp_action',
    started_at: '2026-05-06T10:00:00.000Z',
    status: 'active',
    status_label: 'Active',
    ...overrides,
  };
}

function attackResultRow(
  overrides: Partial<GetMyPvpAttackResultRpcRow> = {},
): GetMyPvpAttackResultRpcRow {
  return {
    attack_result_id: 'attack-result-1',
    attacker_hero_id: 'active-hero-1',
    attacker_level_snapshot: 12,
    combat_outcome: 'initiator_victory',
    combat_result_id: 'combat-result-1',
    created_at: '2026-05-05T11:00:00.000Z',
    defender_hero_id: 'target-hero-1',
    defender_level_snapshot: 10,
    level_difference: 2,
    loser_hero_id: 'target-hero-1',
    metadata_json: { requestId: 'hidden' },
    notification_context_json: {},
    outcome_key: 'attacker_won',
    outcome_label: 'Attacker won',
    prestige_context_json: {},
    pvp_action_id: 'pvp-action-1',
    report_context_json: {},
    resource_outcome_json: { drachmaDelta: 120 },
    reward_context_json: { xp: 50 },
    server_id: 'server-1',
    winner_hero_id: 'active-hero-1',
    ...overrides,
  };
}
