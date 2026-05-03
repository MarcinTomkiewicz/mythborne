import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { TABLES } from '../../constants/tables.const';
import { BonusSource } from '../../domain/bonus/bonus.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { finalStatValue } from '../../utils/bonus-calculator';
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
    return this.backend
      .getAll<Row<'derived_stat_definitions'>>({
        table: TABLES.derived_stat_definitions,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: { column: 'sort_order', ascending: true },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map((row) => mapDerivedStatDefinition(row))));
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
    sources: BonusSource[],
    options?: {
      heroLevel?: number;
      bonusScope?: string;
      sourceStats?: Record<string, number>;
    }
  ): Record<keyof T, number> {
    const result: Partial<Record<keyof T, number>> = {};

    for (const key in baseStats) {
      const baseValue = baseStats[key];
      result[key] = finalStatValue(baseValue, key, sources, options);
    }

    return result as Record<keyof T, number>;
  }
}

function mapDerivedStatDefinition(row: Row<'derived_stat_definitions'>): IStat {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    order: row.sort_order,
    description: row.description,
  };
}
