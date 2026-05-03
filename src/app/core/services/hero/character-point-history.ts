import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { mapCharacterPointLedgerEntry } from '../../domain/hero/character-point-ledger.mapper';
import { FilterOperator } from '../../enums/filter-operators';
import { CharacterPointHistoryReadModel } from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';

export interface CharacterPointHistoryOptions {
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CharacterPointHistory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroHistory(
    options: CharacterPointHistoryOptions = {},
  ): Observable<CharacterPointHistoryReadModel[]> {
    const limit = normalizeLimit(options.limit);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.backend.getAll<Row<'character_point_ledger'>>({
          table: TABLES.character_point_ledger,
          filters: {
            heroId: { operator: FilterOperator.EQ, value: context.heroId },
            serverId: { operator: FilterOperator.EQ, value: context.serverId },
          },
          orderBy: { column: 'created_at', ascending: false },
          range: { from: 0, to: limit - 1 },
          camelCase: false,
        }),
      ),
      map((rows) => rows.map(mapCharacterPointLedgerEntry)),
    );
  }
}

function normalizeLimit(value: number | null | undefined): number {
  if (value === undefined || value === null) {
    return 10;
  }

  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new Error('Character Points history limit must be a positive integer.');
  }

  return numeric;
}
