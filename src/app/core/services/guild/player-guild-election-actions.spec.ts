import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  FinalizeGuildEmergencyElectionRpcRow,
  NominateGuildEmergencyLeaderCandidateRpcRow,
  StartGuildEmergencyElectionRpcRow,
  StartGuildEmergencyElectionVotingRpcRow,
  VoteGuildEmergencyElectionRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildElectionActions } from './player-guild-election-actions';

describe('PlayerGuildElectionActions', () => {
  let service: PlayerGuildElectionActions;
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
        PlayerGuildElectionActions,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildElectionActions);
  });

  it('starts emergency election through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([startRow()]));

    const result = await firstValueFrom(service.startEmergencyElectionForActiveHero({
      reason: 'Leader inactive.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('start_guild_emergency_election', {
      p_actor_hero_id: 'hero-1',
      p_reason: 'Leader inactive.',
      p_request_id: 'request-1',
    });
    expect(result.kind).toBe('start');
    expect(JSON.stringify(result)).not.toContain('audit-log-1');
  });

  it('generates emergency election request id when caller omits one', async () => {
    backend.rpc.and.returnValue(of([startRow()]));

    await firstValueFrom(service.startEmergencyElectionForActiveHero());

    expect(backend.rpc).toHaveBeenCalledWith(
      'start_guild_emergency_election',
      jasmine.objectContaining({
        p_request_id: jasmine.stringMatching(/^guild-emergency-election-start:/),
      }),
    );
  });

  it('nominates, starts voting, votes, and finalizes through canonical RPCs', async () => {
    backend.rpc.and.returnValues(
      of([nominationRow()]),
      of([votingStartRow()]),
      of([voteRow()]),
      of([finalizeRow()]),
    );

    await firstValueFrom(service.nominateEmergencyLeaderCandidateForActiveHero({
      electionId: 'election-1',
      candidateHeroId: 'candidate-hero-1',
      requestId: 'request-2',
    }));
    await firstValueFrom(service.startEmergencyElectionVotingForActiveHero({
      electionId: 'election-1',
      requestId: 'request-3',
    }));
    await firstValueFrom(service.voteEmergencyElectionForActiveHero({
      electionId: 'election-1',
      candidateHeroId: 'candidate-hero-1',
      requestId: 'request-4',
    }));
    const finalizeResult = await firstValueFrom(
      service.finalizeEmergencyElectionForActiveHero({
        electionId: 'election-1',
        requestId: 'request-5',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      'nominate_guild_emergency_leader_candidate',
      jasmine.objectContaining({
        p_actor_hero_id: 'hero-1',
        p_election_id: 'election-1',
        p_candidate_hero_id: 'candidate-hero-1',
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'start_guild_emergency_election_voting',
      jasmine.objectContaining({
        p_actor_hero_id: 'hero-1',
        p_election_id: 'election-1',
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'vote_guild_emergency_election',
      jasmine.objectContaining({
        p_voter_hero_id: 'hero-1',
        p_election_id: 'election-1',
        p_candidate_hero_id: 'candidate-hero-1',
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'finalize_guild_emergency_election',
      jasmine.objectContaining({
        p_actor_hero_id: 'hero-1',
        p_election_id: 'election-1',
      }),
    );
    expect(finalizeResult.newLeaderHeroId).toBe('candidate-hero-1');
  });

  it('rejects stale active hero context after action response', async () => {
    const response = new Subject<StartGuildEmergencyElectionRpcRow[]>();
    backend.rpc.and.returnValue(response.asObservable());

    const result = firstValueFrom(service.startEmergencyElectionForActiveHero());
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next([startRow()]);
    response.complete();

    await expectAsync(result)
      .toBeRejectedWithError('Guild emergency election context changed.');
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

function startRow(): StartGuildEmergencyElectionRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    election_id: 'election-1',
    guild_id: 'guild-1',
    inactive_leader_hero_id: 'leader-hero-1',
    nomination_ends_at: '2026-05-09T16:00:00.000Z',
    status_key: 'nomination',
    voting_ends_at: '',
  };
}

function nominationRow(): NominateGuildEmergencyLeaderCandidateRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    candidate_hero_id: 'candidate-hero-1',
    election_id: 'election-1',
    guild_id: 'guild-1',
    max_candidates: 3,
    nominated_by_hero_id: 'hero-1',
    nomination_count: 1,
    nomination_id: 'nomination-1',
  };
}

function votingStartRow(): StartGuildEmergencyElectionVotingRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    election_id: 'election-1',
    guild_id: 'guild-1',
    nomination_count: 1,
    status_key: 'voting',
    voting_ends_at: '2026-05-10T04:00:00.000Z',
    voting_starts_at: '2026-05-09T16:00:00.000Z',
  };
}

function voteRow(): VoteGuildEmergencyElectionRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    candidate_hero_id: 'candidate-hero-1',
    election_id: 'election-1',
    guild_id: 'guild-1',
    vote_id: 'vote-1',
    voter_hero_id: 'hero-1',
  };
}

function finalizeRow(): FinalizeGuildEmergencyElectionRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    election_id: 'election-1',
    guild_id: 'guild-1',
    new_leader_hero_id: 'candidate-hero-1',
    old_leader_hero_id: 'leader-hero-1',
    status_key: 'completed',
    winning_vote_count: 2,
  };
}
