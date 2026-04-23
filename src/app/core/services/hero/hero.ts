import { inject, Injectable } from '@angular/core';
import { EMPTY, filter, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';
import { TABLES } from '../../../core/constants/tables.const';
import { Row } from '../../../core/types/supabase.types';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { mapHeroDerived } from '../../domain/hero/hero-derived.mapper';
import { toObservable } from '@angular/core/rxjs-interop';
import { User } from '@supabase/supabase-js';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { nonNegativeInteger } from '../../utils/number';

@Injectable({ providedIn: 'root' })
export class Hero {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);

  private user$ = toObservable(this.authState.user);

  private get userId(): string | null {
    return this.authState.user()?.id ?? null;
  }

  /**
   * Fetches base hero data (id, name, level, etc.)
   */
  getHeroData() {
    return this.user$.pipe(
      filter((user): user is User => !!user),
      take(1),
      switchMap((user) =>
        this.backend
          .getAll<Row<'hero'>>({
            table: TABLES.hero,
            filters: { id: { operator: FilterOperator.EQ, value: user.id } },
            range: { from: 0, to: 0 },
            camelCase: false,
          })
          .pipe(
            map((rows) => {
              if (!rows[0]) {
                throw new Error('No hero');
              }

              return rows[0];
            })
          )
      )
    );
  }

  /**
   * Fetches base stats like strength, agility, etc.
   */
  getHeroStats() {
    const id = this.userId;

    if (!id) {
      return EMPTY;
    }

    return this.backend
      .getAll<Pick<Row<'hero_stats'>, 'stat_key' | 'value'>>({
        table: TABLES.hero_stats,
        select: 'stat_key, value',
        filters: { heroId: { operator: FilterOperator.EQ, value: id } },
        camelCase: false,
      })
      .pipe(
        map((rows) => rows.reduce((acc, row) => {
          acc[row.stat_key as keyof IHeroStats] = row.value;
          return acc;
        }, {} as IHeroStats))
      );
  }

  /**
   * Fetches derived stats (like dmg, hp, crit, etc.)
   */
  getHeroDerived() {
    const id = this.userId;

    if (!id) {
      return EMPTY;
    }

    return this.backend
      .getAll<Row<'hero_derived'>>({
        table: TABLES.hero_derived,
        filters: { heroId: { operator: FilterOperator.EQ, value: id } },
        range: { from: 0, to: 0 },
        camelCase: false,
      })
      .pipe(
        map((rows) => {
          if (!rows[0]) {
            throw new Error('No derived stats');
          }

          return mapHeroDerived(rows[0]);
        })
      );
  }

  getHeroEstateAddress() {
    const id = this.userId;

    if (!id) {
      return of<string | null>(null);
    }

    return this.backend
      .getAll<Pick<Row<'estates'>, 'address' | 'district_code'>>({
        table: TABLES.estates,
        select: 'address, district_code',
        filters: { heroId: { operator: FilterOperator.EQ, value: id } },
        range: { from: 0, to: 0 },
        camelCase: false,
      })
      .pipe(
        map((rows) => {
        const data = rows[0];
        if (!data?.address) {
          return null;
        }

        if (data.district_code) {
          return `${data.district_code} | ${data.address}`;
        }

        return data.address;
        })
      );
  }

  getHeroResources() {
    const id = this.userId;

    if (!id) {
      return of<Row<'hero_resources'>[]>([]);
    }

    return this.backend.getAll<Row<'hero_resources'>>({
      table: TABLES.hero_resources,
      filters: { heroId: { operator: FilterOperator.EQ, value: id } },
      camelCase: false,
    });
  }

  saveProgressionDraft(stats: Record<string, number>, heroPoints: number) {
    const id = this.userId;

    if (!id) {
      return throwError(() => new Error('Hero is not authenticated.'));
    }

    const statRows = Object.entries(stats).map(([statKey, value]) => ({
      heroId: id,
      statKey,
      value: nonNegativeInteger(value),
    }));

    return forkJoin({
      statsResult: this.backend.upsertMany(TABLES.hero_stats, statRows, 'hero_id,stat_key'),
      derivedResult: this.backend.updateWhere<{ heroId: string; hp: number }>(
        TABLES.hero_derived,
        { heroId: { operator: FilterOperator.EQ, value: id } },
        { hp: nonNegativeInteger(heroPoints) }
      ),
    }).pipe(
      map(({ derivedResult }) => {
        if (derivedResult.length === 0) {
          throw new Error('Hero points update did not affect any row.');
        }
      })
    );
  }
}
