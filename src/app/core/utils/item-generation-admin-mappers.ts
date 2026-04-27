import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../domain/item/item-generation-admin.model';
import {
  ItemGenerationAffixRow,
  ItemGenerationBaseRow,
} from '../types/domain-row.types';
import { BonusTemplate } from '../types/bonus.types';
import {
  CanonicalEntityBonusWithTemplateRow,
} from '../types/bonus-governance.types';
import { ItemGenerationBaseType } from '../types/item-generation.types';
import { Row } from '../types/supabase.types';
import { mapResolvedBonus } from './bonus-governance';
import { toEditableAppliedBonus } from './bonus';
import { readParamNumber } from './params';

export function mapEditableQuality(
  row: Row<'item_generation_qualities'>,
): EditableItemGenerationQuality {
  return {
    id: row.id,
    key: row.key as EditableItemGenerationQuality['key'],
    label: row.label,
    multiplier: row.multiplier,
    weight: row.weight,
    sortOrder: row.sort_order,
    isEnabled: row.is_enabled,
  };
}

export function mapEditableBucketProfile(
  row: Row<'item_generation_bucket_profiles'>,
): EditableItemGenerationBucketProfile {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? null,
    bucketCount: row.bucket_count,
    baseValue: row.base_value,
    linearGrowth: row.linear_growth,
    growthFactor: row.growth_factor,
    roundingStep: row.rounding_step,
    minIncrement: row.min_increment,
    isActive: row.is_active,
  };
}

export function mapEditableBase(
  row: ItemGenerationBaseRow,
  bonuses: EditableItemGenerationBonus[],
  baseTypeByKey: ReadonlyMap<string, ItemGenerationBaseType>,
): EditableItemGenerationBase {
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

export function mapEditableAffix(
  row: ItemGenerationAffixRow,
  bonuses: EditableItemGenerationBonus[],
): EditableItemGenerationAffix {
  return {
    id: row.id,
    key: row.key,
    kind: row.kind as EditableItemGenerationAffix['kind'],
    name: row.name,
    goldValue: row.gold_value,
    description: row.description ?? '',
    bonuses,
  };
}

export function mapEditableEntityBonus(
  row: CanonicalEntityBonusWithTemplateRow,
  templateById: ReadonlyMap<string, BonusTemplate>,
): EditableItemGenerationBonus {
  const resolved = mapResolvedBonus(row);

  if (resolved.qualityScalesLevelInterval) {
    throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
  }

  const template = requiredTemplate(templateById, resolved.templateId);

  return toEditableAppliedBonus(template, {
    id: resolved.id,
    templateId: resolved.templateId,
    category: template.category,
    templateLabel: resolved.templateLabel,
    target: resolved.targetKey,
    type: resolved.typeKey as EditableItemGenerationBonus['type'],
    scope: resolved.scopeKey as EditableItemGenerationBonus['scope'],
    description: row.description ?? template.description,
    baseValue: resolved.value,
    levelsStep: resolved.levelInterval,
    sourceStat: resolved.scalingStatKey,
    scalingFactor: readParamNumber(resolved.paramsJson, 'scalingFactor'),
    qualityScalesValue: resolved.qualityScalesValue,
  });
}

function requiredBaseType(
  baseTypeKey: string,
  rowId: string,
  baseTypeByKey: ReadonlyMap<string, ItemGenerationBaseType>,
): ItemGenerationBaseType {
  const baseType = baseTypeByKey.get(baseTypeKey);

  if (!baseType) {
    throw new Error(
      `Item generation base "${rowId}" references missing base_type_key "${baseTypeKey}".`,
    );
  }

  return baseType;
}

function requiredTemplate(
  templateById: ReadonlyMap<string, BonusTemplate>,
  templateId: string,
): BonusTemplate {
  const template = templateById.get(templateId);

  if (!template) {
    throw new Error(
      `bonus_templates entry "${templateId}" is required for item generation entity bonus admin view.`,
    );
  }

  return template;
}
