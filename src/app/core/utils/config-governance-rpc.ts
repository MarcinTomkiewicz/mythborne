import {
  CreateConfigChangeSetDraftInput,
  CreateConfigValueChangeEntryInput,
} from '../types/config-governance.types';
import {
  CreateConfigChangeSetDraftRpcArgs,
  CreateConfigValueChangeEntryRpcArgs,
} from '../types/config-governance-rpc.types';

export function toCreateConfigChangeSetDraftRpcArgs(
  input: CreateConfigChangeSetDraftInput,
): CreateConfigChangeSetDraftRpcArgs {
  const args: CreateConfigChangeSetDraftRpcArgs = {
    p_title: input.title,
    p_reason: input.reason,
    p_changelog_visibility: input.changelogVisibility,
  };

  if (input.changelogTitle) {
    args.p_changelog_title = input.changelogTitle;
  }

  if (input.changelogBody) {
    args.p_changelog_body = input.changelogBody;
  }

  return args;
}

export function toCreateConfigValueChangeEntryRpcArgs(
  input: CreateConfigValueChangeEntryInput,
): CreateConfigValueChangeEntryRpcArgs {
  const args: CreateConfigValueChangeEntryRpcArgs = {
    p_change_set_id: input.changeSetId,
    p_change_kind: input.changeKind,
    p_config_definition_id: input.definition.id,
    p_new_value_json: input.newValue,
    p_metadata_json: {
      configKey: input.definition.key,
      valueType: input.definition.valueType,
      oldSource: input.oldSource,
      oldSourceLabel: input.oldSourceLabel,
    },
  };

  if (input.serverId) {
    args.p_server_id = input.serverId;
  }

  return args;
}
