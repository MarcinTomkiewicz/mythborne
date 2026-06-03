import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  AccountEntryHeroContextRow,
  StartFlowCreateHeroRow,
  StartFlowOriginOptionRow,
  StartFlowServerAvailabilityRow,
} from '../../domain/start-flow/start-flow.model';
import { Backend } from '../backend/backend';
import { StartFlow } from './start-flow';

describe('StartFlow', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: StartFlow;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);

    TestBed.configureTestingModule({
      providers: [
        StartFlow,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(StartFlow);
  });

  it('loads server availability through the canonical start-flow RPC', async () => {
    backend.rpc.and.returnValue(of([serverAvailabilityRow({
      is_sandbox: true,
      can_enter_game: true,
      heroes_json: [
        { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
        { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
      ],
    })]));

    const result = await firstValueFrom(service.getServerAvailability());

    expect(result[0]).toEqual(jasmine.objectContaining({
      serverId: 'server-1',
      canCreateHero: true,
      nextAction: 'hero_creation',
    }));
    expect(result[0].heroes.map((hero) => hero.heroId)).toEqual(['hero-1', 'hero-2']);
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_start_flow_server_availability,
    );
  });

  it('loads origin options through the canonical start-flow RPC', async () => {
    backend.rpc.and.returnValue(of([originOptionRow()]));

    const result = await firstValueFrom(service.getOriginOptions());

    expect(result[0]).toEqual(jasmine.objectContaining({
      originId: 'origin-1',
      bonusSummaryText: '+5 Dexterity',
    }));
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_start_flow_origin_options,
    );
  });

  it('loads account-entry hero contexts through the player-safe read model', async () => {
    backend.rpc.and.returnValue(of([accountEntryHeroContextRow()]));

    const result = await firstValueFrom(service.getAccountEntryHeroContexts());

    expect(result[0]).toEqual(jasmine.objectContaining({
      heroId: 'hero-1',
      serverId: 'server-1',
      heroName: 'Ariadne',
      heroLevel: 4,
      addressLabel: 'A-3',
      routeNextAction: 'hero_dashboard',
    }));
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_account_entry_hero_contexts,
      {},
    );
  });

  it('can scope account-entry hero contexts to a server', async () => {
    backend.rpc.and.returnValue(of([accountEntryHeroContextRow()]));

    await firstValueFrom(service.getAccountEntryHeroContexts('server-1'));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_account_entry_hero_contexts,
      { p_server_id: 'server-1' },
    );
  });

  it('creates a hero through the atomic start-flow RPC only', async () => {
    backend.rpc.and.returnValue(of([heroCreationRow()]));

    const result = await firstValueFrom(
      service.createHero({
        serverId: 'server-1',
        originId: 'origin-1',
        heroName: 'Hero',
        requestId: 'request-1',
      }),
    );

    expect(result.routeNextAction).toBe('stat_allocation');
    expect(result.characterPointsBalance).toBe(1000);
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.create_hero_start_flow,
      {
        p_server_id: 'server-1',
        p_origin_id: 'origin-1',
        p_hero_name: 'Hero',
        p_request_id: 'request-1',
      },
    );
  });

  it('fails clearly when hero creation returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(
      service.createHero({
        serverId: 'server-1',
        originId: 'origin-1',
        heroName: 'Hero',
      }),
    )).toBeRejectedWithError(
      'Hero creation did not return a start-flow result.',
    );
  });
});

function serverAvailabilityRow(
  patch: Partial<StartFlowServerAvailabilityRow> = {},
): StartFlowServerAvailabilityRow {
  return {
    server_id: 'server-1',
    server_key: 'standard',
    server_name: 'Standard',
    server_kind: 'standard',
    server_status: 'live',
    description: 'Main server.',
    membership_status: 'active',
    is_visible: true,
    is_standard: true,
    is_sandbox: false,
    is_staff_context: false,
    can_enter_game: false,
    can_create_hero: true,
    next_action: 'hero_creation',
    block_reason: '',
    user_hero_count: 0,
    default_hero_id: '',
    default_hero_name: '',
    is_server_full: false,
    is_district_a_full: false,
    district_a_capacity: 100,
    district_a_occupied: 12,
    district_a_free: 88,
    heroes_json: [],
    eligibility_json: {},
    ...patch,
  };
}

function accountEntryHeroContextRow(
  patch: Partial<AccountEntryHeroContextRow> = {},
): AccountEntryHeroContextRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    server_key: 'sandbox',
    server_name: 'Sandbox',
    hero_name: 'Ariadne',
    hero_level: 4,
    estate_id: 'estate-1',
    district_code: 'A',
    address_number: 3,
    address: 'legacy-address',
    address_label: 'A-3',
    created_at: '2026-05-01T10:00:00Z',
    route_next_action: 'hero_dashboard',
    hero_context_json: {
      heroId: 'hero-1',
      serverId: 'server-1',
      serverKey: 'sandbox',
      serverName: 'Sandbox',
      heroName: 'Ariadne',
      heroLevel: 4,
      estateId: 'estate-1',
      districtCode: 'A',
      addressNumber: 3,
      address: 'legacy-address',
      addressLabel: 'A-3',
      createdAt: '2026-05-01T10:00:00Z',
      routeNextAction: 'hero_dashboard',
    },
    ...patch,
  };
}

function originOptionRow(): StartFlowOriginOptionRow {
  return {
    origin_id: 'origin-1',
    origin_key: 'nomad',
    origin_label: 'Nomad',
    origin_description: 'Road-born hunter.',
    sort_order: 10,
    is_active: true,
    bonuses_json: [{ label: '+5 Dexterity' }],
    bonus_summary_text: '+5 Dexterity',
  };
}

function heroCreationRow(): StartFlowCreateHeroRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    hero_name: 'Hero',
    origin_id: 'origin-1',
    origin_key: 'nomad',
    origin_label: 'Nomad',
    estate_id: 'estate-1',
    district_code: 'A',
    address_number: 42,
    address: 'A-42',
    character_points_balance: 1000,
    character_point_ledger_id: 'ledger-1',
    prestige_rank_number: 1,
    prestige_rank_name: 'Unproven',
    resources_json: [{ resourceType: 'materials', amount: 0 }],
    hero_stats_json: [{ statKey: 'strength', value: 1 }],
    route_next_action: 'stat_allocation',
    created_new_hero: true,
    audit_log_id: 'audit-1',
  };
}
