import { Database, Json } from '../../types/database.types';

export type ModerationActionStatus =
  Database['public']['Enums']['moderation_action_status'];

export interface ModerationActionType {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  scopeRequired: boolean;
  moderatorCanApply: boolean;
  operatorCanApply: boolean;
  isWarning: boolean;
  isRestriction: boolean;
  isSuspension: boolean;
  isBan: boolean;
  isSevere: boolean;
  isStaffDisqualifying: boolean;
  defaultDurationMinutes: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationAction {
  id: string;
  serverId: string;
  actionTypeKey: string;
  targetUserId: string;
  targetHeroId: string | null;
  scopeKey: string | null;
  reason: string;
  operatorNotes: string | null;
  playerVisibleNote: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  sourceSnapshotId: string | null;
  metadataJson: Json;
  status: ModerationActionStatus;
  statusReason: string | null;
  startsAt: string;
  expiresAt: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  createdByUserId: string | null;
  createdAt: string;
  isStaffDisqualifying: boolean;
}

export interface CreateModerationActionInput {
  serverId: string;
  actionTypeKey: string;
  targetUserId: string;
  targetHeroId: string | null;
  scopeKey: string | null;
  reason: string;
  operatorNotes: string | null;
  playerVisibleNote: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  sourceSnapshotId: string | null;
  expiresAt: string | null;
  metadataJson: Json | undefined;
}

export interface ModerationActionHistoryFilter {
  serverId: string;
  targetUserId: string | null;
  targetHeroId: string | null;
}

export type ModerationActionHistoryMode = 'visible' | 'full_user' | 'full_hero';

export interface FullUserModerationHistoryFilter {
  serverId: string;
  userId: string;
}

export interface FullHeroModerationHistoryFilter {
  serverId: string;
  heroId: string;
}

export interface ModerationUserTarget {
  userId: string;
  displayName: string;
  email: string | null;
  primaryHeroId: string | null;
  primaryHeroName: string | null;
  hasVisibleModerationHistory: boolean;
  matchKind: string;
  technicalLabel: string;
  label: string;
  description: string;
}

export interface ModerationHeroTarget {
  heroId: string;
  heroName: string;
  userId: string;
  userDisplayName: string;
  email: string | null;
  hasVisibleModerationHistory: boolean;
  matchKind: string;
  technicalLabel: string;
  label: string;
  description: string;
}

export interface ModerationItemTarget {
  itemId: string;
  itemDisplayName: string;
  itemStatus: string;
  itemValue: number;
  ownerHeroId: string;
  ownerHeroName: string;
  ownerUserId: string;
  ownerDisplayName: string;
  relatedAuctionListingId: string | null;
  relatedTradeOfferId: string | null;
  matchKind: string;
  technicalLabel: string;
  label: string;
  description: string;
}

export interface ModerationTargetSearchInput {
  serverId: string;
  query: string;
  limit: number;
}
