import {
  CreateModerationActionInput,
  ModerationAction,
  ModerationActionHistoryFilter,
  ModerationActionType,
} from '../domain/moderation/moderation-action.model';
import {
  CanApplyLocalModerationActionRpcArgs,
  CreateModerationActionRpcArgs,
  GetVisibleModerationActionsRpcArgs,
  ModerationActionRpcRow,
} from '../types/moderation-action-rpc.types';
import { Row } from '../types/supabase.types';
import { trimText, trimToNull } from './normalize-text';

export function mapModerationActionType(
  row: Row<'moderation_action_types'>,
): ModerationActionType {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    scopeRequired: row.scope_required,
    moderatorCanApply: row.moderator_can_apply,
    operatorCanApply: row.operator_can_apply,
    isWarning: row.is_warning,
    isRestriction: row.is_restriction,
    isSuspension: row.is_suspension,
    isBan: row.is_ban,
    isSevere: row.is_severe,
    isStaffDisqualifying: row.is_staff_disqualifying,
    defaultDurationMinutes: row.default_duration_minutes,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapModerationAction(row: ModerationActionRpcRow): ModerationAction {
  return {
    id: row.id,
    serverId: row.server_id,
    actionTypeKey: row.action_type_key,
    targetUserId: row.target_user_id,
    targetHeroId: row.target_hero_id,
    scopeKey: row.scope_key,
    reason: row.reason,
    operatorNotes: row.operator_notes,
    playerVisibleNote: row.player_visible_note,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    sourceSnapshotId: row.source_snapshot_id,
    metadataJson: row.metadata_json,
    status: row.status,
    statusReason: row.status_reason,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    resolvedAt: row.resolved_at,
    resolvedByUserId: row.resolved_by_user_id,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    isStaffDisqualifying: row.is_staff_disqualifying,
  };
}

export function toCreateModerationActionRpcArgs(
  input: CreateModerationActionInput,
): CreateModerationActionRpcArgs {
  const args: CreateModerationActionRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_action_type_key: requiredText(input.actionTypeKey, 'actionTypeKey'),
    p_target_user_id: requiredText(input.targetUserId, 'targetUserId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_target_hero_id', input.targetHeroId);
  addOptionalText(args, 'p_scope_key', input.scopeKey);
  addOptionalText(args, 'p_operator_notes', input.operatorNotes);
  addOptionalText(args, 'p_player_visible_note', input.playerVisibleNote);
  addOptionalText(args, 'p_source_entity_type', input.sourceEntityType);
  addOptionalText(args, 'p_source_entity_id', input.sourceEntityId);
  addOptionalText(args, 'p_source_snapshot_id', input.sourceSnapshotId);
  addOptionalText(args, 'p_expires_at', input.expiresAt);

  if (input.metadataJson !== undefined) {
    args.p_metadata_json = input.metadataJson;
  }

  return args;
}

export function toCanApplyLocalModerationActionRpcArgs(
  serverId: string,
  scopeKey: string,
): CanApplyLocalModerationActionRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
    p_scope_key: requiredText(scopeKey, 'scopeKey'),
  };
}

export function toGetVisibleModerationActionsRpcArgs(
  filter: ModerationActionHistoryFilter,
): GetVisibleModerationActionsRpcArgs {
  const args: GetVisibleModerationActionsRpcArgs = {
    p_server_id: requiredText(filter.serverId, 'serverId'),
  };

  addOptionalText(args, 'p_target_user_id', filter.targetUserId);
  addOptionalText(args, 'p_target_hero_id', filter.targetHeroId);

  return args;
}

function requiredText(value: string, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for moderation action workflow.`);
  }

  return normalized;
}

function addOptionalText<K extends keyof CreateModerationActionRpcArgs | keyof GetVisibleModerationActionsRpcArgs>(
  target: CreateModerationActionRpcArgs | GetVisibleModerationActionsRpcArgs,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key as keyof typeof target] = normalized as never;
  }
}
