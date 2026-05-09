import { GuildEmergencyElectionStatusKey } from '../../types/guild-rpc.types';

export interface GuildEmergencyElectionSummary {
  electionId: string;
  guildId: string;
  statusKey: GuildEmergencyElectionStatusKey;
  inactiveLeaderHeroId: string;
  inactiveLeaderHeroName: string;
  startedByHeroId: string;
  startedByHeroName: string;
  nominationStartsAt: string;
  nominationEndsAt: string;
  votingStartsAt: string | null;
  votingEndsAt: string | null;
  nominationCount: number;
  voteCount: number;
  maxCandidates: number;
  myVoteCandidateHeroId: string | null;
  canNominate: boolean;
  canStartVoting: boolean;
  canVote: boolean;
  canFinalize: boolean;
}

export interface GuildEmergencyElectionCandidate {
  electionId: string;
  guildId: string;
  nominationId: string;
  candidateHeroId: string;
  candidateHeroName: string;
  nominatedByHeroId: string;
  nominatedByHeroName: string;
  createdAt: string;
  voteCount: number;
  isMyCandidate: boolean;
  isMyVote: boolean;
}

export interface GuildEmergencyElectionReadModel {
  summary: GuildEmergencyElectionSummary | null;
  candidates: GuildEmergencyElectionCandidate[];
}

export interface StartGuildEmergencyElectionInput {
  reason?: string | null;
  requestId?: string | null;
}

export interface NominateGuildEmergencyLeaderCandidateInput {
  electionId: string;
  candidateHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface StartGuildEmergencyElectionVotingInput {
  electionId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface VoteGuildEmergencyElectionInput {
  electionId: string;
  candidateHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface FinalizeGuildEmergencyElectionInput {
  electionId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildEmergencyElectionStartResult {
  kind: 'start';
  electionId: string;
  guildId: string;
  inactiveLeaderHeroId: string;
  statusKey: GuildEmergencyElectionStatusKey;
  nominationEndsAt: string;
  votingEndsAt: string | null;
}

export interface GuildEmergencyElectionNominationResult {
  kind: 'nomination';
  electionId: string;
  guildId: string;
  nominationId: string;
  candidateHeroId: string;
  nominatedByHeroId: string;
  nominationCount: number;
  maxCandidates: number;
}

export interface GuildEmergencyElectionVotingStartResult {
  kind: 'start-voting';
  electionId: string;
  guildId: string;
  statusKey: GuildEmergencyElectionStatusKey;
  nominationCount: number;
  votingStartsAt: string;
  votingEndsAt: string;
}

export interface GuildEmergencyElectionVoteResult {
  kind: 'vote';
  electionId: string;
  guildId: string;
  voteId: string;
  voterHeroId: string;
  candidateHeroId: string;
}

export interface GuildEmergencyElectionFinalizeResult {
  kind: 'finalize';
  electionId: string;
  guildId: string;
  statusKey: GuildEmergencyElectionStatusKey;
  oldLeaderHeroId: string;
  newLeaderHeroId: string;
  winningVoteCount: number;
}

export type GuildEmergencyElectionOperationResult =
  | GuildEmergencyElectionStartResult
  | GuildEmergencyElectionNominationResult
  | GuildEmergencyElectionVotingStartResult
  | GuildEmergencyElectionVoteResult
  | GuildEmergencyElectionFinalizeResult;
