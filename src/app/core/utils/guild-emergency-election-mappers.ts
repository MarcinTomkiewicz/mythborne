import {
  GuildEmergencyElectionCandidate,
  GuildEmergencyElectionReadModel,
  GuildEmergencyElectionSummary,
} from '../domain/guild/guild-emergency-election.model';
import {
  GetHeroGuildEmergencyElectionCandidateRowsRpcRow,
  GetHeroGuildEmergencyElectionSummaryRpcRow,
} from '../types/guild-rpc.types';

export function mapGuildEmergencyElectionReadModel(
  summaryRows: readonly GetHeroGuildEmergencyElectionSummaryRpcRow[],
  candidateRows: readonly GetHeroGuildEmergencyElectionCandidateRowsRpcRow[],
): GuildEmergencyElectionReadModel {
  const summaryRow = summaryRows[0];

  if (!summaryRow) {
    return {
      summary: null,
      candidates: [],
    };
  }

  const summary = mapGuildEmergencyElectionSummary(summaryRow);

  return {
    summary,
    candidates: candidateRows
      .filter((row) => row.election_id === summary.electionId)
      .map(mapGuildEmergencyElectionCandidate),
  };
}

export function mapGuildEmergencyElectionSummary(
  row: GetHeroGuildEmergencyElectionSummaryRpcRow,
): GuildEmergencyElectionSummary {
  return {
    electionId: row.election_id,
    guildId: row.guild_id,
    statusKey: row.status_key,
    inactiveLeaderHeroId: row.inactive_leader_hero_id,
    inactiveLeaderHeroName: row.inactive_leader_hero_name,
    startedByHeroId: row.started_by_hero_id,
    startedByHeroName: row.started_by_hero_name,
    nominationStartsAt: row.nomination_starts_at,
    nominationEndsAt: row.nomination_ends_at,
    votingStartsAt: nullableText(row.voting_starts_at),
    votingEndsAt: nullableText(row.voting_ends_at),
    nominationCount: row.nomination_count,
    voteCount: row.vote_count,
    maxCandidates: row.max_candidates,
    myVoteCandidateHeroId: nullableText(row.my_vote_candidate_hero_id),
    canNominate: row.can_nominate,
    canStartVoting: row.can_start_voting,
    canVote: row.can_vote,
    canFinalize: row.can_finalize,
  };
}

export function mapGuildEmergencyElectionCandidate(
  row: GetHeroGuildEmergencyElectionCandidateRowsRpcRow,
): GuildEmergencyElectionCandidate {
  return {
    electionId: row.election_id,
    guildId: row.guild_id,
    nominationId: row.nomination_id,
    candidateHeroId: row.candidate_hero_id,
    candidateHeroName: row.candidate_hero_name,
    nominatedByHeroId: row.nominated_by_hero_id,
    nominatedByHeroName: row.nominated_by_hero_name,
    createdAt: row.created_at,
    voteCount: row.vote_count,
    isMyCandidate: row.is_my_candidate,
    isMyVote: row.is_my_vote,
  };
}

function nullableText(value: string | null): string | null {
  return value?.trim() || null;
}
