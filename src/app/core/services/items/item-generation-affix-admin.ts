import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBonus,
} from '../../domain/item/item-generation-admin.model';
import { ItemCatalogService } from './item-catalog';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { trimText, trimToNull } from '../../utils/normalize-text';

@Injectable({ providedIn: 'root' })
export class ItemGenerationAffixAdminService {
  private readonly backend = inject(Backend);
  private readonly itemCatalogService = inject(ItemCatalogService);

  save(draft: EditableItemGenerationAffix): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      kind: draft.kind,
      name: trimText(draft.name),
      goldValue: draft.goldValue,
      description: trimToNull(draft.description),
    };

    return this.saveEntity(draft.id, payload).pipe(
      switchMap((affixId) => this.syncBonuses(affixId, draft.bonuses)),
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.backend.delete('item_generation_affixes', id).pipe(
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  private saveEntity(
    id: string | null,
    payload: {
      key: string;
      kind: EditableItemGenerationAffix['kind'];
      name: string;
      goldValue: number;
      description: string | null;
    }
  ): Observable<string> {
    const request$ = id
      ? this.backend.update<{ id: string }>('item_generation_affixes', id, payload)
      : this.backend.create<{ id: string }>('item_generation_affixes', payload);

    return request$.pipe(map((row) => row.id));
  }

  private syncBonuses(
    affixId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Observable<void> {
    return this.backend.delete('item_generation_affix_bonuses', {
      affixId: { operator: FilterOperator.EQ, value: affixId },
    }).pipe(
      switchMap(() => {
        const rows = bonuses
          .filter((bonus) => !!bonus.templateId)
          .map((bonus) => ({
            affix_id: affixId,
            template_id: bonus.templateId,
            value: bonus.baseValue,
          }));

        return rows.length
          ? this.backend.createMany('item_generation_affix_bonuses', rows).pipe(map(() => void 0))
          : of(void 0);
      })
    );
  }
}
