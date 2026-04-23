import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Origin, OriginBonus } from '../../domain/origin/origin.model';
import { mapOrigin, mapOriginBonus } from '../../domain/origin/origin.mapper';
import { OriginBonusWithTemplate } from '../../types/domain-row.types';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';

@Injectable({ providedIn: 'root' })
export class Origins {
  private backend = inject(Backend);

  getOrigins(): Observable<Origin[]> {
    return this.backend
      .getAll<any>({
        table: 'origin',
        orderBy: { column: 'name' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapOrigin)));
  }

  getBonusesForOrigin(originId: string): Observable<OriginBonus[]> {
    return this.backend
      .getAll<OriginBonusWithTemplate>({
        table: 'origin_bonuses',
        filters: { originId: { operator: FilterOperator.EQ, value: originId } },
        select: '*, bonus_templates (*)',
        camelCase: false,
      })
      .pipe(
        map((rows) => {
          return (rows as OriginBonusWithTemplate[]).map(mapOriginBonus);
        })
      );
  }

  getAllOriginBonuses(): Observable<any[]> {
    return this.backend.getAll({ table: 'origin_bonuses', camelCase: false });
  }

  getOriginWithBonuses(originId: string): Observable<{
    origin: Origin;
    bonuses: OriginBonus[];
  }> {
    return this.backend.getAll<any>({
      table: 'origin',
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
