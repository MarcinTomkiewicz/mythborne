import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import {
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
} from '../../domain/item/item-generation-admin.model';
import { ItemCatalogService } from './item-catalog';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { trimText, trimToNull } from '../../utils/normalize-text';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBaseAdminService {
  private readonly backend = inject(Backend);
  private readonly itemCatalogService = inject(ItemCatalogService);

  save(draft: EditableItemGenerationBase): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      name: trimText(draft.name),
      slot: draft.slot,
      baseValue: draft.baseValue,
      description: trimToNull(draft.description),
    };

    return this.saveEntity(draft.id, payload).pipe(
      switchMap((baseId) => this.syncBonuses(baseId, draft.bonuses)),
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.backend.delete('item_generation_bases', id).pipe(
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  private saveEntity(
    id: string | null,
    payload: {
      key: string;
      name: string;
      slot: EditableItemGenerationBase['slot'];
      baseValue: number;
      description: string | null;
    }
  ): Observable<string> {
    const request$ = id
      ? this.backend.update<{ id: string }>('item_generation_bases', id, payload)
      : this.backend.create<{ id: string }>('item_generation_bases', payload);

    return request$.pipe(map((row) => row.id));
  }

  private syncBonuses(
    baseId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Observable<void> {
    return this.backend.delete('item_generation_base_bonuses', {
      baseId: { operator: FilterOperator.EQ, value: baseId },
    }).pipe(
      switchMap(() => {
        const rows = bonuses
          .filter((bonus) => !!bonus.templateId)
          .map((bonus) => ({
            base_id: baseId,
            template_id: bonus.templateId,
            value: bonus.baseValue,
            base_value: bonus.baseValue,
            levels_step: bonus.levelsStep,
            source_stat: bonus.sourceStat,
            scaling_factor: bonus.scalingFactor,
          }));

        return rows.length
          ? this.backend.createMany('item_generation_base_bonuses', rows).pipe(map(() => void 0))
          : of(void 0);
      })
    );
  }
}
