import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { TABLES } from '../../constants/tables.const';
import { BonusSource } from '../../domain/bonus/bonus.model';
import { finalStatValue } from '../../domain/bonus/bonus-calculator';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private backend = inject(Backend);

  getStats(): Observable<IStat[]> {
    return this.backend.getAll<IStat>({
      table: TABLES.stats,
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
    return this.backend.getAll<IStat>({
      table: 'stats_derived',
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

getFinalStats<T extends Record<string, number>>(
  baseStats: T,
  sources: BonusSource[]
): Record<keyof T, number> {
  const result: Partial<Record<keyof T, number>> = {};

  for (const key in baseStats) {
    const baseValue = baseStats[key];
    result[key] = finalStatValue(baseValue, key, sources);
  }

  return result as Record<keyof T, number>;
}

}
