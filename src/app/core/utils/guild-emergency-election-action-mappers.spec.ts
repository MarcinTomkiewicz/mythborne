import {
  FinalizeGuildEmergencyElectionRpcRow,
  NominateGuildEmergencyLeaderCandidateRpcRow,
  StartGuildEmergencyElectionRpcRow,
  StartGuildEmergencyElectionVotingRpcRow,
  VoteGuildEmergencyElectionRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildEmergencyElectionFinalizeResult,
  mapGuildEmergencyElectionNominationResult,
  mapGuildEmergencyElectionStartResult,
  mapGuildEmergencyElectionVoteResult,
  mapGuildEmergencyElectionVotingStartResult,
  toFinalizeGuildEmergencyElectionRpcArgs,
  toNominateGuildEmergencyLeaderCandidateRpcArgs,
  toStartGuildEmergencyElectionRpcArgs,
  toStartGuildEmergencyElectionVotingRpcArgs,
  toVoteGuildEmergencyElectionRpcArgs,
} from './guild-emergency-election-action-mappers';

describe('guild emergency election action mappers', () => {
  it('maps election action RPC args with trimmed optional text', () => {
    expect(toStartGuildEmergencyElectionRpcArgs('hero-1', {
      reason: ' Leader inactive. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_reason: 'Leader inactive.',
      p_request_id: 'request-1',
    });

    expect(toNominateGuildEmergencyLeaderCandidateRpcArgs('hero-1', {
      electionId: ' election-1 ',
      candidateHeroId: ' candidate-hero-1 ',
      reason: ' Nominate. ',
    })).toEqual(jasmine.objectContaining({
      p_actor_hero_id: 'hero-1',
      p_election_id: 'election-1',
      p_candidate_hero_id: 'candidate-hero-1',
      p_reason: 'Nominate.',
    }));

    expect(toStartGuildEmergencyElectionVotingRpcArgs('hero-1', {
      electionId: ' election-1 ',
      reason: '',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_election_id: 'election-1',
      p_reason: undefined,
      p_request_id: undefined,
    });

    expect(toVoteGuildEmergencyElectionRpcArgs('hero-2', {
      electionId: ' election-1 ',
      candidateHeroId: ' candidate-hero-1 ',
      requestId: ' request-2 ',
    })).toEqual(jasmine.objectContaining({
      p_voter_hero_id: 'hero-2',
      p_election_id: 'election-1',
      p_candidate_hero_id: 'candidate-hero-1',
      p_request_id: 'request-2',
    }));

    expect(toFinalizeGuildEmergencyElectionRpcArgs('hero-1', {
      electionId: ' election-1 ',
    })).toEqual(jasmine.objectContaining({
      p_actor_hero_id: 'hero-1',
      p_election_id: 'election-1',
    }));
  });

  it('requires election and candidate ids where the RPC contract needs them', () => {
    expect(() =>
      toNominateGuildEmergencyLeaderCandidateRpcArgs('hero-1', {
        electionId: '',
        candidateHeroId: 'candidate-hero-1',
      })
    ).toThrowError('election id is required.');

    expect(() =>
      toVoteGuildEmergencyElectionRpcArgs('hero-1', {
        electionId: 'election-1',
        candidateHeroId: '',
      })
    ).toThrowError('candidate hero id is required.');
  });

  it('maps election action results without exposing audit log id', () => {
    const results = [
      mapGuildEmergencyElectionStartResult(startRow()),
      mapGuildEmergencyElectionNominationResult(nominationRow()),
      mapGuildEmergencyElectionVotingStartResult(votingStartRow()),
      mapGuildEmergencyElectionVoteResult(voteRow()),
      mapGuildEmergencyElectionFinalizeResult(finalizeRow()),
    ];

    expect(results[0]).toEqual(jasmine.objectContaining({
      kind: 'start',
      electionId: 'election-1',
      statusKey: 'nomination',
    }));
    expect(results[1]).toEqual(jasmine.objectContaining({
      kind: 'nomination',
      candidateHeroId: 'candidate-hero-1',
      maxCandidates: 3,
    }));
    expect(results[2]).toEqual(jasmine.objectContaining({
      kind: 'start-voting',
      statusKey: 'voting',
      nominationCount: 1,
    }));
    expect(results[3]).toEqual(jasmine.objectContaining({
      kind: 'vote',
      voterHeroId: 'voter-hero-1',
    }));
    expect(results[4]).toEqual(jasmine.objectContaining({
      kind: 'finalize',
      newLeaderHeroId: 'candidate-hero-1',
      winningVoteCount: 2,
    }));
    expect(JSON.stringify(results)).not.toContain('audit-log-1');
    expect(JSON.stringify(results)).not.toContain('quorum');
  });
});

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
    nominated_by_hero_id: 'nominator-hero-1',
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
    voter_hero_id: 'voter-hero-1',
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
