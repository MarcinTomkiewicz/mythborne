import { PlayerRelationshipDeclarationTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  StaffPlayerRelationshipDeclarationParticipantView,
  StaffPlayerRelationshipDeclarationReviewDetail,
} from '../domain/anti-abuse/player-relationship-declaration-review.model';
import {
  PlayerRelationshipDeclarationItemView,
  PlayerRelationshipDeclarationTradeView,
} from '../domain/anti-abuse/player-relationship-declaration-view.model';
import { Row } from '../types/supabase.types';
import { relationshipDeclarationStatusLabel } from './anti-abuse-decision-display';

export function mapStaffPlayerRelationshipDeclarationReviewDetail(
  row: Row<'player_relationship_declarations'>,
  links: {
    declarationTypes: readonly PlayerRelationshipDeclarationTypeEntry[];
    participants: readonly StaffPlayerRelationshipDeclarationParticipantView[];
    items: readonly PlayerRelationshipDeclarationItemView[];
    trades: readonly PlayerRelationshipDeclarationTradeView[];
  },
): StaffPlayerRelationshipDeclarationReviewDetail {
  const declarationType = links.declarationTypes.find(
    (entry) => entry.key === row.declaration_type_key,
  );

  return {
    id: row.id,
    serverId: row.server_id,
    declarationTypeKey: row.declaration_type_key,
    declarationTypeLabel: declarationType?.label ?? row.declaration_type_key,
    declarationTypeAdminDescription: declarationType?.adminDescription ?? null,
    title: row.title,
    description: row.description,
    status: row.status,
    statusLabel: relationshipDeclarationStatusLabel(row.status),
    statusReason: row.status_reason,
    adminNotes: row.admin_notes,
    playerStatusMessage: row.player_notes,
    amountCharacterPoints: row.amount_character_points,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedByUserId: row.reviewed_by_user_id,
    revokedAt: row.revoked_at,
    completedAt: row.completed_at,
    createdByHeroId: row.created_by_hero_id,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: links.participants,
    items: links.items,
    trades: links.trades,
  };
}

export function mapStaffPlayerRelationshipDeclarationParticipant(
  row: Row<'player_relationship_declaration_participants'>,
): StaffPlayerRelationshipDeclarationParticipantView {
  return {
    id: row.id,
    declarationId: row.declaration_id,
    heroId: row.hero_id,
    userId: row.user_id,
    roleKey: row.role_key,
    reason: row.reason,
    description: row.description,
    createdAt: row.created_at,
  };
}
