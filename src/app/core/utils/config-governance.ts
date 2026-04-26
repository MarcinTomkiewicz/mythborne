import {
  EffectiveConfigValueSource,
} from '../enums/config-governance.enum';
import {
  ConfigDefinition,
  ConfigChangeEntry,
  ConfigChangeEntryRow,
  ConfigChangeSet,
  ConfigChangeSetRow,
  ConfigChangeStatus,
  ConfigChangeVisibility,
  EffectiveConfigValue,
  ConfigGovernanceScope,
  ConfigManagedEntityType,
  ConfigDefinitionRow,
  GlobalConfigValue,
  GlobalConfigValueRow,
  ServerConfigValue,
  ServerConfigValueRow,
} from '../types/config-governance.types';
import { Json } from '../types/database.types';

export function mapConfigDefinition(row: ConfigDefinitionRow): ConfigDefinition {
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

export function mapGlobalConfigValue(row: GlobalConfigValueRow): GlobalConfigValue {
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

export function mapServerConfigValue(row: ServerConfigValueRow): ServerConfigValue {
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
    readyAt: row.ready_at,
    appliedBy: row.applied_by,
    appliedAt: row.applied_at,
    cancelledBy: row.cancelled_by,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapConfigChangeEntry(row: ConfigChangeEntryRow): ConfigChangeEntry {
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

export function resolveEffectiveConfigValues(
  definitions: readonly ConfigDefinition[],
  globalValues: readonly GlobalConfigValue[],
  serverValues: readonly ServerConfigValue[],
): Map<string, EffectiveConfigValue> {
  const globalByDefinition = latestGlobalValuesByDefinition(globalValues);
  const serverByDefinition = latestServerValuesByDefinition(serverValues);

  return new Map(
    definitions.map((definition) => {
      const serverValue = serverByDefinition.get(definition.id) ?? null;
      const globalValue = globalByDefinition.get(definition.id) ?? null;
      const effectiveValue = resolveEffectiveConfigValue(
        definition,
        globalValue,
        serverValue,
      );

      return [definition.id, effectiveValue];
    }),
  );
}

export function formatConfigJsonPreview(value: Json | null): string {
  if (value === null) {
    return 'No default';
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export function formatConfigValuePreview(value: Json | null): string {
  if (value === null) {
    return 'No value';
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export function sourceLabelForEffectiveConfigValue(value: EffectiveConfigValue): string {
  if (value.source === EffectiveConfigValueSource.Server && value.serverValue) {
    return `Server: ${value.serverValue.source}`;
  }

  if (value.source === EffectiveConfigValueSource.Global && value.globalValue) {
    return `Global: v${value.globalValue.version}`;
  }

  if (value.source === EffectiveConfigValueSource.Default) {
    return 'Default';
  }

  return 'No value';
}

export function filterConfigDefinitions(
  definitions: readonly ConfigDefinition[],
  filters: {
    query: string;
    governanceScope: ConfigGovernanceScope | '';
    managedEntityType: ConfigManagedEntityType | '';
  },
): ConfigDefinition[] {
  const query = filters.query.trim().toLowerCase();

  return definitions.filter((definition) => {
    const matchesQuery =
      !query ||
      definition.key.toLowerCase().includes(query) ||
      definition.label.toLowerCase().includes(query) ||
      (definition.description ?? '').toLowerCase().includes(query) ||
      (definition.managedEntityKey ?? '').toLowerCase().includes(query) ||
      definition.managedEntityType.toLowerCase().includes(query) ||
      definition.governanceScope.toLowerCase().includes(query);
    const matchesScope =
      !filters.governanceScope ||
      definition.governanceScope === filters.governanceScope;
    const matchesManagedEntity =
      !filters.managedEntityType ||
      definition.managedEntityType === filters.managedEntityType;

    return matchesQuery && matchesScope && matchesManagedEntity;
  });
}

export function filterConfigChangeSets(
  changeSets: readonly ConfigChangeSet[],
  filters: {
    query: string;
    status: ConfigChangeStatus | '';
    changelogVisibility: ConfigChangeVisibility | '';
  },
): ConfigChangeSet[] {
  const query = filters.query.trim().toLowerCase();

  return changeSets.filter((changeSet) => {
    const matchesQuery =
      !query ||
      changeSet.title.toLowerCase().includes(query) ||
      changeSet.reason.toLowerCase().includes(query) ||
      (changeSet.changelogTitle ?? '').toLowerCase().includes(query) ||
      (changeSet.changelogBody ?? '').toLowerCase().includes(query);
    const matchesStatus = !filters.status || changeSet.status === filters.status;
    const matchesVisibility =
      !filters.changelogVisibility ||
      changeSet.changelogVisibility === filters.changelogVisibility;

    return matchesQuery && matchesStatus && matchesVisibility;
  });
}

export function uniqueConfigDefinitionScopes(
  definitions: readonly ConfigDefinition[],
): ConfigGovernanceScope[] {
  return uniqueSorted(definitions.map((definition) => definition.governanceScope));
}

export function uniqueConfigDefinitionManagedEntityTypes(
  definitions: readonly ConfigDefinition[],
): ConfigManagedEntityType[] {
  return uniqueSorted(definitions.map((definition) => definition.managedEntityType));
}

export function uniqueConfigChangeSetStatuses(
  changeSets: readonly ConfigChangeSet[],
): ConfigChangeStatus[] {
  return uniqueSorted(changeSets.map((changeSet) => changeSet.status));
}

export function uniqueConfigChangeSetVisibilities(
  changeSets: readonly ConfigChangeSet[],
): ConfigChangeVisibility[] {
  return uniqueSorted(changeSets.map((changeSet) => changeSet.changelogVisibility));
}

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

function resolveEffectiveConfigValue(
  definition: ConfigDefinition,
  globalValue: GlobalConfigValue | null,
  serverValue: ServerConfigValue | null,
): EffectiveConfigValue {
  // TODO D2: this is a simple read model: server value > active global value > default.
  // Later config governance tasks must enforce governance_scope more strictly when editing/applying values.
  if (serverValue) {
    return buildEffectiveValue(
      definition,
      serverValue.value,
      EffectiveConfigValueSource.Server,
      globalValue,
      serverValue,
    );
  }

  if (globalValue) {
    return buildEffectiveValue(
      definition,
      globalValue.value,
      EffectiveConfigValueSource.Global,
      globalValue,
      null,
    );
  }

  if (definition.defaultValue !== null) {
    return buildEffectiveValue(
      definition,
      definition.defaultValue,
      EffectiveConfigValueSource.Default,
      null,
      null,
    );
  }

  return buildEffectiveValue(
    definition,
    null,
    EffectiveConfigValueSource.None,
    null,
    null,
  );
}

function buildEffectiveValue(
  definition: ConfigDefinition,
  value: Json | null,
  source: EffectiveConfigValueSource,
  globalValue: GlobalConfigValue | null,
  serverValue: ServerConfigValue | null,
): EffectiveConfigValue {
  const effectiveValue: EffectiveConfigValue = {
    configDefinitionId: definition.id,
    value,
    source,
    sourceLabel: '',
    serverValue,
    globalValue,
    defaultValue: definition.defaultValue,
  };

  return {
    ...effectiveValue,
    sourceLabel: sourceLabelForEffectiveConfigValue(effectiveValue),
  };
}

function latestGlobalValuesByDefinition(
  values: readonly GlobalConfigValue[],
): Map<string, GlobalConfigValue> {
  return values.reduce((acc, value) => {
    const current = acc.get(value.configDefinitionId);

    if (!current || value.version > current.version) {
      acc.set(value.configDefinitionId, value);
    }

    return acc;
  }, new Map<string, GlobalConfigValue>());
}

function latestServerValuesByDefinition(
  values: readonly ServerConfigValue[],
): Map<string, ServerConfigValue> {
  return values.reduce((acc, value) => {
    const current = acc.get(value.configDefinitionId);

    if (!current || Date.parse(value.updatedAt) > Date.parse(current.updatedAt)) {
      acc.set(value.configDefinitionId, value);
    }

    return acc;
  }, new Map<string, ServerConfigValue>());
}
