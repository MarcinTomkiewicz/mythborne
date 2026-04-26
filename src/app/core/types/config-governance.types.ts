import { Enums, Json } from './database.types';
import { Row } from './supabase.types';

export type ConfigGovernanceScope = Enums<'config_governance_scope'>;
export type ConfigManagedEntityType = Enums<'config_managed_entity_type'>;
export type ConfigValueType = Enums<'config_value_type'>;

export type ConfigDefinitionRow = Row<'config_definitions'>;

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
