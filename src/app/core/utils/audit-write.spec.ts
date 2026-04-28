import { toWriteAuditLogRpcArgs } from './audit-write';

describe('audit write mapper', () => {
  it('maps audit write requests to write_audit_log rpc args', () => {
    const args = toWriteAuditLogRpcArgs({
      actionTypeKey: ' config.change.applied ',
      entityTypeKey: ' config_change_set ',
      entityId: 'change-set-1',
      serverId: 'server-1',
      actorHeroId: 'actor-hero-1',
      targetUserId: 'target-user-1',
      targetHeroId: 'target-hero-1',
      severity: 'notice',
      reason: 'Applied after review.',
      metadataJson: { source: 'admin' },
      oldValueJson: { status: 'ready' },
      newValueJson: { status: 'applied' },
      requestId: 'request-1',
    });

    expect(args as Record<string, unknown>).toEqual({
      p_action_type_key: 'config.change.applied',
      p_entity_type_key: 'config_change_set',
      p_entity_id: 'change-set-1',
      p_server_id: 'server-1',
      p_actor_hero_id: 'actor-hero-1',
      p_target_user_id: 'target-user-1',
      p_target_hero_id: 'target-hero-1',
      p_reason: 'Applied after review.',
      p_request_id: 'request-1',
      p_severity: 'notice',
      p_metadata_json: { source: 'admin' },
      p_old_value_json: { status: 'ready' },
      p_new_value_json: { status: 'applied' },
    });
  });

  it('omits empty optional values and lets the rpc apply defaults', () => {
    const args = toWriteAuditLogRpcArgs({
      actionTypeKey: 'anti_abuse.case.status_changed',
      entityTypeKey: 'anti_abuse_case',
      entityId: ' ',
      reason: null,
      metadataJson: undefined,
    });

    expect(args as Record<string, unknown>).toEqual({
      p_action_type_key: 'anti_abuse.case.status_changed',
      p_entity_type_key: 'anti_abuse_case',
    });
  });

  it('fails before rpc when required dictionary keys are missing', () => {
    expect(() =>
      toWriteAuditLogRpcArgs({
        actionTypeKey: '',
        entityTypeKey: 'config_change_set',
      }),
    ).toThrowError('actionTypeKey is required for audit log writes.');
  });
});
