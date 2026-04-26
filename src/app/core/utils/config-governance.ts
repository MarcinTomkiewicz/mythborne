import {
  ConfigDefinition,
  ConfigGovernanceScope,
  ConfigManagedEntityType,
  ConfigDefinitionRow,
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

export function formatConfigJsonPreview(value: Json | null): string {
  if (value === null) {
    return 'No default';
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
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

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}
