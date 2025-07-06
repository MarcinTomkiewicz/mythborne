import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Origin, OriginBonus } from '../../domain/origin/origin.model';
import { mapOrigin, mapOriginBonus } from '../../domain/origin/origin.mapper';
import { OriginBonusWithTemplate } from '../../domain/origin/origin-bonus.mapper';

@Injectable({ providedIn: 'root' })
export class Origins {
  private supabase = inject(SupabaseService);

  getOrigins(): Observable<Origin[]> {
    return this.supabase
      .getAll('origin', {
        orderBy: { column: 'name' },
      })
      .pipe(map((rows) => rows.map(mapOrigin)));
  }

  getBonusesForOrigin(originId: string): Observable<OriginBonus[]> {
    return this.supabase
      .getAll('origin_bonuses', {
        filters: { origin_id: originId },
        select: '*, bonus_templates (*)',
      })
      .pipe(
        map((rows) => {
          return (rows as OriginBonusWithTemplate[]).map(mapOriginBonus);
        })
      );
  }

  getAllOriginBonuses(): Observable<any[]> {
    return this.supabase.getAll('origin_bonuses');
  }

  getOriginWithBonuses(originId: string): Observable<{
    origin: Origin;
    bonuses: OriginBonus[];
  }> {
    return this.supabase.getById('origin', originId).pipe(
      map(mapOrigin),
      switchMap((origin) =>
        this.getBonusesForOrigin(originId).pipe(
          map((bonuses) => ({ origin, bonuses }))
        )
      )
    );
  }
}
