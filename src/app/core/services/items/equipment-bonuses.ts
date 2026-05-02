import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { isPlayerUsableItemStatus } from '../../domain/item/item.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Bonus } from '../../types/bonus.types';
import { EquippedItemRow } from '../../types/equipment-row.types';
import { applyQualityScaledBonuses } from '../../utils/item-generation-catalog-mappers';
import {
  requiredItemGenerationAffix,
  requiredItemGenerationBase,
  requiredItemGenerationQuality,
} from '../../utils/item-catalog-lookup';
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

    if (!isPlayerUsableItemStatus(item.status)) {
      return [];
    }

    const base = requiredItemGenerationBase(item.generation_base_id, item.id, catalog);
    const quality = requiredItemGenerationQuality(item.generation_quality_key, item.id, catalog);
    const prefix = item.prefix_affix_id
      ? requiredItemGenerationAffix(item.prefix_affix_id, item.id, catalog.prefixes)
      : null;
    const suffix = item.suffix_affix_id
      ? requiredItemGenerationAffix(item.suffix_affix_id, item.id, catalog.suffixes)
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
}
