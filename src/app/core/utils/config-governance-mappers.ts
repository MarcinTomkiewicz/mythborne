import {
  ConfigChangeEntry,
  ConfigChangeEntryRow,
  ConfigChangeSet,
  ConfigChangeSetRow,
  ConfigDefinition,
  ConfigDefinitionRow,
  GlobalConfigValue,
  GlobalConfigValueRow,
  ServerConfigValue,
  ServerConfigValueRow,
} from '../types/config-governance.types';

export function mapConfigDefinition(
  row: ConfigDefinitionRow,
): ConfigDefinition {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    governanceScope: row.governance_scope,
    managedEntityType: row.managed_entity_type,
    managedEntityKey: row.managed_entity_key,
    valueType: row.value_type,
    valueSchema: row.value_schema_json,
    defaultValue: row.default_value_json,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGlobalConfigValue(
  row: GlobalConfigValueRow,
): GlobalConfigValue {
  return {
    id: row.id,
    configDefinitionId: row.config_definition_id,
    value: row.value_json,
    status: row.status,
    version: row.version,
    createdBy: row.created_by,
    createdAt: row.created_at,
    activatedAt: row.activated_at,
    archivedAt: row.archived_at,
  };
}

export function mapServerConfigValue(
  row: ServerConfigValueRow,
): ServerConfigValue {
  return {
    id: row.id,
    configDefinitionId: row.config_definition_id,
    serverId: row.server_id,
    value: row.value_json,
    source: row.source,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lockedAt: row.locked_at,
  };
}

export function mapConfigChangeSet(row: ConfigChangeSetRow): ConfigChangeSet {
  return {
    id: row.id,
    title: row.title,
    reason: row.reason,
    status: row.status,
    changelogVisibility: row.changelog_visibility,
    changelogTitle: row.changelog_title,
    changelogBody: row.changelog_body,
    requestedBy: row.requested_by,
    readyBy: row.ready_by,
    readyAt: row.ready_at,
    appliedBy: row.applied_by,
    appliedAt: row.applied_at,
    cancelledBy: row.cancelled_by,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapConfigChangeEntry(
  row: ConfigChangeEntryRow,
): ConfigChangeEntry {
  return {
    id: row.id,
    changeSetId: row.change_set_id,
    changeKind: row.change_kind,
    configDefinitionId: row.config_definition_id,
    serverId: row.server_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    fieldPath: row.field_path,
    oldScope: row.old_scope,
    newScope: row.new_scope,
    oldValue: row.old_value_json,
    newValue: row.new_value_json,
    metadata: row.metadata_json,
    createdAt: row.created_at,
  };
}
