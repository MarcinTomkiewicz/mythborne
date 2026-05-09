import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  CancelGuildInviteRpcRow,
  CreateGuildInviteRpcRow,
  GetHeroGuildInvitationRowsRpcRow,
  RespondGuildInviteRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildInvites } from './player-guild-invites';

describe('PlayerGuildInvites', () => {
  let service: PlayerGuildInvites;
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
        PlayerGuildInvites,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildInvites);
  });

  it('loads active hero guild invites through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([inviteRow()]));

    const result = await firstValueFrom(service.getActiveHeroGuildInvites(true));

    expect(backend.rpc).toHaveBeenCalledWith('get_hero_guild_invitation_rows', {
      p_hero_id: 'hero-1',
      p_include_terminal: true,
    });
    expect(result[0]).toEqual(jasmine.objectContaining({
      inviteId: 'invite-1',
      canAccept: true,
      canReject: true,
    }));
  });

  it('creates guild invite through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([createInviteRow()]));

    const result = await firstValueFrom(service.createGuildInviteForActiveHero({
      targetHeroId: ' target-hero-1 ',
      reason: ' Join us. ',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('create_guild_invite', {
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'target-hero-1',
      p_expires_at: undefined,
      p_reason: 'Join us.',
      p_request_id: 'request-1',
    });
    expect(result).toEqual(jasmine.objectContaining({
      inviteId: 'invite-1',
      statusKey: 'pending',
    }));
  });

  it('responds to guild invite through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([respondInviteRow()]));

    const result = await firstValueFrom(service.respondGuildInviteForActiveHero({
      inviteId: 'invite-1',
      accept: true,
      reason: 'Accepted.',
      requestId: 'request-2',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('respond_guild_invite', {
      p_target_hero_id: 'hero-1',
      p_invite_id: 'invite-1',
      p_accept: true,
      p_reason: 'Accepted.',
      p_request_id: 'request-2',
    });
    expect(result).toEqual(jasmine.objectContaining({
      statusKey: 'accepted',
      membershipId: 'membership-1',
      memberCount: 13,
    }));
  });

  it('cancels guild invite through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([cancelInviteRow()]));

    const result = await firstValueFrom(service.cancelGuildInviteForActiveHero({
      inviteId: 'invite-1',
      reason: 'Canceled.',
      requestId: 'request-3',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('cancel_guild_invite', {
      p_actor_hero_id: 'hero-1',
      p_invite_id: 'invite-1',
      p_reason: 'Canceled.',
      p_request_id: 'request-3',
    });
    expect(result).toEqual(jasmine.objectContaining({
      statusKey: 'cancelled',
      membershipId: null,
    }));
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

function inviteRow(): GetHeroGuildInvitationRowsRpcRow {
  return {
    can_accept: true,
    can_cancel: false,
    can_reject: true,
    created_at: '2026-05-08T10:00:00.000Z',
    expires_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    invite_id: 'invite-1',
    inviter_hero_id: 'hero-2',
    inviter_hero_name: 'Inviter Hero',
    reason: 'Join us.',
    responded_at: '',
    status_key: 'pending',
    status_reason: '',
    target_hero_id: 'hero-1',
    target_hero_name: 'Target Hero',
  };
}

function createInviteRow(): CreateGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    expires_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    status_key: 'pending',
    target_hero_id: 'target-hero-1',
  };
}

function respondInviteRow(): RespondGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    member_count: 13,
    member_limit: 30,
    membership_id: 'membership-1',
    status_key: 'accepted',
    target_hero_id: 'hero-1',
  };
}

function cancelInviteRow(): CancelGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    status_key: 'cancelled',
    target_hero_id: 'hero-1',
  };
}
