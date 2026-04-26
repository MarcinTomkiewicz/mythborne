import { inject, Injectable } from '@angular/core';
import { EMPTY, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { TABLES } from '../../../core/constants/tables.const';
import { Row } from '../../../core/types/supabase.types';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { mapHeroDerived } from '../../domain/hero/hero-derived.mapper';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { nonNegativeInteger } from '../../utils/number';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class Hero {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);

  private get userId(): string | null {
    return this.authState.user()?.id ?? null;
  }

  /**
   * Fetches base hero data (id, name, level, etc.)
   */
  getHeroData() {
    return this.activeHero.requireActiveHero().pipe(
      map((context) => context.heroRow),
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

    return this.getHeroData()
      .pipe(
        switchMap((hero) =>
          this.backend.getAll<Pick<Row<'hero_stats'>, 'stat_key' | 'value'>>({
            table: TABLES.hero_stats,
            select: 'stat_key, value',
            filters: { heroId: { operator: FilterOperator.EQ, value: hero.id } },
            camelCase: false,
          })
        )
      )
      .pipe(
        map((rows) => rows.reduce((acc, row) => {
          acc[row.stat_key as keyof IHeroStats] = row.value;
          return acc;
        }, {} as IHeroStats))
      );
  }

  /**
   * Fetches derived stats (like dmg, health, crit, etc.)
   */
  getHeroDerived() {
    const id = this.userId;

    if (!id) {
      return EMPTY;
    }

    return this.getHeroData()
      .pipe(
        switchMap((hero) =>
          this.backend.getAll<Row<'hero_derived'>>({
            table: TABLES.hero_derived,
            filters: { heroId: { operator: FilterOperator.EQ, value: hero.id } },
            range: { from: 0, to: 0 },
            camelCase: false,
          })
        )
      )
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

    return this.getHeroData()
      .pipe(
        switchMap((hero) =>
          this.backend.getAll<Pick<Row<'estates'>, 'address' | 'district_code'>>({
            table: TABLES.estates,
            select: 'address, district_code',
            filters: { heroId: { operator: FilterOperator.EQ, value: hero.id } },
            range: { from: 0, to: 0 },
            camelCase: false,
          })
        )
      )
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

    return this.getHeroData().pipe(
      switchMap((hero) =>
        this.backend.getAll<Row<'hero_resources'>>({
          table: TABLES.hero_resources,
          filters: { heroId: { operator: FilterOperator.EQ, value: hero.id } },
          camelCase: false,
        })
      )
    );
  }

  saveProgressionDraft(stats: Record<string, number>, characterPoints: number) {
    const id = this.userId;

    if (!id) {
      return throwError(() => new Error('Hero is not authenticated.'));
    }

    return this.getHeroData().pipe(
      switchMap((hero) => {
        const statRows = Object.entries(stats).map(([statKey, value]) => ({
          heroId: hero.id,
          statKey,
          value: nonNegativeInteger(value),
        }));

        return forkJoin({
          statsResult: this.backend.upsertMany(TABLES.hero_stats, statRows, 'hero_id,stat_key'),
          heroResult: this.backend.updateWhere<Pick<Row<'hero'>, 'id' | 'character_points'>>(
            TABLES.hero,
            { id: { operator: FilterOperator.EQ, value: hero.id } },
            { characterPoints: nonNegativeInteger(characterPoints) }
          ),
        });
      }),
      map(({ heroResult }) => {
        if (heroResult.length === 0) {
          throw new Error('Character Points update did not affect any row.');
        }
      })
    );
  }
}
