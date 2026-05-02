import { Json } from '../types/database.types';
import {
  DeactivateEncounterEffectPayloadRpcArgs,
  DeactivateEncounterResourcePayloadRpcArgs,
  DeactivateExplorationEffectDefinitionRpcArgs,
  UpsertEncounterEffectPayloadRpcArgs,
  UpsertEncounterResourcePayloadRpcArgs,
  UpsertExplorationEffectDefinitionRpcArgs,
} from '../types/exploration-encounter-admin-rpc.types';
import {
  UpsertEncounterEffectPayloadInput,
  UpsertEncounterResourcePayloadInput,
  UpsertExplorationEffectDefinitionInput,
} from '../domain/exploration/exploration-encounter-admin.model';
import {
  addOptionalInteger,
  addOptionalNumber,
  addOptionalText,
  integer,
  percent,
  requiredText,
} from './admin-rpc-helpers';
import { trimToNull } from './normalize-text';

export function toUpsertEncounterResourcePayloadRpcArgs(
  input: UpsertEncounterResourcePayloadInput,
): UpsertEncounterResourcePayloadRpcArgs {
  const args: UpsertEncounterResourcePayloadRpcArgs = {
    p_payload_id: trimToNull(input.payloadId) ?? undefined,
    p_encounter_definition_id: requiredText(input.encounterDefinitionId, 'encounterDefinitionId'),
    p_resource_type: requiredText(input.resourceType, 'resourceType'),
    p_amount_mode: requiredText(input.amountMode, 'amountMode'),
    p_chance_percent: percent(input.chancePercent, 'chancePercent'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalNumber(args, 'p_min_amount', input.minAmount);
  addOptionalNumber(args, 'p_max_amount', input.maxAmount);
  addOptionalText(args, 'p_formula_id', input.formulaId);
  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);

  return args;
}

export function toDeactivateEncounterResourcePayloadRpcArgs(
  payloadId: string,
  reason: string,
): DeactivateEncounterResourcePayloadRpcArgs {
  return {
    p_payload_id: requiredText(payloadId, 'payloadId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertExplorationEffectDefinitionRpcArgs(
  input: UpsertExplorationEffectDefinitionInput,
): UpsertExplorationEffectDefinitionRpcArgs {
  const args: UpsertExplorationEffectDefinitionRpcArgs = {
    p_effect_definition_id: trimToNull(input.effectDefinitionId) ?? undefined,
    p_key: requiredText(input.key, 'key'),
    p_label: requiredText(input.label, 'label'),
    p_description: requiredText(input.description, 'description'),
    p_effect_kind: requiredText(input.effectKind, 'effectKind'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  addOptionalText(args, 'p_bonus_template_id', input.bonusTemplateId);
  addOptionalNumber(args, 'p_default_value', input.defaultValue);
  addOptionalInteger(args, 'p_default_duration_steps', input.defaultDurationSteps);

  return args;
}

export function toDeactivateExplorationEffectDefinitionRpcArgs(
  effectDefinitionId: string,
  reason: string,
): DeactivateExplorationEffectDefinitionRpcArgs {
  return {
    p_effect_definition_id: requiredText(effectDefinitionId, 'effectDefinitionId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertEncounterEffectPayloadRpcArgs(
  input: UpsertEncounterEffectPayloadInput,
): UpsertEncounterEffectPayloadRpcArgs {
  const args: UpsertEncounterEffectPayloadRpcArgs = {
    p_payload_id: trimToNull(input.payloadId) ?? undefined,
    p_encounter_definition_id: requiredText(input.encounterDefinitionId, 'encounterDefinitionId'),
    p_effect_definition_id: requiredText(input.effectDefinitionId, 'effectDefinitionId'),
    p_chance_percent: percent(input.chancePercent, 'chancePercent'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);

  return args;
}

export function toDeactivateEncounterEffectPayloadRpcArgs(
  payloadId: string,
  reason: string,
): DeactivateEncounterEffectPayloadRpcArgs {
  return {
    p_payload_id: requiredText(payloadId, 'payloadId'),
    p_reason: requiredText(reason, 'reason'),
  };
}
