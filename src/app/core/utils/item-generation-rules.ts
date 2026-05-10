import {
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemQualityDefinition,
} from '../domain/item/item-generation.model';

export function composeItemName(
  quality: ItemQualityDefinition,
  base: ItemBaseDefinition,
  prefix: ItemAffixDefinition | null,
  suffix: ItemAffixDefinition | null
): string {
  return [
    quality.key === 'normal' ? null : quality.label,
    prefix?.name ?? null,
    base.name,
    suffix?.name ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}
