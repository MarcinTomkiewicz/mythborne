import { CreateModerationActionInput } from '../domain/moderation/moderation-action.model';
import { Row } from '../types/supabase.types';
import {
  mapModerationActionType,
  toCanApplyLocalModerationActionRpcArgs,
  toCreateModerationActionRpcArgs,
  toGetVisibleModerationActionsRpcArgs,
} from './moderation-action';

describe('moderation action utils', () => {
  it('maps moderation action type dictionary rows', () => {
    const actionType = mapModerationActionType(createActionTypeRow());

    expect(actionType).toEqual({
      key: 'local_warning',
      label: 'Local warning',
      description: 'Warn a player on a server.',
      helperText: 'Use for low severity behavior.',
      scopeRequired: true,
      moderatorCanApply: true,
      operatorCanApply: true,
      isWarning: true,
      isRestriction: false,
      isSuspension: false,
      isBan: false,
      isSevere: false,
      isStaffDisqualifying: false,
      defaultDurationMinutes: null,
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-04-29T00:00:00.000Z',
      updatedAt: '2026-04-29T00:00:00.000Z',
    });
  });

  it('builds trimmed create moderation action RPC args', () => {
    const args: Record<string, unknown> = toCreateModerationActionRpcArgs({
      serverId: ' server-1 ',
      actionTypeKey: ' local_warning ',
      targetUserId: ' user-1 ',
      targetHeroId: ' hero-1 ',
      scopeKey: ' trade ',
      reason: ' reason ',
      operatorNotes: ' notes ',
      playerVisibleNote: ' visible ',
      sourceEntityType: ' report ',
      sourceEntityId: ' report-1 ',
      sourceSnapshotId: null,
      expiresAt: '',
      metadataJson: { source: 'test' },
    });

    expect(args).toEqual({
      p_server_id: 'server-1',
      p_action_type_key: 'local_warning',
      p_target_user_id: 'user-1',
      p_target_hero_id: 'hero-1',
      p_scope_key: 'trade',
      p_reason: 'reason',
      p_operator_notes: 'notes',
      p_player_visible_note: 'visible',
      p_source_entity_type: 'report',
      p_source_entity_id: 'report-1',
      p_metadata_json: { source: 'test' },
    });
  });

  it('requires core create moderation action fields', () => {
    expect(() =>
      toCreateModerationActionRpcArgs({
        ...createActionInput(),
        reason: ' ',
      }),
    ).toThrowError('reason is required for moderation action workflow.');
  });

  it('builds scope and history RPC args', () => {
    const scopeArgs: Record<string, unknown> = toCanApplyLocalModerationActionRpcArgs(
      ' server-1 ',
      ' trade ',
    );
    const historyArgs: Record<string, unknown> = toGetVisibleModerationActionsRpcArgs({
      serverId: ' server-1 ',
      targetUserId: ' user-1 ',
      targetHeroId: '',
    });

    expect(scopeArgs).toEqual({
      p_server_id: 'server-1',
      p_scope_key: 'trade',
    });

    expect(historyArgs).toEqual({
      p_server_id: 'server-1',
      p_target_user_id: 'user-1',
    });
  });
});

function createActionInput(): CreateModerationActionInput {
  return {
    serverId: 'server-1',
    actionTypeKey: 'local_warning',
    targetUserId: 'user-1',
    targetHeroId: null,
    scopeKey: null,
    reason: 'reason',
    operatorNotes: null,
    playerVisibleNote: null,
    sourceEntityType: null,
    sourceEntityId: null,
    sourceSnapshotId: null,
    expiresAt: null,
    metadataJson: undefined,
  };
}

function createActionTypeRow(
  overrides: Partial<Row<'moderation_action_types'>> = {},
): Row<'moderation_action_types'> {
  return {
    key: 'local_warning',
    label: 'Local warning',
    description: 'Warn a player on a server.',
    helper_text: 'Use for low severity behavior.',
    scope_required: true,
    moderator_can_apply: true,
    operator_can_apply: true,
    is_warning: true,
    is_restriction: false,
    is_suspension: false,
    is_ban: false,
    is_severe: false,
    is_staff_disqualifying: false,
    default_duration_minutes: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-04-29T00:00:00.000Z',
    updated_at: '2026-04-29T00:00:00.000Z',
    ...overrides,
  };
}
