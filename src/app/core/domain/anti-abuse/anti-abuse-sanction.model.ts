import { Database } from '../../types/database.types';

export type AntiAbuseSanctionStatus =
  Database['public']['Enums']['anti_abuse_sanction_status'];

export interface CreateAntiAbuseSanctionInput {
  caseId: string;
  sanctionTypeKey: string;
  targetHeroId: string;
  targetUserId: string;
  reason: string;
  operatorNotes?: string | null;
  amountCharacterPoints?: number | null;
  durationDays?: number | null;
  sourceHeroId?: string | null;
  destinationHeroId?: string | null;
}

export interface AntiAbuseSanctionStatusInput {
  sanctionId: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string;
}

export interface CreateCharacterPointPenaltyInput {
  sanctionId: string;
  reason: string;
  operatorNotes?: string | null;
}

export interface CharacterPointPenaltyStatusInput {
  penaltyId: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string;
}

export interface AddAntiAbuseSanctionItemInput {
  sanctionId: string;
  itemId: string;
  reason: string;
  operatorNotes?: string | null;
  sourceHeroId?: string | null;
  destinationHeroId?: string | null;
}

export interface AntiAbuseSanctionDecision {
  id: string;
  caseId: string;
  sanctionTypeKey: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string | null;
  reason: string;
  operatorNotes: string | null;
  targetHeroId: string | null;
  targetUserId: string | null;
  sourceHeroId: string | null;
  destinationHeroId: string | null;
  amountCharacterPoints: number | null;
  durationDays: number | null;
  startsAt: string | null;
  endsAt: string | null;
  appliedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  forgivenAt: string | null;
  failedAt: string | null;
  imposedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterPointPenaltyDecision {
  id: string;
  sanctionId: string;
  caseId: string;
  serverId: string;
  heroId: string;
  userId: string | null;
  status: AntiAbuseSanctionStatus;
  statusReason: string | null;
  reason: string;
  operatorNotes: string | null;
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
  appliedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  forgivenAt: string | null;
  failedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AntiAbuseSanctionItemDecision {
  id: string;
  sanctionId: string;
  itemId: string;
  sourceHeroId: string | null;
  destinationHeroId: string | null;
  reason: string;
  operatorNotes: string | null;
  createdByUserId: string | null;
  createdAt: string;
}
