import {
  ConfigChangeSet,
  ConfigChangeStatus,
  ConfigChangeVisibility,
  ConfigDefinition,
  ConfigGovernanceScope,
  ConfigManagedEntityType,
} from '../types/config-governance.types';
import { uniqueSorted } from './collection';
import { trimToLower } from './normalize-text';

export function filterConfigDefinitions(
  definitions: readonly ConfigDefinition[],
  filters: {
    query: string;
    governanceScope: ConfigGovernanceScope | '';
    managedEntityType: ConfigManagedEntityType | '';
  },
): ConfigDefinition[] {
  const query = trimToLower(filters.query);

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
  const query = trimToLower(filters.query);

  return changeSets.filter((changeSet) => {
    const matchesQuery =
      !query ||
      changeSet.title.toLowerCase().includes(query) ||
      changeSet.reason.toLowerCase().includes(query) ||
      (changeSet.changelogTitle ?? '').toLowerCase().includes(query) ||
      (changeSet.changelogBody ?? '').toLowerCase().includes(query);
    const matchesStatus =
      !filters.status || changeSet.status === filters.status;
    const matchesVisibility =
      !filters.changelogVisibility ||
      changeSet.changelogVisibility === filters.changelogVisibility;

    return matchesQuery && matchesStatus && matchesVisibility;
  });
}

export function uniqueConfigDefinitionScopes(
  definitions: readonly ConfigDefinition[],
): ConfigGovernanceScope[] {
  return uniqueSorted(
    definitions.map((definition) => definition.governanceScope),
  );
}

export function uniqueConfigDefinitionManagedEntityTypes(
  definitions: readonly ConfigDefinition[],
): ConfigManagedEntityType[] {
  return uniqueSorted(
    definitions.map((definition) => definition.managedEntityType),
  );
}

export function uniqueConfigChangeSetStatuses(
  changeSets: readonly ConfigChangeSet[],
): ConfigChangeStatus[] {
  return uniqueSorted(changeSets.map((changeSet) => changeSet.status));
}

export function uniqueConfigChangeSetVisibilities(
  changeSets: readonly ConfigChangeSet[],
): ConfigChangeVisibility[] {
  return uniqueSorted(
    changeSets.map((changeSet) => changeSet.changelogVisibility),
  );
}
