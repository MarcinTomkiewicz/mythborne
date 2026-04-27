import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  ItemGenerationAdminCatalogData,
} from '../../domain/item/item-generation-admin.model';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ItemGenerationAffixRow,
  ItemGenerationBaseRow,
} from '../../types/domain-row.types';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import { Row } from '../../types/supabase.types';
import {
  mapEditableAffix,
  mapEditableBase,
  mapEditableEntityBonus,
} from '../../utils/item-generation-admin-mappers';
import {
  mapItemGenerationBaseType,
  mapItemGenerationBaseTypeTarget,
  toBaseTypeByKey,
} from '../../utils/item-generation-catalog-mappers';
import { Backend } from '../backend/backend';
import { BonusTemplateAdminService } from '../bonus/bonus-template-admin';
import { ItemGenerationAffixAdminService } from './item-generation-affix-admin';
import { ItemGenerationBaseAdminService } from './item-generation-base-admin';

@Injectable({ providedIn: 'root' })
export class ItemGenerationCatalogAdminService {
  private readonly backend = inject(Backend);
  private readonly bases = inject(ItemGenerationBaseAdminService);
  private readonly affixes = inject(ItemGenerationAffixAdminService);
  private readonly bonusTemplates = inject(BonusTemplateAdminService);

  getData(): Observable<ItemGenerationAdminCatalogData> {
    return forkJoin({
      baseTypes: this.backend.getAll<Row<'item_generation_base_types'>>({
        table: TABLES.item_generation_base_types,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      baseTypeTargets: this.backend.getAll<Row<'item_generation_base_type_targets'>>({
        table: TABLES.item_generation_base_type_targets,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      bases: this.backend.getAll<ItemGenerationBaseRow>({
        table: TABLES.item_generation_bases,
        orderBy: { column: 'base_value' },
        camelCase: false,
      }),
      affixes: this.backend.getAll<ItemGenerationAffixRow>({
        table: TABLES.item_generation_affixes,
        orderBy: { column: 'kind' },
        camelCase: false,
      }),
      entityBonuses: this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
        table: TABLES.entity_bonuses,
        select: '*, bonus_templates (*)',
        filters: {
          entityType: {
            operator: FilterOperator.IN,
            value: [
              BONUS_ENTITY_TYPES.ItemGenerationBase,
              BONUS_ENTITY_TYPES.ItemGenerationAffix,
            ],
          },
        },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      bonusData: this.bonusTemplates.getAdminData(),
    }).pipe(
      map(({ baseTypes, baseTypeTargets, bases, affixes, entityBonuses, bonusData }) => {
        if ((bases.length > 0 || affixes.length > 0) && entityBonuses.length === 0) {
          throw new Error(
            'No entity_bonuses were returned for item generation bases/affixes. Apply the base/affix backfill before editing item generation bonuses.',
          );
        }

        const mappedBaseTypes = baseTypes.map(mapItemGenerationBaseType);
        const baseTypeByKey = toBaseTypeByKey(mappedBaseTypes);
        const bonusTemplateById = new Map(
          bonusData.templates.map((template) => [template.id, template]),
        );
        const bonusesByEntityId = this.groupEditableBonusesByEntityId(
          entityBonuses,
          bonusTemplateById,
        );
        const editableAffixes = affixes.map((row) =>
          mapEditableAffix(row, bonusesByEntityId.get(row.id) ?? []),
        );

        return {
          baseTypes: mappedBaseTypes,
          baseTypeTargets: baseTypeTargets.map(mapItemGenerationBaseTypeTarget),
          bases: bases.map((row) =>
            mapEditableBase(row, bonusesByEntityId.get(row.id) ?? [], baseTypeByKey),
          ),
          prefixes: editableAffixes.filter((affix) => affix.kind === 'prefix'),
          suffixes: editableAffixes.filter((affix) => affix.kind === 'suffix'),
          bonusTemplates: bonusData.templates,
          bonusTargets: bonusData.targets,
          bonusCategories: bonusData.categories,
        };
      }),
    );
  }

  saveBase(draft: EditableItemGenerationBase): Observable<void> {
    return this.bases.save(draft);
  }

  deleteBase(id: string): Observable<void> {
    return this.bases.delete(id);
  }

  saveAffix(draft: EditableItemGenerationAffix): Observable<void> {
    return this.affixes.save(draft);
  }

  deleteAffix(id: string): Observable<void> {
    return this.affixes.delete(id);
  }

  private groupEditableBonusesByEntityId(
    rows: CanonicalEntityBonusWithTemplateRow[],
    bonusTemplateById: Parameters<typeof mapEditableEntityBonus>[1],
  ): Map<string, EditableItemGenerationBonus[]> {
    const mapById = new Map<string, EditableItemGenerationBonus[]>();

    for (const row of rows) {
      const existing = mapById.get(row.entity_id) ?? [];
      existing.push(mapEditableEntityBonus(row, bonusTemplateById));
      mapById.set(row.entity_id, existing);
    }

    return mapById;
  }
}
