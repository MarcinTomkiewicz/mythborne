import {
  AuditActionType,
  AuditEntityType,
} from '../domain/audit/audit-dictionary.model';
import { Row } from '../types/supabase.types';

export function mapAuditActionType(
  row: Row<'audit_action_types'>,
): AuditActionType {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    description: row.description,
    defaultSeverity: row.default_severity,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAuditEntityType(
  row: Row<'audit_entity_types'>,
): AuditEntityType {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
