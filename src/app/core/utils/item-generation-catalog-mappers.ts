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
import { normalizeBonusContext, normalizeBonusTarget, normalizeBonusType } from './bonus';

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
  return {
    target: normalizeBonusTarget(row.bonus_templates.target),
    value: Number(row.base_value ?? row.value ?? 0),
    type: normalizeBonusType(row.bonus_templates.type),
    context: normalizeBonusContext(row.bonus_templates.context),
    levelsStep: row.levels_step ?? row.bonus_templates.levels_step ?? null,
    sourceStat: row.source_stat ?? row.bonus_templates.source_stat ?? null,
    scalingFactor: row.scaling_factor ?? row.bonus_templates.scaling_factor ?? null,
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
