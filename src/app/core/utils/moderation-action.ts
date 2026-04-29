import {
  CreateModerationActionInput,
  FullHeroModerationHistoryFilter,
  FullUserModerationHistoryFilter,
  ModerationAction,
  ModerationActionHistoryFilter,
  ModerationHeroTarget,
  ModerationTargetSearchInput,
  ModerationActionType,
  ModerationUserTarget,
} from '../domain/moderation/moderation-action.model';
import {
  AnyModerationActionRpcRow,
  CanApplyLocalModerationActionRpcArgs,
  CanReadFullModerationHistoryRpcArgs,
  CanSearchModerationTargetsRpcArgs,
  CreateModerationActionRpcArgs,
  GetFullHeroModerationHistoryRpcArgs,
  GetFullUserModerationHistoryRpcArgs,
  GetVisibleModerationActionsRpcArgs,
  SearchModerationHeroTargetRpcRow,
  SearchModerationHeroTargetsRpcArgs,
  SearchModerationUserTargetRpcRow,
  SearchModerationUserTargetsRpcArgs,
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

export function mapModerationAction(row: AnyModerationActionRpcRow): ModerationAction {
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

export function mapModerationUserTarget(
  row: SearchModerationUserTargetRpcRow,
): ModerationUserTarget {
  const email = normalizeNullableText(row.email);
  const primaryHeroName = normalizeNullableText(row.primary_hero_name);

  return {
    userId: row.user_id,
    displayName: row.display_name,
    email,
    primaryHeroId: normalizeNullableText(row.primary_hero_id),
    primaryHeroName,
    hasVisibleModerationHistory: row.has_visible_moderation_history,
    matchKind: row.match_kind,
    technicalLabel: row.technical_label,
    label: row.display_name,
    description: [
      primaryHeroName ? `Primary hero: ${primaryHeroName}` : null,
      email,
      row.technical_label,
    ]
      .filter(Boolean)
      .join(' | '),
  };
}

export function mapModerationHeroTarget(
  row: SearchModerationHeroTargetRpcRow,
): ModerationHeroTarget {
  const email = normalizeNullableText(row.email);

  return {
    heroId: row.hero_id,
    heroName: row.hero_name,
    userId: row.user_id,
    userDisplayName: row.user_display_name,
    email,
    hasVisibleModerationHistory: row.has_visible_moderation_history,
    matchKind: row.match_kind,
    technicalLabel: row.technical_label,
    label: row.hero_name,
    description: [row.user_display_name, email, row.technical_label]
      .filter(Boolean)
      .join(' | '),
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

export function toCanReadFullModerationHistoryRpcArgs(
  serverId: string,
): CanReadFullModerationHistoryRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
  };
}

export function toCanSearchModerationTargetsRpcArgs(
  serverId: string,
): CanSearchModerationTargetsRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
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

export function toGetFullUserModerationHistoryRpcArgs(
  filter: FullUserModerationHistoryFilter,
): GetFullUserModerationHistoryRpcArgs {
  return {
    p_server_id: requiredText(filter.serverId, 'serverId'),
    p_user_id: requiredText(filter.userId, 'userId'),
  };
}

export function toGetFullHeroModerationHistoryRpcArgs(
  filter: FullHeroModerationHistoryFilter,
): GetFullHeroModerationHistoryRpcArgs {
  return {
    p_server_id: requiredText(filter.serverId, 'serverId'),
    p_hero_id: requiredText(filter.heroId, 'heroId'),
  };
}

export function toSearchModerationUserTargetsRpcArgs(
  input: ModerationTargetSearchInput,
): SearchModerationUserTargetsRpcArgs {
  return {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_query: requiredText(input.query, 'query'),
    p_limit: normalizePositiveLimit(input.limit),
  };
}

export function toSearchModerationHeroTargetsRpcArgs(
  input: ModerationTargetSearchInput,
): SearchModerationHeroTargetsRpcArgs {
  return {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_query: requiredText(input.query, 'query'),
    p_limit: normalizePositiveLimit(input.limit),
  };
}

function requiredText(value: string, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for moderation action workflow.`);
  }

  return normalized;
}

function normalizeNullableText(value: string | null | undefined): string | null {
  return trimToNull(value);
}

function normalizePositiveLimit(value: number): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? Math.floor(normalized) : 10;
}

function addOptionalText<
  K extends keyof CreateModerationActionRpcArgs | keyof GetVisibleModerationActionsRpcArgs,
>(
  target: CreateModerationActionRpcArgs | GetVisibleModerationActionsRpcArgs,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key as keyof typeof target] = normalized as never;
  }
}
