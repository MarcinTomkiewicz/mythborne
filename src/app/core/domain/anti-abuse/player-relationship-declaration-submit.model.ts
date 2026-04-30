export interface PlayerRelationshipDeclarationParticipantInput {
  heroId?: string | null;
  userId?: string | null;
  roleKey: string;
  reason?: string | null;
  description?: string | null;
}

export interface PlayerRelationshipDeclarationItemInput {
  itemId?: string | null;
  itemNameSnapshot?: string | null;
  roleKey?: string | null;
  reason?: string | null;
  description?: string | null;
}

export interface PlayerRelationshipDeclarationTradeInput {
  tradeId?: string | null;
  tradeReference?: string | null;
  roleKey?: string | null;
  reason?: string | null;
  description?: string | null;
}

export interface CreatePlayerRelationshipDeclarationInput {
  serverId: string;
  declarationTypeKey: string;
  title: string;
  description: string;
  createdByHeroId: string;
  amountCharacterPoints?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  participants?: readonly PlayerRelationshipDeclarationParticipantInput[] | null;
  items?: readonly PlayerRelationshipDeclarationItemInput[] | null;
  trades?: readonly PlayerRelationshipDeclarationTradeInput[] | null;
  requestId?: string | null;
}

export interface CreatedPlayerRelationshipDeclaration {
  declarationId: string;
}
