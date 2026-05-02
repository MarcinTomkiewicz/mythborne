import {
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemGenerationCatalog,
  ItemQualityDefinition,
} from '../domain/item/item-generation.model';

export function requiredItemGenerationBase(
  baseId: string | null,
  itemId: string,
  catalog: ItemGenerationCatalog,
): ItemBaseDefinition {
  const base = catalog.bases.find((entry) => entry.id === baseId);

  if (!base) {
    throw new Error(`Equipped item "${itemId}" references missing generation base.`);
  }

  return base;
}

export function requiredItemGenerationQuality(
  qualityKey: string | null,
  itemId: string,
  catalog: ItemGenerationCatalog,
): ItemQualityDefinition {
  const quality = catalog.qualities.find((entry) => entry.key === qualityKey);

  if (!quality) {
    throw new Error(`Equipped item "${itemId}" references missing generation quality.`);
  }

  return quality;
}

export function requiredItemGenerationAffix(
  affixId: string,
  itemId: string,
  affixes: readonly ItemAffixDefinition[],
): ItemAffixDefinition {
  const affix = affixes.find((entry) => entry.id === affixId);

  if (!affix) {
    throw new Error(`Equipped item "${itemId}" references missing affix "${affixId}".`);
  }

  return affix;
}
