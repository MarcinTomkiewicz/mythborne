import { Enums, Json } from './database.types';
import { Row } from './supabase.types';
import {
  ConfigChangeKindKey,
  EffectiveConfigValueSource,
} from '../enums/config-governance.enum';

export type ConfigGovernanceScope = Enums<'config_governance_scope'>;
export type ConfigManagedEntityType = Enums<'config_managed_entity_type'>;
export type ConfigValueType = Enums<'config_value_type'>;
export type ConfigValueStatus = Enums<'config_value_status'>;
export type ServerConfigValueSource = Enums<'server_config_value_source'>;
export type ConfigChangeKind = Enums<'config_change_kind'>;
export type ConfigChangeStatus = Enums<'config_change_status'>;
export type ConfigChangeVisibility = Enums<'config_change_visibility'>;

export type ConfigDefinitionRow = Row<'config_definitions'>;
export type GlobalConfigValueRow = Row<'global_config_values'>;
export type ServerConfigValueRow = Row<'server_config_values'>;
export type ConfigChangeSetRow = Row<'config_change_sets'>;
export type ConfigChangeEntryRow = Row<'config_change_entries'>;

export interface ConfigDefinition {
  id: string;
  key: string;
  label: string;
  description: string | null;
  governanceScope: ConfigGovernanceScope;
  managedEntityType: ConfigManagedEntityType;
  managedEntityKey: string | null;
  valueType: ConfigValueType;
  valueSchema: Json;
  defaultValue: Json | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalConfigValue {
  id: string;
  configDefinitionId: string;
  value: Json;
  status: ConfigValueStatus;
  version: number;
  createdBy: string | null;
  createdAt: string;
  activatedAt: string | null;
  archivedAt: string | null;
}

export interface ServerConfigValue {
  id: string;
  configDefinitionId: string;
  serverId: string;
  value: Json;
  source: ServerConfigValueSource;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
}

export interface EffectiveConfigValue {
  configDefinitionId: string;
  value: Json | null;
  source: EffectiveConfigValueSource;
  sourceLabel: string;
  serverValue: ServerConfigValue | null;
  globalValue: GlobalConfigValue | null;
  defaultValue: Json | null;
}

export interface ConfigChangeSet {
  id: string;
  title: string;
  reason: string;
  status: ConfigChangeStatus;
  changelogVisibility: ConfigChangeVisibility;
  changelogTitle: string | null;
  changelogBody: string | null;
  requestedBy: string | null;
  readyBy: string | null;
  readyAt: string | null;
  appliedBy: string | null;
  appliedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigChangeEntry {
  id: string;
  changeSetId: string;
  changeKind: ConfigChangeKind;
  configDefinitionId: string | null;
  serverId: string | null;
  entityType: ConfigManagedEntityType | null;
  entityId: string | null;
  fieldPath: string | null;
  oldScope: ConfigGovernanceScope | null;
  newScope: ConfigGovernanceScope | null;
  oldValue: Json | null;
  newValue: Json | null;
  metadata: Json;
  createdAt: string;
}

export interface CreateConfigChangeSetDraftInput {
  title: string;
  reason: string;
  changelogVisibility: ConfigChangeVisibility;
  changelogTitle: string | null;
  changelogBody: string | null;
  requestedBy: string | null;
}

export interface CreateConfigValueChangeEntryInput {
  changeSetId: string;
  changeKind:
    | ConfigChangeKindKey.GlobalValueChange
    | ConfigChangeKindKey.ServerValueChange;
  definition: ConfigDefinition;
  serverId: string | null;
  oldValue: Json | null;
  newValue: Json;
  oldSource: string | null;
  oldSourceLabel: string | null;
}
