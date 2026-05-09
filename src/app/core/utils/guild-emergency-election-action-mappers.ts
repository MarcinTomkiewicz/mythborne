import {
  FinalizeGuildEmergencyElectionInput,
  GuildEmergencyElectionFinalizeResult,
  GuildEmergencyElectionNominationResult,
  GuildEmergencyElectionStartResult,
  GuildEmergencyElectionVoteResult,
  GuildEmergencyElectionVotingStartResult,
  NominateGuildEmergencyLeaderCandidateInput,
  StartGuildEmergencyElectionInput,
  StartGuildEmergencyElectionVotingInput,
  VoteGuildEmergencyElectionInput,
} from '../domain/guild/guild-emergency-election.model';
import {
  FinalizeGuildEmergencyElectionRpcArgs,
  FinalizeGuildEmergencyElectionRpcRow,
  NominateGuildEmergencyLeaderCandidateRpcArgs,
  NominateGuildEmergencyLeaderCandidateRpcRow,
  StartGuildEmergencyElectionRpcArgs,
  StartGuildEmergencyElectionRpcRow,
  StartGuildEmergencyElectionVotingRpcArgs,
  StartGuildEmergencyElectionVotingRpcRow,
  VoteGuildEmergencyElectionRpcArgs,
  VoteGuildEmergencyElectionRpcRow,
} from '../types/guild-rpc.types';

export function toStartGuildEmergencyElectionRpcArgs(
  actorHeroId: string,
  input: StartGuildEmergencyElectionInput = {},
): StartGuildEmergencyElectionRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toNominateGuildEmergencyLeaderCandidateRpcArgs(
  actorHeroId: string,
  input: NominateGuildEmergencyLeaderCandidateInput,
): NominateGuildEmergencyLeaderCandidateRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_election_id: requiredText(input.electionId, 'election id'),
    p_candidate_hero_id: requiredText(input.candidateHeroId, 'candidate hero id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toStartGuildEmergencyElectionVotingRpcArgs(
  actorHeroId: string,
  input: StartGuildEmergencyElectionVotingInput,
): StartGuildEmergencyElectionVotingRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_election_id: requiredText(input.electionId, 'election id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toVoteGuildEmergencyElectionRpcArgs(
  voterHeroId: string,
  input: VoteGuildEmergencyElectionInput,
): VoteGuildEmergencyElectionRpcArgs {
  return {
    p_voter_hero_id: voterHeroId,
    p_election_id: requiredText(input.electionId, 'election id'),
    p_candidate_hero_id: requiredText(input.candidateHeroId, 'candidate hero id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toFinalizeGuildEmergencyElectionRpcArgs(
  actorHeroId: string,
  input: FinalizeGuildEmergencyElectionInput,
): FinalizeGuildEmergencyElectionRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_election_id: requiredText(input.electionId, 'election id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildEmergencyElectionStartResult(
  row: StartGuildEmergencyElectionRpcRow,
): GuildEmergencyElectionStartResult {
  return {
    kind: 'start',
    electionId: row.election_id,
    guildId: row.guild_id,
    inactiveLeaderHeroId: row.inactive_leader_hero_id,
    statusKey: row.status_key,
    nominationEndsAt: row.nomination_ends_at,
    votingEndsAt: nullableText(row.voting_ends_at),
  };
}

export function mapGuildEmergencyElectionNominationResult(
  row: NominateGuildEmergencyLeaderCandidateRpcRow,
): GuildEmergencyElectionNominationResult {
  return {
    kind: 'nomination',
    electionId: row.election_id,
    guildId: row.guild_id,
    nominationId: row.nomination_id,
    candidateHeroId: row.candidate_hero_id,
    nominatedByHeroId: row.nominated_by_hero_id,
    nominationCount: row.nomination_count,
    maxCandidates: row.max_candidates,
  };
}

export function mapGuildEmergencyElectionVotingStartResult(
  row: StartGuildEmergencyElectionVotingRpcRow,
): GuildEmergencyElectionVotingStartResult {
  return {
    kind: 'start-voting',
    electionId: row.election_id,
    guildId: row.guild_id,
    statusKey: row.status_key,
    nominationCount: row.nomination_count,
    votingStartsAt: row.voting_starts_at,
    votingEndsAt: row.voting_ends_at,
  };
}

export function mapGuildEmergencyElectionVoteResult(
  row: VoteGuildEmergencyElectionRpcRow,
): GuildEmergencyElectionVoteResult {
  return {
    kind: 'vote',
    electionId: row.election_id,
    guildId: row.guild_id,
    voteId: row.vote_id,
    voterHeroId: row.voter_hero_id,
    candidateHeroId: row.candidate_hero_id,
  };
}

export function mapGuildEmergencyElectionFinalizeResult(
  row: FinalizeGuildEmergencyElectionRpcRow,
): GuildEmergencyElectionFinalizeResult {
  return {
    kind: 'finalize',
    electionId: row.election_id,
    guildId: row.guild_id,
    statusKey: row.status_key,
    oldLeaderHeroId: row.old_leader_hero_id,
    newLeaderHeroId: row.new_leader_hero_id,
    winningVoteCount: row.winning_vote_count,
  };
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function requiredText(value: string, label: string): string {
  const trimmed = nullableText(value);

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}
