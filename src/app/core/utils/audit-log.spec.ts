import { Row } from '../types/supabase.types';
import { FilterOperator } from '../enums/filter-operators';
import { AuditLogWithDictionaryRow } from '../types/audit-log-row.types';
import { mapAuditLogEntry, toAuditLogFilters } from './audit-log';

describe('audit log mappers', () => {
  it('maps audit log rows with joined dictionaries', () => {
    const log = mapAuditLogEntry(createAuditLogRow());

    expect(log.actionType?.key).toBe('config.change.applied');
    expect(log.entityType?.key).toBe('config_change_set');
    expect(log.entityId).toBe('entity-1');
    expect(log.severity).toBe('notice');
    expect(JSON.stringify(log.metadataJson)).toBe('{"source":"test"}');
    expect(log.createdAt).toBe('2026-04-27T01:00:00.000Z');
  });

  it('maps missing joined dictionaries as null without losing stable keys', () => {
    const log = mapAuditLogEntry(
      createAuditLogRow({
        audit_action_types: null,
        audit_entity_types: null,
      }),
    );

    expect(log.actionTypeKey).toBe('config.change.applied');
    expect(log.actionType).toBeNull();
    expect(log.entityTypeKey).toBe('config_change_set');
    expect(log.entityType).toBeNull();
  });

  it('builds exact-match filters only from filled values', () => {
    const filters = toAuditLogFilters({
      actionTypeKey: 'config.change.applied',
      entityTypeKey: null,
      serverId: 'server-1',
      actorUserId: ' ',
      actorHeroId: 'hero-1',
      targetUserId: null,
      targetHeroId: null,
    });

    expect(filters).toEqual({
      actionTypeKey: { operator: FilterOperator.EQ, value: 'config.change.applied' },
      serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      actorHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
    });
  });
});

function createAuditLogRow(
  overrides: Partial<AuditLogWithDictionaryRow> = {},
): AuditLogWithDictionaryRow {
  return {
    id: 'log-1',
    action_type_key: 'config.change.applied',
    entity_type_key: 'config_change_set',
    entity_id: 'entity-1',
    severity: 'notice',
    reason: 'Config applied.',
    server_id: 'server-1',
    actor_user_id: 'actor-user-1',
    actor_hero_id: null,
    target_user_id: null,
    target_hero_id: null,
    request_id: 'request-1',
    metadata_json: { source: 'test' },
    old_value_json: { status: 'ready' },
    new_value_json: { status: 'applied' },
    created_at: '2026-04-27T01:00:00.000Z',
    audit_action_types: createActionTypeRow(),
    audit_entity_types: createEntityTypeRow(),
    ...overrides,
  };
}

function createActionTypeRow(
  overrides: Partial<Row<'audit_action_types'>> = {},
): Row<'audit_action_types'> {
  return {
    id: 'action-1',
    key: 'config.change.applied',
    label: 'Config change applied',
    category: 'config',
    description: 'Applied config change.',
    default_severity: 'notice',
    sort_order: 10,
    is_active: true,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T01:00:00.000Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function createEntityTypeRow(
  overrides: Partial<Row<'audit_entity_types'>> = {},
): Row<'audit_entity_types'> {
  return {
    id: 'entity-1',
    key: 'config_change_set',
    label: 'Config change set',
    category: 'config',
    description: 'Governance change set.',
    sort_order: 20,
    is_active: true,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T01:00:00.000Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}
