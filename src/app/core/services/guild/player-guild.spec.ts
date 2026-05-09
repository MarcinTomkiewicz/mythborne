import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  GetGuildConfigSummaryRpcRow,
  GetHeroGuildDashboardRpcRow,
  GetHeroGuildStateRpcRow,
  SearchGuildsForHeroRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuild } from './player-guild';

describe('PlayerGuild', () => {
  let service: PlayerGuild;
  let backend: jasmine.SpyObj<Backend>;
  let activeHero: Pick<ActiveHero, 'requireActiveHero' | 'state'> & {
    requireActiveHero: jasmine.Spy;
  };
  let activeHeroState: ActiveHeroState;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    activeHeroState = activeContext();
    activeHero = {
      requireActiveHero: jasmine.createSpy('requireActiveHero'),
      state: signal<ActiveHeroState | null>(activeHeroState).asReadonly(),
    };
    activeHero.requireActiveHero.and.returnValue(of(activeHeroState as any));

    TestBed.configureTestingModule({
      providers: [
        PlayerGuild,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuild);
  });

  it('loads current hero guild state and dashboard through canonical RPCs', async () => {
    backend.rpc.and.callFake(((name: string) => {
      switch (name) {
        case 'get_hero_guild_state':
          return of([guildStateRow()]);
        case 'get_hero_guild_dashboard':
          return of([guildDashboardRow()]);
        default:
          return of([]);
      }
    }) as Backend['rpc']);

    const result = await firstValueFrom(service.getActiveHeroGuild());

    expect(backend.rpc).toHaveBeenCalledWith('get_hero_guild_state', { p_hero_id: 'hero-1' });
    expect(backend.rpc).toHaveBeenCalledWith('get_hero_guild_dashboard', { p_hero_id: 'hero-1' });
    expect(result.state.guild?.guildId).toBe('guild-1');
    expect(result.detail?.currentRoleKey).toBe('leader');
  });

  it('keeps no-guild state explicit and does not load dashboard', async () => {
    backend.rpc.and.returnValue(of([guildStateRow({
      guild_id: '',
      membership_id: '',
      can_create_guild: true,
    })]));

    const result = await firstValueFrom(service.getActiveHeroGuild());

    expect(result.state.guild).toBeNull();
    expect(result.detail).toBeNull();
    expect(backend.rpc).toHaveBeenCalledTimes(1);
  });

  it('loads guild config summary from DB RPC values', async () => {
    backend.rpc.and.returnValue(of([configRow()]));

    const result = await firstValueFrom(service.getGuildConfigSummary());

    expect(backend.rpc).toHaveBeenCalledWith('get_guild_config_summary', {});
    expect(result.creationDrachmaCost).toBe(1000);
    expect(result.armoryCapacityIsUnlimited).toBeTrue();
  });

  it('searches guilds for active hero with query and pagination through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([searchGuildRow()]));

    const result = await firstValueFrom(service.searchGuildsForActiveHero({
      query: ' argo ',
      limit: 10,
      offset: 20,
    }));

    expect(backend.rpc).toHaveBeenCalledWith('search_guilds_for_hero', {
      p_hero_id: 'hero-1',
      p_query: 'argo',
      p_limit: 10,
      p_offset: 20,
    });
    expect(result).toEqual(jasmine.objectContaining({
      query: 'argo',
      limit: 10,
      offset: 20,
      totalCount: 3,
    }));
    expect(result.guilds[0]).toEqual(jasmine.objectContaining({
      guildId: 'guild-1',
      canRequestToJoin: true,
      currentJoinRequestStatusKey: 'pending',
    }));
  });

  it('uses RPC-owned join availability and does not calculate it from counts', async () => {
    backend.rpc.and.returnValue(of([searchGuildRow({
      member_count: 1,
      member_limit: 99,
      can_request_to_join: false,
    })]));

    const result = await firstValueFrom(service.searchGuildsForHero('hero-1'));

    expect(result.guilds[0].canRequestToJoin).toBeFalse();
  });
});

function activeContext(): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {
      id: 'server-1',
      key: 'server-1',
      name: 'Server',
      kind: 'standard',
      status: 'live',
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: 'active',
      membership: null,
      staffRole: null,
      canManage: false,
      canUseAsSandbox: false,
    },
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
  };
}

function guildStateRow(overrides: Partial<GetHeroGuildStateRpcRow> = {}): GetHeroGuildStateRpcRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    guild_status_key: 'active',
    membership_id: 'membership-1',
    membership_status_key: 'active',
    role_key: 'leader',
    role_label: 'Leader',
    member_count: 12,
    member_limit: 30,
    can_create_guild: false,
    can_invite: true,
    can_manage_armory: true,
    can_manage_members: true,
    ...overrides,
  };
}

function guildDashboardRow(): GetHeroGuildDashboardRpcRow {
  return {
    ...guildStateRow(),
    active_election_id: '',
    active_election_status_key: '',
    armory_available_count: 7,
    armory_borrowed_count: 2,
    can_start_emergency_election: false,
    my_active_loan_count: 1,
    my_armory_access_status_key: 'allowed',
    my_deposited_item_count: 3,
    pending_invite_count: 4,
    pending_join_request_count: 5,
  };
}

function configRow(): GetGuildConfigSummaryRpcRow {
  return {
    creation_drachma_cost: 1000,
    member_base_limit: 10,
    member_limit_per_leader_level: 2,
    leader_inactivity_threshold_days: 15,
    nomination_duration_minutes: 360,
    voting_duration_minutes: 720,
    emergency_max_candidates: 3,
    armory_capacity: 0,
    armory_capacity_is_unlimited: true,
  };
}

function searchGuildRow(
  overrides: Partial<SearchGuildsForHeroRpcRow> = {},
): SearchGuildsForHeroRpcRow {
  return {
    guild_id: 'guild-1',
    server_id: 'server-1',
    name: 'Argonauts',
    tag: 'ARGO',
    status_key: 'active',
    member_count: 12,
    member_limit: 30,
    can_request_to_join: true,
    current_join_request_status_key: 'pending',
    current_invite_status_key: '',
    total_count: 3,
    ...overrides,
  };
}
