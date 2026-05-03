import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { mapHeroProgressionLedgerEntry } from '../../domain/hero/hero-progression-ledger.mapper';
import { FilterOperator } from '../../enums/filter-operators';
import { HeroProgressionHistoryReadModel } from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';

export interface HeroProgressionHistoryOptions {
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class HeroProgressionHistory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroHistory(
    options: HeroProgressionHistoryOptions = {},
  ): Observable<HeroProgressionHistoryReadModel[]> {
    const limit = normalizeLimit(options.limit);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.backend.getAll<Row<'hero_progression_ledger'>>({
          table: TABLES.hero_progression_ledger,
          filters: {
            heroId: { operator: FilterOperator.EQ, value: context.heroId },
            serverId: { operator: FilterOperator.EQ, value: context.serverId },
          },
          orderBy: { column: 'created_at', ascending: false },
          range: { from: 0, to: limit - 1 },
          camelCase: false,
        }),
      ),
      map((rows) => rows.map(mapHeroProgressionLedgerEntry)),
    );
  }
}

function normalizeLimit(value: number | null | undefined): number {
  if (value === undefined || value === null) {
    return 50;
  }

  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new Error('Progression history limit must be a positive integer.');
  }

  return numeric;
}
