import { PlayerRelationshipDeclarationStatus } from './anti-abuse-decision.model';

export interface PlayerRelationshipDeclarationParticipantView {
  id: string;
  declarationId: string;
  heroId: string | null;
  roleKey: string;
  reason: string | null;
  description: string | null;
  createdAt: string;
}

export interface PlayerRelationshipDeclarationItemView {
  id: string;
  declarationId: string;
  itemId: string | null;
  itemNameSnapshot: string | null;
  roleKey: string;
  reason: string | null;
  description: string | null;
  createdAt: string;
}

export interface PlayerRelationshipDeclarationTradeView {
  id: string;
  declarationId: string;
  tradeId: string | null;
  tradeReference: string | null;
  roleKey: string;
  reason: string | null;
  description: string | null;
  createdAt: string;
}

export interface PlayerRelationshipDeclarationListItem {
  id: string;
  serverId: string;
  declarationTypeKey: string;
  declarationTypeLabel: string;
  title: string;
  description: string;
  status: PlayerRelationshipDeclarationStatus;
  statusLabel: string;
  playerStatusMessage: string | null;
  amountCharacterPoints: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  revokedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: readonly PlayerRelationshipDeclarationParticipantView[];
  items: readonly PlayerRelationshipDeclarationItemView[];
  trades: readonly PlayerRelationshipDeclarationTradeView[];
}

export interface PlayerRelationshipDeclarationListInput {
  serverId: string;
  heroId: string;
  userId: string;
}
