import {
  PlayerRelationshipDeclarationDecisionInput,
  PlayerRelationshipDeclarationStatus,
} from './anti-abuse-decision.model';
import {
  PlayerRelationshipDeclarationItemView,
  PlayerRelationshipDeclarationTradeView,
} from './player-relationship-declaration-view.model';

export interface StaffPlayerRelationshipDeclarationParticipantView {
  id: string;
  declarationId: string;
  heroId: string | null;
  userId: string | null;
  roleKey: string;
  reason: string | null;
  description: string | null;
  createdAt: string;
}

export interface StaffPlayerRelationshipDeclarationReviewDetail {
  id: string;
  serverId: string;
  declarationTypeKey: string;
  declarationTypeLabel: string;
  declarationTypeAdminDescription: string | null;
  title: string;
  description: string;
  status: PlayerRelationshipDeclarationStatus;
  statusLabel: string;
  statusReason: string | null;
  adminNotes: string | null;
  playerStatusMessage: string | null;
  amountCharacterPoints: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  revokedAt: string | null;
  completedAt: string | null;
  createdByHeroId: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  participants: readonly StaffPlayerRelationshipDeclarationParticipantView[];
  items: readonly PlayerRelationshipDeclarationItemView[];
  trades: readonly PlayerRelationshipDeclarationTradeView[];
}

export interface StaffPlayerRelationshipDeclarationDetailInput {
  serverId: string;
  declarationId: string;
}

export interface StaffPlayerRelationshipDeclarationDecisionInput
  extends PlayerRelationshipDeclarationDecisionInput {
  serverId: string;
}
