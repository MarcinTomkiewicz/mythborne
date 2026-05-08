import { Bonus } from '../domain/bonus/bonus.model';
import {
  ItemAffixDefinition,
  ItemAffixKind,
  ItemBaseDefinition,
  ItemGenerationBaseType,
  ItemGenerationBaseTypeTarget,
  ItemGenerationBucketProfile,
  ItemQualityDefinition,
} from '../domain/item/item-generation.model';
import { BonusScope, BonusType } from '../types/bonus.types';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import { Row } from '../types/supabase.types';
import {
  mapResolvedBonus,
  projectQualityScaledValue,
} from './bonus-governance';
import { readParamNumber } from './params';

export function mapItemGenerationBase(
  row: Row<'item_generation_bases'>,
  bonuses: Bonus[],
  baseTypeByKey: ReadonlyMap<string, ItemGenerationBaseType>
): ItemBaseDefinition {
  const baseType = requiredBaseType(row.base_type_key, row.id, baseTypeByKey);

  return {
    id: row.id,
    key: row.key,
    name: row.name,
    baseTypeKey: baseType.key,
    baseTypeLabel: baseType.label,
    equipmentSlotGroup: baseType.equipmentSlotGroup,
    handUsage: baseType.handUsage,
    baseValue: row.base_value,
    description: row.description ?? '',
    bonuses,
  };
}

export function mapItemGenerationBaseType(
  row: Row<'item_generation_base_types'>
): ItemGenerationBaseType {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    equipmentSlotGroup: row.equipment_slot_group,
    handUsage: row.hand_usage,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapItemGenerationBaseTypeTarget(
  row: Row<'item_generation_base_type_targets'>
): ItemGenerationBaseTypeTarget {
  return {
    id: row.id,
    baseTypeKey: row.base_type_key,
    bonusTargetKey: row.bonus_target_key,
    isRequired: row.is_required,
    requiredGroupKey: row.required_group_key,
    minRequiredInGroup: row.min_required_in_group,
    defaultValue: row.default_value,
    minValue: row.min_value,
    maxValue: row.max_value,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
  };
}

export function mapItemGenerationAffix(
  row: Row<'item_generation_affixes'>,
  bonuses: Bonus[]
): ItemAffixDefinition {
  return {
    id: row.id,
    key: row.key,
    kind: row.kind as ItemAffixKind,
    name: row.name,
    goldValue: row.gold_value,
    description: row.description ?? '',
    bonuses,
  };
}

export function mapResolvedItemGenerationBonus(
  row: CanonicalEntityBonusWithTemplateRow
): Bonus {
  const resolved = mapResolvedBonus(row);

  if (resolved.qualityScalesLevelInterval) {
    throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
  }

  return {
    target: resolved.targetKey,
    value: resolved.value,
    type: resolved.typeKey as BonusType,
    scope: resolved.scopeKey as BonusScope,
    levelsStep: resolved.levelInterval,
    sourceStat: resolved.scalingStatKey,
    scalingFactor: readParamNumber(resolved.paramsJson, 'scalingFactor'),
    qualityScalesValue: resolved.qualityScalesValue,
  };
}

export function applyQualityScaledBonuses(
  bonuses: readonly Bonus[],
  qualityMultiplier: number
): Bonus[] {
  return bonuses.map((bonus) => ({
    ...bonus,
    value: projectQualityScaledValue(
      {
        value: bonus.value,
        qualityScalesValue: bonus.qualityScalesValue ?? false,
      },
      qualityMultiplier
    ),
  }));
}

export function mapItemGenerationQuality(
  row: Row<'item_generation_qualities'>
): ItemQualityDefinition {
  return {
    key: row.key as ItemQualityDefinition['key'],
    label: row.label,
    multiplier: row.multiplier,
    requirementMultiplier: row.requirement_multiplier,
    weight: row.weight,
  };
}

export function mapItemGenerationBucketProfile(
  row: Row<'item_generation_bucket_profiles'>
): ItemGenerationBucketProfile {
  return {
    key: row.key,
    name: row.name,
    description: row.description ?? null,
    bucketCount: row.bucket_count,
    baseValue: row.base_value,
    linearGrowth: row.linear_growth,
    growthFactor: row.growth_factor,
    roundingStep: row.rounding_step,
    minIncrement: row.min_increment,
  };
}

export function toBaseTypeByKey(
  baseTypes: readonly ItemGenerationBaseType[]
): ReadonlyMap<string, ItemGenerationBaseType> {
  return new Map(baseTypes.map((baseType) => [baseType.key, baseType]));
}

function requiredBaseType(
  baseTypeKey: string,
  rowId: string,
  baseTypeByKey: ReadonlyMap<string, ItemGenerationBaseType>
): ItemGenerationBaseType {
  const baseType = baseTypeByKey.get(baseTypeKey);

  if (!baseType) {
    throw new Error(
      `Item generation base "${rowId}" references missing base_type_key "${baseTypeKey}".`
    );
  }

  return baseType;
}
