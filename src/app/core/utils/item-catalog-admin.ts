import {
  CatalogSection,
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  ItemGenerationAdminCatalogData,
} from '../domain/item/item-generation-admin.model';
import { CatalogEntity } from '../types/item-catalog-admin.types';
import { trimText } from './normalize-text';

export function catalogEntities(
  data: ItemGenerationAdminCatalogData,
  section: CatalogSection
): CatalogEntity[] {
  if (section === 'base') {
    return data.bases;
  }

  return section === 'prefix' ? data.prefixes : data.suffixes;
}

export function firstCatalogEntity(
  data: ItemGenerationAdminCatalogData,
  section: CatalogSection
): CatalogEntity | null {
  return catalogEntities(data, section)[0] ?? null;
}

export function findCatalogEntityById(
  data: ItemGenerationAdminCatalogData,
  section: CatalogSection,
  id: string
): CatalogEntity | null {
  return catalogEntities(data, section).find((entry) => entry.id === id) ?? null;
}

export function findCatalogEntityByKey(
  data: ItemGenerationAdminCatalogData,
  section: CatalogSection,
  key?: string
): CatalogEntity | null {
  return key
    ? catalogEntities(data, section).find((entry) => entry.key === key) ?? null
    : null;
}

export function catalogEntityLabel(section: CatalogSection, entity: CatalogEntity): string {
  if (section === 'base') {
    const base = entity as EditableItemGenerationBase;
    return `${base.name} (${base.key}) - ${base.slot} - ${base.baseValue}`;
  }

  const affix = entity as EditableItemGenerationAffix;
  return `${affix.name} (${affix.key}) - ${affix.kind} - ${affix.goldValue}`;
}

export function resolveCatalogBonusTemplates<T extends { bonuses: EditableItemGenerationBonus[] }>(
  data: ItemGenerationAdminCatalogData,
  entity: T
): T {
  return {
    ...entity,
    bonuses: entity.bonuses.map((bonus) => ({
      ...bonus,
      templateId:
        data.bonusTemplates.find(
          (template) =>
            template.target === trimText(bonus.target) && template.type === bonus.type
        )?.id ?? bonus.templateId,
    })),
  };
}
