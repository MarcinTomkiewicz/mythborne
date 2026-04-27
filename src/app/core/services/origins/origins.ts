import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Origin, OriginBonus } from '../../domain/origin/origin.model';
import { mapOrigin, mapOriginBonus } from '../../utils/origin-mappers';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { TABLES } from '../../constants/tables.const';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { Row } from '../../types/supabase.types';

@Injectable({ providedIn: 'root' })
export class Origins {
  private backend = inject(Backend);

  getOrigins(): Observable<Origin[]> {
    return this.backend
      .getAll<Row<'origin'>>({
        table: TABLES.origin,
        orderBy: { column: 'name' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapOrigin)));
  }

  getBonusesForOrigin(originId: string): Observable<OriginBonus[]> {
    return this.backend
      .getAll<CanonicalEntityBonusWithTemplateRow>({
        table: TABLES.entity_bonuses,
        filters: {
          entityType: { operator: FilterOperator.EQ, value: BONUS_ENTITY_TYPES.Origin },
          entityId: { operator: FilterOperator.EQ, value: originId },
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        select: '*, bonus_templates (*)',
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(
        map((rows) => {
          return rows.map(mapOriginBonus);
        })
      );
  }

  getAllOriginBonuses(): Observable<CanonicalEntityBonusWithTemplateRow[]> {
    return this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
      table: TABLES.entity_bonuses,
      filters: {
        entityType: { operator: FilterOperator.EQ, value: BONUS_ENTITY_TYPES.Origin },
      },
      select: '*, bonus_templates (*)',
      orderBy: { column: 'sort_order' },
      camelCase: false,
    });
  }

  getOriginWithBonuses(originId: string): Observable<{
    origin: Origin;
    bonuses: OriginBonus[];
  }> {
    return this.backend.getAll<Row<'origin'>>({
      table: TABLES.origin,
      filters: { id: { operator: FilterOperator.EQ, value: originId } },
      range: { from: 0, to: 0 },
      camelCase: false,
    }).pipe(
      map((rows) => {
        if (!rows[0]) {
          throw new Error('Origin not found.');
        }

        return mapOrigin(rows[0]);
      }),
      switchMap((origin) =>
        this.getBonusesForOrigin(originId).pipe(
          map((bonuses) => ({ origin, bonuses }))
        )
      )
    );
  }
}
