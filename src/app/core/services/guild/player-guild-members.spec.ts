import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  DemoteGuildOfficerRpcRow,
  GetHeroGuildMembersRpcRow,
  KickGuildMemberRpcRow,
  PromoteGuildMemberToOfficerRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildMembers } from './player-guild-members';

describe('PlayerGuildMembers', () => {
  let service: PlayerGuildMembers;
  let backend: jasmine.SpyObj<Backend>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let activeHero: Pick<ActiveHero, 'requireActiveHero' | 'state'> & {
    requireActiveHero: jasmine.Spy;
  };

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    activeHero = {
      requireActiveHero: jasmine.createSpy('requireActiveHero'),
      state: activeHeroState.asReadonly(),
    };
    activeHero.requireActiveHero.and.callFake(() => of(activeHeroState() as ActiveHeroState));

    TestBed.configureTestingModule({
      providers: [
        PlayerGuildMembers,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildMembers);
  });

  it('loads active hero guild members through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([memberRow()]));

    const result = await firstValueFrom(service.getActiveHeroGuildMembers());

    expect(backend.rpc).toHaveBeenCalledWith('get_hero_guild_members', {
      p_hero_id: 'hero-1',
    });
    expect(result[0].memberHeroId).toBe('member-hero-1');
    expect(JSON.stringify(result)).not.toContain('user-1');
  });

  it('kicks guild member through canonical RPC and generated args', async () => {
    backend.rpc.and.returnValue(of([kickRow()]));

    const result = await firstValueFrom(service.kickGuildMemberForActiveHero({
      targetHeroId: 'member-hero-1',
      reason: 'Rule breach.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('kick_guild_member', {
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'member-hero-1',
      p_reason: 'Rule breach.',
      p_request_id: 'request-1',
    });
    expect(result.statusKey).toBe('removed');
    expect(JSON.stringify(result)).not.toContain('audit-log-1');
  });

  it('promotes and demotes officer through canonical RPCs', async () => {
    backend.rpc.and.returnValues(of([promoteRow()]), of([demoteRow()]));

    const promoteResult = await firstValueFrom(service.promoteGuildMemberForActiveHero({
      targetHeroId: 'member-hero-1',
      reason: 'Trusted.',
      requestId: 'request-2',
    }));
    const demoteResult = await firstValueFrom(service.demoteGuildOfficerForActiveHero({
      targetHeroId: 'officer-hero-1',
      reason: 'Inactive.',
      requestId: 'request-3',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('promote_guild_member_to_officer', {
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'member-hero-1',
      p_reason: 'Trusted.',
      p_request_id: 'request-2',
    });
    expect(backend.rpc).toHaveBeenCalledWith('demote_guild_officer', {
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'officer-hero-1',
      p_reason: 'Inactive.',
      p_request_id: 'request-3',
    });
    expect(promoteResult.newRoleKey).toBe('officer');
    expect(demoteResult.newRoleKey).toBe('member');
  });

  it('generates action request ids when caller does not provide one', async () => {
    backend.rpc.and.returnValue(of([kickRow()]));

    await firstValueFrom(service.kickGuildMember('hero-1', {
      targetHeroId: 'member-hero-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('kick_guild_member', jasmine.objectContaining({
      p_request_id: jasmine.stringMatching(/^guild-member-kick:/),
    }));
  });

  it('rejects stale active hero context after RPC response', async () => {
    const response = new Subject<KickGuildMemberRpcRow[]>();
    backend.rpc.and.returnValue(response.asObservable());

    const result = firstValueFrom(service.kickGuildMemberForActiveHero({
      targetHeroId: 'member-hero-1',
    }));
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next([kickRow()]);
    response.complete();

    await expectAsync(result).toBeRejectedWithError('Guild member context changed.');
  });
});

function activeContext(
  overrides: Partial<Pick<ActiveHeroState, 'serverId' | 'heroId'>> = {},
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {} as ActiveHeroState['server'],
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
    ...overrides,
  };
}

function memberRow(
  overrides: Partial<GetHeroGuildMembersRpcRow> = {},
): GetHeroGuildMembersRpcRow {
  return {
    guild_id: 'guild-1',
    member_hero_id: 'member-hero-1',
    member_name: 'Member Hero',
    member_user_id: 'user-1',
    role_key: 'member',
    role_label: 'Member',
    membership_status_key: 'active',
    joined_at: '2026-05-08T10:00:00.000Z',
    created_at: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function kickRow(overrides: Partial<KickGuildMemberRpcRow> = {}): KickGuildMemberRpcRow {
  return {
    actor_hero_id: 'hero-1',
    audit_log_id: 'audit-log-1',
    ended_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    old_role_key: 'member',
    status_key: 'removed',
    target_hero_id: 'member-hero-1',
    target_membership_id: 'membership-1',
    ...overrides,
  };
}

function promoteRow(
  overrides: Partial<PromoteGuildMemberToOfficerRpcRow> = {},
): PromoteGuildMemberToOfficerRpcRow {
  return {
    actor_hero_id: 'hero-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    new_role_key: 'officer',
    old_role_key: 'member',
    target_hero_id: 'member-hero-1',
    target_membership_id: 'membership-1',
    ...overrides,
  };
}

function demoteRow(
  overrides: Partial<DemoteGuildOfficerRpcRow> = {},
): DemoteGuildOfficerRpcRow {
  return {
    actor_hero_id: 'hero-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    new_role_key: 'member',
    old_role_key: 'officer',
    target_hero_id: 'officer-hero-1',
    target_membership_id: 'membership-2',
    ...overrides,
  };
}
