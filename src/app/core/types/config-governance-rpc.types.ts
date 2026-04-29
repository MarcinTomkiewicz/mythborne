import { Database } from './database.types';

export type CreateConfigChangeSetDraftRpcArgs =
  Database['public']['Functions']['create_config_change_set_draft']['Args'];

export type CreateConfigValueChangeEntryRpcArgs =
  Database['public']['Functions']['create_config_value_change_entry']['Args'];

export type GetConfigDefinitionExplainabilityRpcArgs =
  Database['public']['Functions']['get_config_definition_explainability']['Args'];
