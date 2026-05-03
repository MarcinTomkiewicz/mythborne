import {
  UpsertCombatOpponentAttackSourceInput,
  UpsertCombatOpponentDefinitionInput,
  UpsertCombatOpponentEquipmentEntryInput,
  UpsertCombatOpponentFamilyInput,
  UpsertCombatOpponentStatValueInput,
} from '../types/combat-opponent-admin-rpc.types';
import {
  addOptionalInteger,
  addOptionalText,
  integer,
  percent,
  positiveNumber,
  requiredText,
} from './admin-rpc-helpers';

function nonNegativeNumber(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error(`${field} must be non-negative for admin configuration workflow.`);
  }

  return normalized;
}

export function toUpsertCombatOpponentFamilyRpcArgs(
  input: UpsertCombatOpponentFamilyInput,
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    p_key: requiredText(input.key, 'family key'),
    p_label: requiredText(input.label, 'family label'),
    p_sort_order: integer(input.sortOrder, 'sort order'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  return args;
}

export function toDeactivateCombatOpponentFamilyRpcArgs(
  familyKey: string,
  reason: string,
): Record<string, unknown> {
  return {
    p_family_key: requiredText(familyKey, 'family key'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertCombatOpponentDefinitionRpcArgs(
  input: UpsertCombatOpponentDefinitionInput,
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    p_key: requiredText(input.key, 'opponent key'),
    p_label: requiredText(input.label, 'opponent label'),
    p_family_key: requiredText(input.familyKey, 'family key'),
    p_equipment_mode: requiredText(input.equipmentMode, 'equipment mode'),
    p_sort_order: integer(input.sortOrder, 'sort order'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_opponent_definition_id', input.opponentDefinitionId);
  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  addOptionalText(args, 'p_default_scaling_formula_id', input.defaultScalingFormulaId);
  return args;
}

export function toDeactivateCombatOpponentDefinitionRpcArgs(
  opponentDefinitionId: string,
  reason: string,
): Record<string, unknown> {
  return {
    p_opponent_definition_id: requiredText(opponentDefinitionId, 'opponent definition id'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertCombatOpponentStatValueRpcArgs(
  input: UpsertCombatOpponentStatValueInput,
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    p_opponent_definition_id: requiredText(
      input.opponentDefinitionId,
      'opponent definition id',
    ),
    p_stat_key: requiredText(input.statKey, 'stat key'),
    p_base_value: nonNegativeNumber(input.baseValue, 'base value'),
    p_sort_order: integer(input.sortOrder, 'sort order'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_stat_value_id', input.statValueId);
  return args;
}

export function toDeleteCombatOpponentStatValueRpcArgs(
  statValueId: string,
  reason: string,
): Record<string, unknown> {
  return {
    p_stat_value_id: requiredText(statValueId, 'stat value id'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertCombatOpponentAttackSourceRpcArgs(
  input: UpsertCombatOpponentAttackSourceInput,
): Record<string, unknown> {
  if (input.maxOpponentLevel !== null && input.minOpponentLevel !== null &&
    input.maxOpponentLevel < input.minOpponentLevel) {
    throw new Error('max opponent level must be greater than or equal to min opponent level.');
  }

  const minDamage = positiveNumber(input.minDamage, 'min damage');
  const maxDamage = positiveNumber(input.maxDamage, 'max damage');

  if (maxDamage < minDamage) {
    throw new Error('max damage must be greater than or equal to min damage.');
  }

  const args: Record<string, unknown> = {
    p_opponent_definition_id: requiredText(
      input.opponentDefinitionId,
      'opponent definition id',
    ),
    p_key: requiredText(input.key, 'attack key'),
    p_label: requiredText(input.label, 'attack label'),
    p_attack_count: positiveNumber(input.attackCount, 'attack count'),
    p_min_damage: minDamage,
    p_max_damage: maxDamage,
    p_critical_chance: percent(input.criticalChance, 'critical chance'),
    p_critical_damage: nonNegativeNumber(input.criticalDamage, 'critical damage'),
    p_sort_order: integer(input.sortOrder, 'sort order'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_attack_source_id', input.attackSourceId);
  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  addOptionalInteger(args, 'p_min_opponent_level', input.minOpponentLevel);
  addOptionalInteger(args, 'p_max_opponent_level', input.maxOpponentLevel);
  return args;
}

export function toDeactivateCombatOpponentAttackSourceRpcArgs(
  attackSourceId: string,
  reason: string,
): Record<string, unknown> {
  return {
    p_attack_source_id: requiredText(attackSourceId, 'attack source id'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertCombatOpponentEquipmentEntryRpcArgs(
  input: UpsertCombatOpponentEquipmentEntryInput,
): Record<string, unknown> {
  if (input.maxOpponentLevel !== null && input.minOpponentLevel !== null &&
    input.maxOpponentLevel < input.minOpponentLevel) {
    throw new Error('max opponent level must be greater than or equal to min opponent level.');
  }

  const args: Record<string, unknown> = {
    p_opponent_definition_id: requiredText(
      input.opponentDefinitionId,
      'opponent definition id',
    ),
    p_slot_key: requiredText(input.slotKey, 'slot key'),
    p_entry_mode: requiredText(input.entryMode, 'entry mode'),
    p_sort_order: integer(input.sortOrder, 'sort order'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_equipment_entry_id', input.equipmentEntryId);
  addOptionalText(args, 'p_manual_base_id', input.manualBaseId);
  addOptionalText(args, 'p_manual_quality_key', input.manualQualityKey);
  addOptionalText(args, 'p_manual_prefix_affix_id', input.manualPrefixAffixId);
  addOptionalText(args, 'p_manual_suffix_affix_id', input.manualSuffixAffixId);
  addOptionalText(args, 'p_generated_bucket_profile_id', input.generatedBucketProfileId);
  addOptionalText(args, 'p_generated_max_quality_key', input.generatedMaxQualityKey);
  addOptionalInteger(args, 'p_min_opponent_level', input.minOpponentLevel);
  addOptionalInteger(args, 'p_max_opponent_level', input.maxOpponentLevel);
  return args;
}

export function toDeactivateCombatOpponentEquipmentEntryRpcArgs(
  equipmentEntryId: string,
  reason: string,
): Record<string, unknown> {
  return {
    p_equipment_entry_id: requiredText(equipmentEntryId, 'equipment entry id'),
    p_reason: requiredText(reason, 'reason'),
  };
}
