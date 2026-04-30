import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemGenerationCatalog,
  ItemQualityDefinition,
} from '../../domain/item/item-generation.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Bonus } from '../../types/bonus.types';
import { EquippedItemRow } from '../../types/equipment-row.types';
import { applyQualityScaledBonuses } from '../../utils/item-generation-catalog-mappers';
import { Backend } from '../backend/backend';
import { ItemCatalogService } from './item-catalog';

@Injectable({ providedIn: 'root' })
export class EquipmentBonusesService {
  private readonly backend = inject(Backend);
  private readonly itemCatalog = inject(ItemCatalogService);

  getEquipmentBonusesForHero(heroId: string): Observable<Bonus[]> {
    return this.loadEquippedItems(heroId).pipe(
      switchMap((rows) => {
        if (rows.length === 0) {
          return of([]);
        }

        return this.itemCatalog.getCatalog().pipe(
          map((catalog) => this.resolveEquipmentBonuses(rows, catalog)),
        );
      }),
    );
  }

  private loadEquippedItems(heroId: string): Observable<EquippedItemRow[]> {
    return this.backend.getAll<EquippedItemRow>({
      table: TABLES.hero_equipment,
      select:
        '*, items (id, generation_base_id, generation_quality_key, prefix_affix_id, suffix_affix_id, status, scrapped_at, recoverable_until, updated_at)',
      filters: { heroId: { operator: FilterOperator.EQ, value: heroId } },
      orderBy: { column: 'slot_key' },
      camelCase: false,
    });
  }

  private resolveEquipmentBonuses(
    rows: readonly EquippedItemRow[],
    catalog: ItemGenerationCatalog
  ): Bonus[] {
    return rows.flatMap((row) => this.resolveEquippedItemBonuses(row, catalog));
  }

  private resolveEquippedItemBonuses(
    row: EquippedItemRow,
    catalog: ItemGenerationCatalog
  ): Bonus[] {
    const item = row.items;

    if (!item) {
      throw new Error(`Equipped item "${row.item_id}" could not be loaded.`);
    }

    const base = this.requiredBase(item.generation_base_id, item.id, catalog);
    const quality = this.requiredQuality(item.generation_quality_key, item.id, catalog);
    const prefix = item.prefix_affix_id
      ? this.requiredAffix(item.prefix_affix_id, item.id, catalog.prefixes)
      : null;
    const suffix = item.suffix_affix_id
      ? this.requiredAffix(item.suffix_affix_id, item.id, catalog.suffixes)
      : null;

    return applyQualityScaledBonuses(
      [
        ...base.bonuses,
        ...(prefix?.bonuses ?? []),
        ...(suffix?.bonuses ?? []),
      ],
      quality.multiplier,
    );
  }

  private requiredBase(
    baseId: string | null,
    itemId: string,
    catalog: ItemGenerationCatalog
  ): ItemBaseDefinition {
    const base = catalog.bases.find((entry) => entry.id === baseId);

    if (!base) {
      throw new Error(`Equipped item "${itemId}" references missing generation base.`);
    }

    return base;
  }

  private requiredQuality(
    qualityKey: string | null,
    itemId: string,
    catalog: ItemGenerationCatalog
  ): ItemQualityDefinition {
    const quality = catalog.qualities.find((entry) => entry.key === qualityKey);

    if (!quality) {
      throw new Error(`Equipped item "${itemId}" references missing generation quality.`);
    }

    return quality;
  }

  private requiredAffix(
    affixId: string,
    itemId: string,
    affixes: readonly ItemAffixDefinition[]
  ): ItemAffixDefinition {
    const affix = affixes.find((entry) => entry.id === affixId);

    if (!affix) {
      throw new Error(`Equipped item "${itemId}" references missing affix "${affixId}".`);
    }

    return affix;
  }
}
