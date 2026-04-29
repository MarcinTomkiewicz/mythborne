import {
  ConfigChangeEntry,
  ConfigChangeEntryRow,
  ConfigChangeSet,
  ConfigChangeSetRow,
  ConfigDefinition,
  ConfigDefinitionExplainability,
  ConfigDefinitionExplainabilityRow,
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

export function mapConfigDefinitionExplainability(
  row: ConfigDefinitionExplainabilityRow,
): ConfigDefinitionExplainability {
  return {
    configDefinitionId: row.config_definition_id,
    configKey: row.config_key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    governanceScope: row.governance_scope,
    governanceScopeLabel: row.governance_scope_label,
    governanceScopeDescription: row.governance_scope_description,
    governanceScopeHelperText: row.governance_scope_helper_text,
    governanceScopeWarningText: row.governance_scope_warning_text,
    managedEntityType: row.managed_entity_type,
    managedEntityTypeLabel: row.managed_entity_type_label,
    managedEntityTypeDescription: row.managed_entity_type_description,
    managedEntityKey: row.managed_entity_key,
    valueType: row.value_type,
    valueTypeLabel: row.value_type_label,
    valueTypeDescription: row.value_type_description,
    appliesToKind: row.applies_to_kind,
    appliesToLabel: row.applies_to_label,
    appliesToDescription: row.applies_to_description,
    appliesToHelperText: row.applies_to_helper_text,
    expectedChangeKind: row.expected_change_kind,
    expectedChangeKindLabel: row.expected_change_kind_label,
    effectiveValue: row.effective_value_json,
    effectiveValueSourceKey: row.effective_value_source_key,
    effectiveValueSourceLabel: row.effective_value_source_label,
    effectiveValueSourceDescription: row.effective_value_source_description,
    gameplayImpactSummary: row.gameplay_impact_summary,
    changeWarning: row.change_warning,
    previewKind: row.preview_kind,
    previewLabel: row.preview_label,
    previewDescription: row.preview_description,
    uiGroupKey: row.ui_group_key,
    uiGroupLabel: row.ui_group_label,
    selectedServerId: row.selected_server_id,
    metadata: row.metadata_json,
    sortOrder: row.sort_order,
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
