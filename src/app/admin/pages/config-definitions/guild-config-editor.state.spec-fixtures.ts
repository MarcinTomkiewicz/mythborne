import {
  ConfigChangeEntry,
  ConfigChangeSet,
  ConfigDefinition,
  EffectiveConfigValue,
} from '../../../core/types/config-governance.types';
import { EffectiveConfigValueSource } from '../../../core/enums/config-governance.enum';

export function guildConfigDefinitions(): ConfigDefinition[] {
  return [
    configDefinition('guild_creation_drachma_cost'),
    configDefinition('guild_member_base_limit'),
    configDefinition('guild_member_limit_per_leader_level'),
    configDefinition('guild_leader_inactivity_threshold_days'),
    configDefinition('guild_emergency_nomination_duration_minutes'),
    configDefinition('guild_emergency_voting_duration_minutes'),
    configDefinition('guild_emergency_max_candidates'),
    configDefinition('guild_armory_capacity'),
  ];
}

export function configDefinition(key: string): ConfigDefinition {
  return {
    id: `${key}-definition`,
    key,
    label: key,
    description: null,
    governanceScope: 'product_global',
    managedEntityType: 'scalar_config',
    managedEntityKey: 'guild',
    valueType: 'integer',
    valueSchema: null,
    defaultValue: null,
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-05-09T10:00:00.000Z',
    updatedAt: '2026-05-09T10:00:00.000Z',
  };
}

export function effectiveValues(): Map<string, EffectiveConfigValue> {
  return new Map(
    guildConfigDefinitions().map((definition) => [
      definition.id,
      {
        configDefinitionId: definition.id,
        value: 1000,
        source: EffectiveConfigValueSource.Global,
        sourceLabel: 'Global: v1',
        serverValue: null,
        globalValue: null,
        defaultValue: null,
      },
    ]),
  );
}

export function changeSet(
  overrides: Partial<ConfigChangeSet> = {},
): ConfigChangeSet {
  return {
    id: 'change-set-1',
    title: 'Guild configuration update',
    reason: 'Rebalance guild setup.',
    status: 'draft',
    changelogVisibility: 'none',
    changelogTitle: null,
    changelogBody: null,
    requestedBy: 'admin-1',
    readyBy: null,
    readyAt: null,
    appliedBy: null,
    appliedAt: null,
    cancelledBy: null,
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2026-05-09T10:00:00.000Z',
    updatedAt: '2026-05-09T10:00:00.000Z',
    ...overrides,
  };
}

export function changeEntry(
  overrides: Partial<ConfigChangeEntry> = {},
): ConfigChangeEntry {
  return {
    id: 'entry-1',
    changeSetId: 'change-set-1',
    changeKind: 'global_value_change',
    configDefinitionId: 'guild_creation_drachma_cost-definition',
    serverId: null,
    entityType: 'scalar_config',
    entityId: null,
    fieldPath: 'value_json',
    oldScope: 'product_global',
    newScope: 'product_global',
    oldValue: 1000,
    newValue: 5000,
    metadata: {},
    createdAt: '2026-05-09T10:00:00.000Z',
    ...overrides,
  };
}
