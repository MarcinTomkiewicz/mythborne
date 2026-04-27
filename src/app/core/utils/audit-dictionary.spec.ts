import { Row } from '../types/supabase.types';
import { mapAuditActionType, mapAuditEntityType } from './audit-dictionary';

describe('audit dictionary mappers', () => {
  it('maps audit action dictionary rows', () => {
    const actionType = mapAuditActionType(createActionTypeRow());

    expect(actionType).toEqual({
      id: 'action-1',
      key: 'config.change.applied',
      label: 'Config change applied',
      category: 'config',
      description: 'Applied config change.',
      defaultSeverity: 'notice',
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-04-27T00:00:00.000Z',
      updatedAt: '2026-04-27T01:00:00.000Z',
    });
  });

  it('maps audit entity dictionary rows', () => {
    const entityType = mapAuditEntityType(createEntityTypeRow());

    expect(entityType).toEqual({
      id: 'entity-1',
      key: 'config_change_set',
      label: 'Config change set',
      category: 'config',
      description: 'Governance change set.',
      sortOrder: 20,
      isActive: true,
      createdAt: '2026-04-27T00:00:00.000Z',
      updatedAt: '2026-04-27T01:00:00.000Z',
    });
  });
});

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
