import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import {
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
} from '../../domain/item/item-generation-admin.model';
import { ItemCatalogService } from './item-catalog';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { TABLES } from '../../constants/tables.const';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { toEntityBonusPayload } from '../../utils/entity-bonus-governance';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBaseAdminService {
  private readonly backend = inject(Backend);
  private readonly itemCatalogService = inject(ItemCatalogService);

  save(draft: EditableItemGenerationBase): Observable<void> {
    const baseTypeKey = trimText(draft.baseTypeKey);

    if (!baseTypeKey) {
      return throwError(() => new Error('item_generation_bases.base_type_key is required.'));
    }

    const payload = {
      key: trimText(draft.key),
      name: trimText(draft.name),
      baseTypeKey,
      baseValue: draft.baseValue,
      description: trimToNull(draft.description),
    };

    return this.saveEntity(draft.id, payload).pipe(
      switchMap((baseId) => this.syncBonuses(baseId, draft.bonuses)),
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.backend.delete(TABLES.item_generation_bases, id).pipe(
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  private saveEntity(
    id: string | null,
    payload: {
      key: string;
      name: string;
      baseTypeKey: string;
      baseValue: number;
      description: string | null;
    }
  ): Observable<string> {
    const request$ = id
      ? this.backend.update<{ id: string }>(TABLES.item_generation_bases, id, payload)
      : this.backend.create<{ id: string }>(TABLES.item_generation_bases, payload);

    return request$.pipe(map((row) => row.id));
  }

  private syncBonuses(
    baseId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Observable<void> {
    return this.backend.delete(TABLES.entity_bonuses, {
      entityType: {
        operator: FilterOperator.EQ,
        value: BONUS_ENTITY_TYPES.ItemGenerationBase,
      },
      entityId: { operator: FilterOperator.EQ, value: baseId },
    }).pipe(
      switchMap(() => {
        const rows = bonuses
          .filter((bonus) => !!bonus.templateId)
          .map((bonus, index) =>
            toEntityBonusPayload({
              entityType: BONUS_ENTITY_TYPES.ItemGenerationBase,
              entityId: baseId,
              bonusTemplateId: bonus.templateId ?? '',
              value: bonus.baseValue,
              description: bonus.description,
              levelIntervalOverride: bonus.levelsStep,
              scalingStatKeyOverride: bonus.sourceStat,
              scopeKeyOverride: bonus.scope,
              qualityScalesValue: bonus.qualityScalesValue ?? false,
              sortOrder: index,
              isActive: true,
            }),
          );

        return rows.length
          ? this.backend.createMany(TABLES.entity_bonuses, rows).pipe(map(() => void 0))
          : of(void 0);
      })
    );
  }
}
