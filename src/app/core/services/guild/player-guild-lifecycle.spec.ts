import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  DisbandGuildRpcRow,
  LeaveGuildRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildLifecycle } from './player-guild-lifecycle';

describe('PlayerGuildLifecycle', () => {
  let service: PlayerGuildLifecycle;
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
        PlayerGuildLifecycle,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildLifecycle);
  });

  it('leaves guild through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([leaveRow()]));

    const result = await firstValueFrom(service.leaveGuildForActiveHero({
      reason: 'Moving on.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('leave_guild', {
      p_actor_hero_id: 'hero-1',
      p_reason: 'Moving on.',
      p_request_id: 'request-1',
    });
    expect(result.kind).toBe('leave');
    expect(JSON.stringify(result)).not.toContain('audit-log-1');
  });

  it('disbands guild through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([disbandRow()]));

    const result = await firstValueFrom(service.disbandGuildForActiveHero({
      reason: 'Closing guild.',
      requestId: 'request-2',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('disband_guild', {
      p_actor_hero_id: 'hero-1',
      p_reason: 'Closing guild.',
      p_request_id: 'request-2',
    });
    expect(result.kind).toBe('disband');
    expect(result.endedMembershipCount).toBe(3);
    expect(JSON.stringify(result)).not.toContain('audit-log-1');
  });

  it('generates lifecycle request ids when caller does not provide one', async () => {
    backend.rpc.and.returnValues(of([leaveRow()]), of([disbandRow()]));

    await firstValueFrom(service.leaveGuild('hero-1'));
    await firstValueFrom(service.disbandGuild('hero-1', { reason: 'Closing guild.' }));

    expect(backend.rpc).toHaveBeenCalledWith('leave_guild', jasmine.objectContaining({
      p_request_id: jasmine.stringMatching(/^guild-leave:/),
    }));
    expect(backend.rpc).toHaveBeenCalledWith('disband_guild', jasmine.objectContaining({
      p_request_id: jasmine.stringMatching(/^guild-disband:/),
    }));
  });

  it('rejects stale active hero context after RPC response', async () => {
    const response = new Subject<LeaveGuildRpcRow[]>();
    backend.rpc.and.returnValue(response.asObservable());

    const result = firstValueFrom(service.leaveGuildForActiveHero());
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next([leaveRow()]);
    response.complete();

    await expectAsync(result).toBeRejectedWithError('Guild lifecycle context changed.');
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

function leaveRow(overrides: Partial<LeaveGuildRpcRow> = {}): LeaveGuildRpcRow {
  return {
    actor_hero_id: 'hero-1',
    audit_log_id: 'audit-log-1',
    ended_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    membership_id: 'membership-1',
    old_role_key: 'member',
    status_key: 'left',
    ...overrides,
  };
}

function disbandRow(overrides: Partial<DisbandGuildRpcRow> = {}): DisbandGuildRpcRow {
  return {
    actor_hero_id: 'hero-1',
    audit_log_id: 'audit-log-1',
    cancelled_invite_count: 2,
    cancelled_join_request_count: 1,
    dissolved_at: '2026-05-09T11:00:00.000Z',
    ended_membership_count: 3,
    guild_id: 'guild-1',
    status_key: 'disbanded',
    ...overrides,
  };
}
