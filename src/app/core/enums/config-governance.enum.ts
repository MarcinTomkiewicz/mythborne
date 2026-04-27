export enum ConfigDefinitionOrderColumn {
  GovernanceScope = 'governance_scope',
  ManagedEntityType = 'managed_entity_type',
  SortOrder = 'sort_order',
  Label = 'label',
}

export enum ConfigValueOrderColumn {
  Version = 'version',
  UpdatedAt = 'updated_at',
}

export enum ConfigValueStatusKey {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export enum EffectiveConfigValueSource {
  Server = 'server',
  Global = 'global',
  Default = 'default',
  None = 'none',
}

export enum ConfigChangeSetOrderColumn {
  UpdatedAt = 'updated_at',
  CreatedAt = 'created_at',
  Title = 'title',
}

export enum ConfigChangeEntryOrderColumn {
  CreatedAt = 'created_at',
}

export enum ConfigChangeStatusKey {
  Draft = 'draft',
  Ready = 'ready',
  Applied = 'applied',
  Cancelled = 'cancelled',
}

export enum ConfigChangeVisibilityKey {
  None = 'none',
  Internal = 'internal',
  Public = 'public',
}

export enum ConfigChangeKindKey {
  ScopeChange = 'scope_change',
  GlobalValueChange = 'global_value_change',
  ServerValueChange = 'server_value_change',
  DefinitionChange = 'definition_change',
  ActivationChange = 'activation_change',
  EntityFieldChange = 'entity_field_change',
}

export enum ConfigChangeValueTarget {
  Global = 'global',
  Server = 'server',
}

export enum ConfigValueTypeKey {
  Integer = 'integer',
  Decimal = 'decimal',
  Boolean = 'boolean',
  String = 'string',
  Json = 'json',
  FormulaRef = 'formula_ref',
  EnumRef = 'enum_ref',
  EntityRef = 'entity_ref',
}

export enum ConfigChangeFieldPath {
  ValueJson = 'value_json',
}

export enum ConfigManagedEntityTypeKey {
  ScalarConfig = 'scalar_config',
  JsonConfig = 'json_config',
}

export enum ServerConfigValueSourceKey {
  ManualServerLaunch = 'manual_server_launch',
  GlobalSnapshot = 'global_snapshot',
  LiveOverride = 'live_override',
  TestOverride = 'test_override',
  Migration = 'migration',
}
