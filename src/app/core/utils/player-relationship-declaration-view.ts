import { PlayerRelationshipDeclarationTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  PlayerRelationshipDeclarationItemView,
  PlayerRelationshipDeclarationListItem,
  PlayerRelationshipDeclarationParticipantView,
  PlayerRelationshipDeclarationTradeView,
} from '../domain/anti-abuse/player-relationship-declaration-view.model';
import { Row } from '../types/supabase.types';
import { relationshipDeclarationStatusLabel } from './anti-abuse-decision-display';

export function mapPlayerRelationshipDeclarationListItem(
  row: Row<'player_relationship_declarations'>,
  links: {
    declarationTypes: readonly PlayerRelationshipDeclarationTypeEntry[];
    participants: readonly PlayerRelationshipDeclarationParticipantView[];
    items: readonly PlayerRelationshipDeclarationItemView[];
    trades: readonly PlayerRelationshipDeclarationTradeView[];
  },
): PlayerRelationshipDeclarationListItem {
  const declarationType = links.declarationTypes.find(
    (entry) => entry.key === row.declaration_type_key,
  );

  return {
    id: row.id,
    serverId: row.server_id,
    declarationTypeKey: row.declaration_type_key,
    declarationTypeLabel: declarationType?.label ?? row.declaration_type_key,
    title: row.title,
    description: row.description,
    status: row.status,
    statusLabel: relationshipDeclarationStatusLabel(row.status),
    playerStatusMessage: row.player_notes,
    amountCharacterPoints: row.amount_character_points,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    revokedAt: row.revoked_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: links.participants,
    items: links.items,
    trades: links.trades,
  };
}

export function mapPlayerRelationshipDeclarationParticipant(
  row: Row<'player_relationship_declaration_participants'>,
): PlayerRelationshipDeclarationParticipantView {
  return {
    id: row.id,
    declarationId: row.declaration_id,
    heroId: row.hero_id,
    roleKey: row.role_key,
    reason: row.reason,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function mapPlayerRelationshipDeclarationItem(
  row: Row<'player_relationship_declaration_items'>,
): PlayerRelationshipDeclarationItemView {
  return {
    id: row.id,
    declarationId: row.declaration_id,
    itemId: row.item_id,
    itemNameSnapshot: row.item_name_snapshot,
    roleKey: row.role_key,
    reason: row.reason,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function mapPlayerRelationshipDeclarationTrade(
  row: Row<'player_relationship_declaration_trades'>,
): PlayerRelationshipDeclarationTradeView {
  return {
    id: row.id,
    declarationId: row.declaration_id,
    tradeId: row.trade_id,
    tradeReference: row.trade_reference,
    roleKey: row.role_key,
    reason: row.reason,
    description: row.description,
    createdAt: row.created_at,
  };
}
