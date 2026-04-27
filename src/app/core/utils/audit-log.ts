import { AuditLogEntry } from '../domain/audit/audit-log.model';
import { AuditLogFilters, AuditLogWithDictionaryRow } from '../types/audit-log-row.types';
import { FilterDefinition } from '../interfaces/i-filter';
import { FilterOperator } from '../enums/filter-operators';
import { trimToNull } from './normalize-text';
import { mapAuditActionType, mapAuditEntityType } from './audit-dictionary';

export function mapAuditLogEntry(row: AuditLogWithDictionaryRow): AuditLogEntry {
  return {
    id: row.id,
    actionTypeKey: row.action_type_key,
    actionType: row.audit_action_types ? mapAuditActionType(row.audit_action_types) : null,
    entityTypeKey: row.entity_type_key,
    entityType: row.audit_entity_types ? mapAuditEntityType(row.audit_entity_types) : null,
    entityId: row.entity_id,
    severity: row.severity,
    reason: row.reason,
    serverId: row.server_id,
    actorUserId: row.actor_user_id,
    actorHeroId: row.actor_hero_id,
    targetUserId: row.target_user_id,
    targetHeroId: row.target_hero_id,
    requestId: row.request_id,
    metadataJson: row.metadata_json,
    oldValueJson: row.old_value_json,
    newValueJson: row.new_value_json,
    createdAt: row.created_at,
  };
}

export function toAuditLogFilters(
  filters: AuditLogFilters,
): Record<string, FilterDefinition> {
  const result: Record<string, FilterDefinition> = {};

  addEqFilter(result, 'actionTypeKey', filters.actionTypeKey);
  addEqFilter(result, 'entityTypeKey', filters.entityTypeKey);
  addEqFilter(result, 'serverId', filters.serverId);
  addEqFilter(result, 'actorUserId', filters.actorUserId);
  addEqFilter(result, 'actorHeroId', filters.actorHeroId);
  addEqFilter(result, 'targetUserId', filters.targetUserId);
  addEqFilter(result, 'targetHeroId', filters.targetHeroId);

  return result;
}

export function formatAuditJsonPreview(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function addEqFilter(
  target: Record<string, FilterDefinition>,
  key: keyof AuditLogFilters,
  value: string | null,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = eq(normalized);
  }
}
