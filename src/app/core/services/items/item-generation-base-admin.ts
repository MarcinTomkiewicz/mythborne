import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
} from '../../domain/item/item-generation-admin.model';
import { ItemCatalogService } from './item-catalog';
import { ItemGenerationBonusTemplateAdminService } from './item-generation-bonus-template-admin';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { trimText, trimToNull } from '../../utils/normalize-text';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBaseAdminService {
  private readonly backend = inject(Backend);
  private readonly itemCatalogService = inject(ItemCatalogService);
  private readonly bonusTemplates = inject(ItemGenerationBonusTemplateAdminService);

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
        return bonuses.length
          ? forkJoin(
              bonuses.map((bonus) =>
                this.bonusTemplates.ensureTemplateId(bonus).pipe(
                  map((templateId) => ({
                    base_id: baseId,
                    template_id: templateId,
                    value: bonus.value,
                  }))
                )
              )
            )
          : of([]);
      }),
      switchMap((rows) =>
        rows.length
          ? this.backend.createMany('item_generation_base_bonuses', rows)
          : of([])
      ),
      map(() => void 0)
    );
  }
}
