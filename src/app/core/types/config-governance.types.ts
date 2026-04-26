import { Enums, Json } from './database.types';
import { Row } from './supabase.types';
import { EffectiveConfigValueSource } from '../enums/config-governance.enum';

export type ConfigGovernanceScope = Enums<'config_governance_scope'>;
export type ConfigManagedEntityType = Enums<'config_managed_entity_type'>;
export type ConfigValueType = Enums<'config_value_type'>;
export type ConfigValueStatus = Enums<'config_value_status'>;
export type ServerConfigValueSource = Enums<'server_config_value_source'>;

export type ConfigDefinitionRow = Row<'config_definitions'>;
export type GlobalConfigValueRow = Row<'global_config_values'>;
export type ServerConfigValueRow = Row<'server_config_values'>;

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
