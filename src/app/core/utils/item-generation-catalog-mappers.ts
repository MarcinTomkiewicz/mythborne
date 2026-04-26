import { Bonus } from '../domain/bonus/bonus.model';
import {
  ItemAffixDefinition,
  ItemAffixKind,
  ItemBaseDefinition,
  ItemGenerationBucketProfile,
  ItemQualityDefinition,
  ItemSlot,
} from '../domain/item/item-generation.model';
import {
  ItemGenerationAffixBonusRow,
  ItemGenerationBaseBonusRow,
} from '../types/domain-row.types';
import { Row } from '../types/supabase.types';
import { normalizeBonusTemplate } from './bonus';

export function mapItemGenerationBase(
  row: Row<'item_generation_bases'>,
  bonuses: Bonus[]
): ItemBaseDefinition {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    slot: row.slot as ItemSlot,
    baseValue: row.base_value,
    description: row.description ?? '',
    bonuses,
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

export function mapBonusTemplateValue(
  row: ItemGenerationBaseBonusRow | ItemGenerationAffixBonusRow
): Bonus {
  const template = normalizeBonusTemplate(row.bonus_templates);

  return {
    target: template.target,
    value: Number(row.value ?? template.baseValue),
    type: template.type,
    context: template.context,
    levelsStep: template.levelsStep,
    sourceStat: template.sourceStat,
    scalingFactor: template.scalingFactor,
  };
}

export function mapItemGenerationQuality(
  row: Row<'item_generation_qualities'>
): ItemQualityDefinition {
  return {
    key: row.key as ItemQualityDefinition['key'],
    label: row.label,
    multiplier: row.multiplier,
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
