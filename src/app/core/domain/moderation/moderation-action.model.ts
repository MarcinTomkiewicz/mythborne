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
