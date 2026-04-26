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
  Active = 'active',
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
