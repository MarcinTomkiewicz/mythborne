import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { CurrentGuildReadModel } from '../../domain/guild/guild.model';
import {
  GuildEmergencyElectionOperationResult,
  GuildEmergencyElectionReadModel,
} from '../../domain/guild/guild-emergency-election.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildEmergencyElectionState } from './guild-emergency-election.state';
import { PlayerGuildElectionActions } from './player-guild-election-actions';
import { PlayerGuildElections } from './player-guild-elections';

describe('GuildEmergencyElectionState', () => {
  let state: GuildEmergencyElectionState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuildReadModel: ReturnType<typeof signal<CurrentGuildReadModel | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let playerGuildElectionActions: jasmine.SpyObj<PlayerGuildElectionActions>;
  let playerGuildElections: jasmine.SpyObj<PlayerGuildElections>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuildReadModel = signal<CurrentGuildReadModel | null>(currentGuildModel());
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    Object.defineProperty(currentGuild, 'readModel', {
      value: currentGuildReadModel.asReadonly(),
    });
    playerGuildElectionActions = jasmine.createSpyObj<PlayerGuildElectionActions>(
      'PlayerGuildElectionActions',
      [
        'finalizeEmergencyElectionForActiveHero',
        'nominateEmergencyLeaderCandidateForActiveHero',
        'startEmergencyElectionForActiveHero',
        'startEmergencyElectionVotingForActiveHero',
        'voteEmergencyElectionForActiveHero',
      ],
    );
    playerGuildElections = jasmine.createSpyObj<PlayerGuildElections>(
      'PlayerGuildElections',
      ['getActiveHeroEmergencyElection'],
    );

    TestBed.configureTestingModule({
      providers: [
        GuildEmergencyElectionState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: PlayerGuildElectionActions, useValue: playerGuildElectionActions },
        { provide: PlayerGuildElections, useValue: playerGuildElections },
      ],
    });

    state = TestBed.inject(GuildEmergencyElectionState);
  });

  it('loads current emergency election read state', () => {
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      of(readModel()),
    );

    state.load();

    expect(playerGuildElections.getActiveHeroEmergencyElection).toHaveBeenCalled();
    expect(state.summary()?.electionId).toBe('election-1');
    expect(state.candidates()[0].candidateHeroId).toBe('candidate-hero-1');
    expect(state.statusKey()).toBe('nomination');
    expect(state.canStartElection()).toBeTrue();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('represents no active emergency election without candidates', () => {
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      of({ summary: null, candidates: [] }),
    );

    state.load();

    expect(state.summary()).toBeNull();
    expect(state.candidates()).toEqual([]);
    expect(state.hasActiveElection()).toBeFalse();
  });

  it('ignores stale load success after active hero changes and clears election data', () => {
    const response = new Subject<GuildEmergencyElectionReadModel>();
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      response.asObservable(),
    );
    state.summary.set(readModel().summary);
    state.candidates.set(readModel().candidates);

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next(readModel({
      summary: { ...readModel().summary!, electionId: 'stale-election' },
    }));

    expect(state.summary()).toBeNull();
    expect(state.candidates()).toEqual([]);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('requires active hero context before loading', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.summary.set(readModel().summary);
    state.candidates.set(readModel().candidates);

    state.load();

    expect(playerGuildElections.getActiveHeroEmergencyElection).not.toHaveBeenCalled();
    expect(state.summary()).toBeNull();
    expect(state.candidates()).toEqual([]);
    expect(state.error()).toBe('No active hero for guild emergency election.');
    expect(state.isLoading()).toBeFalse();
  });

  it('surfaces current emergency election load errors', () => {
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      throwError(() => new Error('Election read failed.')),
    );

    state.load();

    expect(state.error()).toBe('Election read failed.');
    expect(state.isLoading()).toBeFalse();
  });

  it('starts election, reloads read state, and refreshes current guild', () => {
    playerGuildElectionActions.startEmergencyElectionForActiveHero.and.returnValue(
      of(startOperation()),
    );
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      of(readModel()),
    );

    state.start({ reason: 'Leader inactive.' });

    expect(playerGuildElectionActions.startEmergencyElectionForActiveHero)
      .toHaveBeenCalledWith({ reason: 'Leader inactive.' });
    expect(playerGuildElections.getActiveHeroEmergencyElection).toHaveBeenCalled();
    expect(currentGuild.load).toHaveBeenCalled();
    expect(state.lastResult()?.kind).toBe('start');
    expect(state.message()).toBe('Guild emergency election started.');
    expect(state.isMutating()).toBeFalse();
  });

  it('nominates, starts voting, votes, and finalizes through election service', () => {
    playerGuildElectionActions.nominateEmergencyLeaderCandidateForActiveHero
      .and.returnValue(of(nominationOperation()));
    playerGuildElectionActions.startEmergencyElectionVotingForActiveHero
      .and.returnValue(of(votingStartOperation()));
    playerGuildElectionActions.voteEmergencyElectionForActiveHero
      .and.returnValue(of(voteOperation()));
    playerGuildElectionActions.finalizeEmergencyElectionForActiveHero
      .and.returnValue(of(finalizeOperation()));
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      of(readModel()),
    );

    state.nominate({ electionId: 'election-1', candidateHeroId: 'candidate-hero-1' });
    state.startVoting({ electionId: 'election-1' });
    state.vote({ electionId: 'election-1', candidateHeroId: 'candidate-hero-1' });
    state.finalize({ electionId: 'election-1' });

    expect(playerGuildElectionActions.nominateEmergencyLeaderCandidateForActiveHero)
      .toHaveBeenCalledWith({
        electionId: 'election-1',
        candidateHeroId: 'candidate-hero-1',
      });
    expect(playerGuildElectionActions.startEmergencyElectionVotingForActiveHero)
      .toHaveBeenCalledWith({ electionId: 'election-1' });
    expect(playerGuildElectionActions.voteEmergencyElectionForActiveHero)
      .toHaveBeenCalledWith({
        electionId: 'election-1',
        candidateHeroId: 'candidate-hero-1',
      });
    expect(playerGuildElectionActions.finalizeEmergencyElectionForActiveHero)
      .toHaveBeenCalledWith({ electionId: 'election-1' });
    expect(currentGuild.load).toHaveBeenCalledTimes(4);
    expect(state.lastResult()?.kind).toBe('finalize');
    expect(state.message()).toBe('Guild emergency election finalized.');
  });

  it('surfaces current emergency election mutation errors', () => {
    playerGuildElectionActions.startEmergencyElectionForActiveHero.and.returnValue(
      throwError(() => new Error('Leader is still active.')),
    );

    state.start();

    expect(state.error()).toBe('Leader is still active.');
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('ignores stale mutation success after active server changes', () => {
    const response = new Subject<GuildEmergencyElectionOperationResult>();
    playerGuildElectionActions.startEmergencyElectionForActiveHero.and.returnValue(
      response.asObservable() as ReturnType<
        PlayerGuildElectionActions['startEmergencyElectionForActiveHero']
      >,
    );
    playerGuildElections.getActiveHeroEmergencyElection.and.returnValue(
      of(readModel()),
    );
    state.summary.set(readModel().summary);
    state.candidates.set(readModel().candidates);

    state.start();
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(startOperation());

    expect(state.summary()).toBeNull();
    expect(state.candidates()).toEqual([]);
    expect(state.lastResult()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.summary.set(readModel().summary);

    state.start();

    expect(playerGuildElectionActions.startEmergencyElectionForActiveHero)
      .not.toHaveBeenCalled();
    expect(state.summary()).toBeNull();
    expect(state.error()).toBe('No active hero for guild emergency election.');
    expect(state.isMutating()).toBeFalse();
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

function currentGuildModel(): CurrentGuildReadModel {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    state: {
      heroId: 'hero-1',
      serverId: 'server-1',
      guild: null,
      membership: null,
      canCreateGuild: false,
      permissions: {
        canInvite: false,
        canManageArmory: false,
        canManageMembers: false,
        canStartEmergencyElection: false,
      },
    },
    detail: {
      guildId: 'guild-1',
      serverId: 'server-1',
      name: 'Argonauts',
      tag: 'ARGO',
      statusKey: 'active',
      memberCount: 12,
      memberLimit: 30,
      currentHeroId: 'hero-1',
      currentMembershipId: 'membership-1',
      currentMembershipStatusKey: 'active',
      currentRoleKey: 'officer',
      currentRoleLabel: 'Officer',
      armoryAvailableCount: 0,
      armoryBorrowedCount: 0,
      myActiveLoanCount: 0,
      myArmoryAccessStatusKey: 'allowed',
      myDepositedItemCount: 0,
      pendingInviteCount: 0,
      pendingJoinRequestCount: 0,
      activeElectionId: null,
      activeElectionStatusKey: null,
      permissions: {
        canInvite: true,
        canManageArmory: false,
        canManageMembers: false,
        canStartEmergencyElection: true,
      },
    },
  };
}

function readModel(
  overrides: Partial<GuildEmergencyElectionReadModel> = {},
): GuildEmergencyElectionReadModel {
  return {
    summary: {
      electionId: 'election-1',
      guildId: 'guild-1',
      statusKey: 'nomination',
      inactiveLeaderHeroId: 'leader-hero-1',
      inactiveLeaderHeroName: 'Inactive Leader',
      startedByHeroId: 'starter-hero-1',
      startedByHeroName: 'Starter Hero',
      nominationStartsAt: '2026-05-09T10:00:00.000Z',
      nominationEndsAt: '2026-05-09T11:00:00.000Z',
      votingStartsAt: null,
      votingEndsAt: null,
      nominationCount: 1,
      voteCount: 0,
      maxCandidates: 3,
      myVoteCandidateHeroId: null,
      canNominate: true,
      canStartVoting: false,
      canVote: false,
      canFinalize: false,
    },
    candidates: [
      {
        electionId: 'election-1',
        guildId: 'guild-1',
        nominationId: 'nomination-1',
        candidateHeroId: 'candidate-hero-1',
        candidateHeroName: 'Candidate Hero',
        nominatedByHeroId: 'nominator-hero-1',
        nominatedByHeroName: 'Nominator Hero',
        createdAt: '2026-05-09T10:15:00.000Z',
        voteCount: 2,
        isMyCandidate: true,
        isMyVote: false,
      },
    ],
    ...overrides,
  };
}

function startOperation() {
  return {
    kind: 'start',
    electionId: 'election-1',
    guildId: 'guild-1',
    inactiveLeaderHeroId: 'leader-hero-1',
    statusKey: 'nomination',
    nominationEndsAt: '2026-05-09T16:00:00.000Z',
    votingEndsAt: null,
  } as const;
}

function nominationOperation() {
  return {
    kind: 'nomination',
    electionId: 'election-1',
    guildId: 'guild-1',
    nominationId: 'nomination-1',
    candidateHeroId: 'candidate-hero-1',
    nominatedByHeroId: 'hero-1',
    nominationCount: 1,
    maxCandidates: 3,
  } as const;
}

function votingStartOperation() {
  return {
    kind: 'start-voting',
    electionId: 'election-1',
    guildId: 'guild-1',
    statusKey: 'voting',
    nominationCount: 1,
    votingStartsAt: '2026-05-09T16:00:00.000Z',
    votingEndsAt: '2026-05-10T04:00:00.000Z',
  } as const;
}

function voteOperation() {
  return {
    kind: 'vote',
    electionId: 'election-1',
    guildId: 'guild-1',
    voteId: 'vote-1',
    voterHeroId: 'hero-1',
    candidateHeroId: 'candidate-hero-1',
  } as const;
}

function finalizeOperation() {
  return {
    kind: 'finalize',
    electionId: 'election-1',
    guildId: 'guild-1',
    statusKey: 'completed',
    oldLeaderHeroId: 'leader-hero-1',
    newLeaderHeroId: 'candidate-hero-1',
    winningVoteCount: 2,
  } as const;
}
