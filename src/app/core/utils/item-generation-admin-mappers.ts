import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../domain/item/item-generation-admin.model';
import {
  ItemGenerationAffixBonusRow,
  ItemGenerationBaseBonusRow,
} from '../types/domain-row.types';
import { Row } from '../types/supabase.types';

export function mapEditableQuality(
  row: Row<'item_generation_qualities'>
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
  row: Row<'item_generation_bucket_profiles'>
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
  row: Row<'item_generation_bases'> & {
    item_generation_base_bonuses: ItemGenerationBaseBonusRow[];
  }
): EditableItemGenerationBase {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    slot: row.slot as EditableItemGenerationBase['slot'],
    baseValue: row.base_value,
    description: row.description ?? '',
    bonuses: (row.item_generation_base_bonuses ?? []).map(mapEditableBonus),
  };
}

export function mapEditableAffix(
  row: Row<'item_generation_affixes'> & {
    item_generation_affix_bonuses: ItemGenerationAffixBonusRow[];
  }
): EditableItemGenerationAffix {
  return {
    id: row.id,
    key: row.key,
    kind: row.kind as EditableItemGenerationAffix['kind'],
    name: row.name,
    goldValue: row.gold_value,
    description: row.description ?? '',
    bonuses: (row.item_generation_affix_bonuses ?? []).map(mapEditableBonus),
  };
}

export function mapEditableBonus(
  row: ItemGenerationBaseBonusRow | ItemGenerationAffixBonusRow
): EditableItemGenerationBonus {
  return {
    templateId: row.template_id,
    target: row.bonus_templates.target,
    type: row.bonus_templates.type === 'percent' ? 'percent' : 'flat',
    value: row.value,
    description: row.bonus_templates.description ?? '',
  };
}
