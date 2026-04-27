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
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import { toEntityBonusPayload } from '../../utils/entity-bonus-governance';

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
    return this.backend.delete(TABLES.item_generation_affixes, id).pipe(
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
      ? this.backend.update<{ id: string }>(TABLES.item_generation_affixes, id, payload)
      : this.backend.create<{ id: string }>(TABLES.item_generation_affixes, payload);

    return request$.pipe(map((row) => row.id));
  }

  private syncBonuses(
    affixId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Observable<void> {
    return this.backend.delete(TABLES.entity_bonuses, {
      entityType: {
        operator: FilterOperator.EQ,
        value: BONUS_ENTITY_TYPES.ItemGenerationAffix,
      },
      entityId: { operator: FilterOperator.EQ, value: affixId },
    }).pipe(
      switchMap(() => {
        const rows = bonuses
          .filter((bonus) => !!bonus.templateId)
          .map((bonus, index) =>
            toEntityBonusPayload({
              entityType: BONUS_ENTITY_TYPES.ItemGenerationAffix,
              entityId: affixId,
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
