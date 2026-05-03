import {
  CombatDictionaryReadModel,
  CombatOpponentAdminData,
  CombatOpponentAdminView,
  CombatOpponentAttackSourceReadModel,
  CombatOpponentDefinitionReadModel,
  CombatOpponentEquipmentEntryReadModel,
  CombatOpponentEquipmentModeReadModel,
  CombatOpponentFamilyReadModel,
  CombatOpponentStatGridRow,
  CombatOpponentStatValueReadModel,
  CombatStatDefinitionReadModel,
  EquipmentSlotDefinitionReadModel,
} from '../domain/combat/combat-opponent.model';
import { Row } from '../types/supabase.types';

export function mapCombatDictionary(
  row:
    | Row<'combat_source_type_definitions'>
    | Row<'combat_side_definitions'>
    | Row<'combat_outcome_definitions'>
    | Row<'combat_participant_kind_definitions'>
    | Row<'combat_attack_source_kind_definitions'>
    | Row<'combat_candidate_kind_definitions'>,
): CombatDictionaryReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentFamily(
  row: Row<'combat_opponent_families'>,
): CombatOpponentFamilyReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentDefinition(
  row: Row<'combat_opponent_definitions'>,
): CombatOpponentDefinitionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    familyKey: row.family_key,
    equipmentMode: row.equipment_mode,
    defaultScalingFormulaId: row.default_scaling_formula_id,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentStatValue(
  row: Row<'combat_opponent_stat_values'>,
): CombatOpponentStatValueReadModel {
  return {
    id: row.id,
    opponentDefinitionId: row.opponent_definition_id,
    statKey: row.stat_key,
    baseValue: row.base_value,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentAttackSource(
  row: Row<'combat_opponent_attack_sources'>,
): CombatOpponentAttackSourceReadModel {
  return {
    id: row.id,
    opponentDefinitionId: row.opponent_definition_id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    minDamage: row.min_damage,
    maxDamage: row.max_damage,
    criticalChance: row.critical_chance,
    criticalDamage: row.critical_damage,
    attackCount: row.attack_count,
    minOpponentLevel: row.min_opponent_level,
    maxOpponentLevel: row.max_opponent_level,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentEquipmentEntry(
  row: Row<'combat_opponent_equipment_entries'>,
): CombatOpponentEquipmentEntryReadModel {
  return {
    id: row.id,
    opponentDefinitionId: row.opponent_definition_id,
    slotKey: row.slot_key,
    entryMode: row.entry_mode,
    manualBaseId: row.manual_base_id,
    manualQualityKey: row.manual_quality_key,
    manualPrefixAffixId: row.manual_prefix_affix_id,
    manualSuffixAffixId: row.manual_suffix_affix_id,
    generatedBucketProfileId: row.generated_bucket_profile_id,
    generatedMaxQualityKey: row.generated_max_quality_key,
    minOpponentLevel: row.min_opponent_level,
    maxOpponentLevel: row.max_opponent_level,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentEquipmentMode(
  row: Row<'combat_opponent_equipment_mode_definitions'>,
): CombatOpponentEquipmentModeReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEquipmentSlotDefinition(
  row: Row<'equipment_slot_definitions'>,
): EquipmentSlotDefinitionReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    equipmentArea: row.equipment_area,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatStatDefinition(row: Row<'stats'>): CombatStatDefinitionReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.order,
  };
}

export function toCombatOpponentAdminViews(
  data: Pick<
    CombatOpponentAdminData,
    | 'families'
    | 'opponents'
    | 'statValues'
    | 'attackSources'
    | 'equipmentEntries'
    | 'equipmentModes'
    | 'equipmentSlots'
    | 'stats'
  >,
): CombatOpponentAdminView[] {
  return data.opponents.map((opponent) => {
    const family = data.families.find((entry) => entry.key === opponent.familyKey);
    const equipmentMode = data.equipmentModes.find((entry) => entry.key === opponent.equipmentMode);

    return {
      opponent,
      familyLabel: family ? `${family.label} (${family.key})` : `Missing family (${opponent.familyKey})`,
      familyDescription:
        family?.description ?? family?.helperText ?? family?.adminDescription ?? null,
      equipmentModeLabel: equipmentMode
        ? `${equipmentMode.label} (${equipmentMode.key})`
        : `Missing equipment mode (${opponent.equipmentMode})`,
      equipmentModeDescription:
        equipmentMode?.description ?? equipmentMode?.helperText ?? equipmentMode?.adminDescription ?? null,
      statBaselines: data.statValues
        .filter((entry) => entry.opponentDefinitionId === opponent.id)
        .map((entry) => toStatBaselineView(data, entry)),
      naturalAttacks: data.attackSources
        .filter((entry) => entry.opponentDefinitionId === opponent.id)
        .map((entry) => ({
          attack: entry,
          damageLabel: damageLabel(entry.minDamage, entry.maxDamage),
          levelRangeLabel: levelRangeLabel(entry.minOpponentLevel, entry.maxOpponentLevel),
        })),
      equipmentEntries: data.equipmentEntries
        .filter((entry) => entry.opponentDefinitionId === opponent.id)
        .map((entry) => toEquipmentEntryView(data, entry)),
    };
  });
}

export function toCombatOpponentStatGridRows(
  data: Pick<CombatOpponentAdminData, 'stats' | 'statValues'>,
  opponentDefinitionId: string | null,
): CombatOpponentStatGridRow[] {
  return data.stats.map((stat) => {
    const value = opponentDefinitionId
      ? data.statValues.find((entry) =>
        entry.opponentDefinitionId === opponentDefinitionId && entry.statKey === stat.key
      ) ?? null
      : null;

    return {
      statKey: stat.key,
      statLabel: `${stat.label} (${stat.key})`,
      statDescription: stat.description ?? stat.helperText ?? stat.adminDescription ?? null,
      statValueId: value?.id ?? null,
      baseValue: value?.baseValue ?? 0,
      sortOrder: value?.sortOrder ?? stat.sortOrder,
      isConfigured: value !== null,
    };
  });
}

function toStatBaselineView(
  data: Pick<CombatOpponentAdminData, 'stats'>,
  entry: CombatOpponentStatValueReadModel,
) {
  const stat = data.stats.find((row) => row.key === entry.statKey);

  return {
    stat: entry,
    statLabel: stat ? `${stat.label} (${stat.key})` : entry.statKey,
    statDescription: stat?.description ?? stat?.helperText ?? stat?.adminDescription ?? null,
  };
}

function toEquipmentEntryView(
  data: Pick<CombatOpponentAdminData, 'equipmentModes' | 'equipmentSlots'>,
  entry: CombatOpponentEquipmentEntryReadModel,
) {
  const slot = data.equipmentSlots.find((row) => row.key === entry.slotKey);
  const mode = data.equipmentModes.find((row) => row.key === entry.entryMode);

  return {
    entry,
    slotLabel: slot ? `${slot.label} (${slot.key})` : `Missing slot (${entry.slotKey})`,
    slotDescription: slot?.description ?? slot?.helperText ?? slot?.adminDescription ?? null,
    entryModeLabel: mode ? `${mode.label} (${mode.key})` : `Missing equipment mode (${entry.entryMode})`,
    entryModeDescription: mode?.description ?? mode?.helperText ?? mode?.adminDescription ?? null,
    levelRangeLabel: levelRangeLabel(entry.minOpponentLevel, entry.maxOpponentLevel),
  };
}

function damageLabel(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`;
}

function levelRangeLabel(min: number | null, max: number | null): string {
  if (min === null && max === null) {
    return 'Any opponent level';
  }

  if (min !== null && max !== null) {
    return `${min}-${max}`;
  }

  return min !== null ? `${min}+` : `Up to ${max}`;
}
