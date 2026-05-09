import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  GetHeroGuildEmergencyElectionCandidateRowsRpcRow,
  GetHeroGuildEmergencyElectionSummaryRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildElections } from './player-guild-elections';

describe('PlayerGuildElections', () => {
  let service: PlayerGuildElections;
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
        PlayerGuildElections,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildElections);
  });

  it('loads active emergency election through canonical read RPCs', async () => {
    backend.rpc.and.returnValues(of([summaryRow()]), of([candidateRow()]));

    const result = await firstValueFrom(service.getActiveHeroEmergencyElection());

    expect(backend.rpc).toHaveBeenCalledWith(
      'get_hero_guild_emergency_election_summary',
      { p_hero_id: 'hero-1' },
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'get_hero_guild_emergency_election_candidate_rows',
      { p_hero_id: 'hero-1' },
    );
    expect(result.summary?.electionId).toBe('election-1');
    expect(result.candidates[0].candidateHeroId).toBe('candidate-hero-1');
  });

  it('maps no active election without fabricating a candidate list', async () => {
    backend.rpc.and.returnValues(of([]), of([candidateRow()]));

    const result = await firstValueFrom(service.getHeroEmergencyElection('hero-1'));

    expect(result.summary).toBeNull();
    expect(result.candidates).toEqual([]);
  });

  it('rejects stale active hero context after RPC response', async () => {
    const summaryResponse =
      new Subject<GetHeroGuildEmergencyElectionSummaryRpcRow[]>();
    const candidateResponse =
      new Subject<GetHeroGuildEmergencyElectionCandidateRowsRpcRow[]>();
    backend.rpc.and.returnValues(
      summaryResponse.asObservable(),
      candidateResponse.asObservable(),
    );

    const result = firstValueFrom(service.getActiveHeroEmergencyElection());
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    summaryResponse.next([summaryRow()]);
    summaryResponse.complete();
    candidateResponse.next([candidateRow()]);
    candidateResponse.complete();

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

function summaryRow(): GetHeroGuildEmergencyElectionSummaryRpcRow {
  return {
    can_finalize: false,
    can_nominate: true,
    can_start_voting: false,
    can_vote: false,
    election_id: 'election-1',
    guild_id: 'guild-1',
    inactive_leader_hero_id: 'leader-hero-1',
    inactive_leader_hero_name: 'Inactive Leader',
    max_candidates: 3,
    my_vote_candidate_hero_id: '',
    nomination_count: 1,
    nomination_ends_at: '2026-05-09T11:00:00.000Z',
    nomination_starts_at: '2026-05-09T10:00:00.000Z',
    started_by_hero_id: 'starter-hero-1',
    started_by_hero_name: 'Starter Hero',
    status_key: 'nomination',
    vote_count: 0,
    voting_ends_at: '',
    voting_starts_at: '',
  };
}

function candidateRow(): GetHeroGuildEmergencyElectionCandidateRowsRpcRow {
  return {
    candidate_hero_id: 'candidate-hero-1',
    candidate_hero_name: 'Candidate Hero',
    created_at: '2026-05-09T10:15:00.000Z',
    election_id: 'election-1',
    guild_id: 'guild-1',
    is_my_candidate: true,
    is_my_vote: false,
    nominated_by_hero_id: 'nominator-hero-1',
    nominated_by_hero_name: 'Nominator Hero',
    nomination_id: 'nomination-1',
    vote_count: 2,
  };
}
