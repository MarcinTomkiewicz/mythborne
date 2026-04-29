import { CreateModerationActionInput } from '../domain/moderation/moderation-action.model';
import { Row } from '../types/supabase.types';
import {
  mapModerationHeroTarget,
  mapModerationActionType,
  mapModerationUserTarget,
  toCanApplyLocalModerationActionRpcArgs,
  toCanReadFullModerationHistoryRpcArgs,
  toCanSearchModerationTargetsRpcArgs,
  toCreateModerationActionRpcArgs,
  toGetFullHeroModerationHistoryRpcArgs,
  toGetFullUserModerationHistoryRpcArgs,
  toGetVisibleModerationActionsRpcArgs,
  toSearchModerationHeroTargetsRpcArgs,
  toSearchModerationUserTargetsRpcArgs,
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

  it('maps moderation target search rows', () => {
    const userTarget = mapModerationUserTarget({
      user_id: 'user-1',
      display_name: 'Alex',
      email: null as unknown as string,
      primary_hero_id: 'hero-1',
      primary_hero_name: 'Aster',
      has_visible_moderation_history: true,
      match_kind: 'hero_name',
      technical_label: 'user-1',
    });
    const heroTarget = mapModerationHeroTarget({
      hero_id: 'hero-1',
      hero_name: 'Aster',
      user_id: 'user-1',
      user_display_name: 'Alex',
      email: 'alex@example.com',
      has_visible_moderation_history: false,
      match_kind: 'hero_name',
      technical_label: 'hero-1',
    });

    expect(userTarget.label).toBe('Alex');
    expect(userTarget.email).toBeNull();
    expect(userTarget.description).toContain('Primary hero: Aster');
    expect(heroTarget.label).toBe('Aster');
    expect(heroTarget.description).toContain('Alex');
    expect(heroTarget.email).toBe('alex@example.com');
  });

  it('builds scope, history and target search RPC args', () => {
    const scopeArgs: Record<string, unknown> = toCanApplyLocalModerationActionRpcArgs(
      ' server-1 ',
      ' trade ',
    );
    const fullAccessArgs: Record<string, unknown> =
      toCanReadFullModerationHistoryRpcArgs(' server-1 ');
    const targetSearchAccessArgs: Record<string, unknown> =
      toCanSearchModerationTargetsRpcArgs(' server-1 ');
    const historyArgs: Record<string, unknown> = toGetVisibleModerationActionsRpcArgs({
      serverId: ' server-1 ',
      targetUserId: ' user-1 ',
      targetHeroId: '',
    });
    const fullUserArgs: Record<string, unknown> = toGetFullUserModerationHistoryRpcArgs({
      serverId: ' server-1 ',
      userId: ' user-1 ',
    });
    const fullHeroArgs: Record<string, unknown> = toGetFullHeroModerationHistoryRpcArgs({
      serverId: ' server-1 ',
      heroId: ' hero-1 ',
    });
    const userSearchArgs: Record<string, unknown> = toSearchModerationUserTargetsRpcArgs({
      serverId: ' server-1 ',
      query: ' alex ',
      limit: 10,
    });
    const heroSearchArgs: Record<string, unknown> = toSearchModerationHeroTargetsRpcArgs({
      serverId: ' server-1 ',
      query: ' aster ',
      limit: 10,
    });

    expect(scopeArgs).toEqual({
      p_server_id: 'server-1',
      p_scope_key: 'trade',
    });

    expect(fullAccessArgs).toEqual({
      p_server_id: 'server-1',
    });

    expect(targetSearchAccessArgs).toEqual({
      p_server_id: 'server-1',
    });

    expect(historyArgs).toEqual({
      p_server_id: 'server-1',
      p_target_user_id: 'user-1',
    });

    expect(fullUserArgs).toEqual({
      p_server_id: 'server-1',
      p_user_id: 'user-1',
    });

    expect(fullHeroArgs).toEqual({
      p_server_id: 'server-1',
      p_hero_id: 'hero-1',
    });

    expect(userSearchArgs).toEqual({
      p_server_id: 'server-1',
      p_query: 'alex',
      p_limit: 10,
    });

    expect(heroSearchArgs).toEqual({
      p_server_id: 'server-1',
      p_query: 'aster',
      p_limit: 10,
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
