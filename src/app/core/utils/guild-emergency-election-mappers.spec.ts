import {
  GetHeroGuildEmergencyElectionCandidateRowsRpcRow,
  GetHeroGuildEmergencyElectionSummaryRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildEmergencyElectionCandidate,
  mapGuildEmergencyElectionReadModel,
  mapGuildEmergencyElectionSummary,
} from './guild-emergency-election-mappers';

describe('guild emergency election mappers', () => {
  it('maps emergency election summary without adding quorum semantics', () => {
    const result = mapGuildEmergencyElectionSummary(summaryRow({
      my_vote_candidate_hero_id: '',
      voting_starts_at: '',
      voting_ends_at: '',
    }));

    expect(result).toEqual({
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
    });
    expect(JSON.stringify(result)).not.toContain('quorum');
  });

  it('maps emergency election candidate rows with vote flags', () => {
    expect(mapGuildEmergencyElectionCandidate(candidateRow())).toEqual({
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
    });
  });

  it('maps empty summary as no active emergency election', () => {
    expect(mapGuildEmergencyElectionReadModel([], [candidateRow()])).toEqual({
      summary: null,
      candidates: [],
    });
  });

  it('keeps candidates scoped to the active election id from summary', () => {
    const result = mapGuildEmergencyElectionReadModel(
      [summaryRow()],
      [
        candidateRow({ nomination_id: 'nomination-1' }),
        candidateRow({
          election_id: 'old-election',
          nomination_id: 'old-nomination',
        }),
      ],
    );

    expect(result.summary?.electionId).toBe('election-1');
    expect(result.candidates.map((candidate) => candidate.nominationId))
      .toEqual(['nomination-1']);
  });
});

function summaryRow(
  overrides: Partial<GetHeroGuildEmergencyElectionSummaryRpcRow> = {},
): GetHeroGuildEmergencyElectionSummaryRpcRow {
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
    my_vote_candidate_hero_id: 'candidate-hero-1',
    nomination_count: 1,
    nomination_ends_at: '2026-05-09T11:00:00.000Z',
    nomination_starts_at: '2026-05-09T10:00:00.000Z',
    started_by_hero_id: 'starter-hero-1',
    started_by_hero_name: 'Starter Hero',
    status_key: 'nomination',
    vote_count: 0,
    voting_ends_at: '',
    voting_starts_at: '',
    ...overrides,
  };
}

function candidateRow(
  overrides: Partial<GetHeroGuildEmergencyElectionCandidateRowsRpcRow> = {},
): GetHeroGuildEmergencyElectionCandidateRowsRpcRow {
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
    ...overrides,
  };
}
