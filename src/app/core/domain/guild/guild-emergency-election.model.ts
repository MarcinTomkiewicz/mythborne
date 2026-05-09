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
