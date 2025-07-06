import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { SupabaseService } from '../supabase/supabase';
import { TABLES } from '../../constants/tables.const';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private supabase = inject(SupabaseService);

  getStats(): Observable<IStat[]> {
    return this.supabase.getAll<'stats'>(TABLES.stats, {
      orderBy: { column: 'order', ascending: true },
    });
  }

  getStatsLabels(): Observable<Record<string, string>> {
    return this.getStats().pipe(
      map((stats) =>
        stats.reduce((acc, stat) => {
          acc[stat.key] = stat.label;
          return acc;
        }, {} as Record<string, string>)
      )
    );
  }

  getDerivedStats(): Observable<IStat[]> {
    return this.supabase.getAll<'stats_derived'>('stats_derived', {
      orderBy: { column: 'order', ascending: true },
    });
  }

  getAllStatLabels(): Observable<Record<string, string>> {
    return forkJoin({
      base: this.getStats(),
      derived: this.getDerivedStats(),
    }).pipe(
      map(({ base, derived }) => {
        const baseMap = Object.fromEntries(
          base.map((stat) => [stat.key, stat.label])
        );
        const derivedMap = Object.fromEntries(
          derived.map((stat) => [stat.key, stat.label])
        );
        return { ...baseMap, ...derivedMap };
      })
    );
  }
}
