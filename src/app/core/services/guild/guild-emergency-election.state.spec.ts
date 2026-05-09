import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { CurrentGuildReadModel } from '../../domain/guild/guild.model';
import {
  GuildEmergencyElectionReadModel,
} from '../../domain/guild/guild-emergency-election.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildEmergencyElectionState } from './guild-emergency-election.state';
import { PlayerGuildElections } from './player-guild-elections';

describe('GuildEmergencyElectionState', () => {
  let state: GuildEmergencyElectionState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuildReadModel: ReturnType<typeof signal<CurrentGuildReadModel | null>>;
  let playerGuildElections: jasmine.SpyObj<PlayerGuildElections>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuildReadModel = signal<CurrentGuildReadModel | null>(currentGuildModel());
    playerGuildElections = jasmine.createSpyObj<PlayerGuildElections>(
      'PlayerGuildElections',
      ['getActiveHeroEmergencyElection'],
    );

    TestBed.configureTestingModule({
      providers: [
        GuildEmergencyElectionState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        {
          provide: CurrentGuildState,
          useValue: { readModel: currentGuildReadModel.asReadonly() },
        },
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
