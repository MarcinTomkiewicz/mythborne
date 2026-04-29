import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Row } from '../../types/supabase.types';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import {
  mapSaveStatAllocationResult,
  SaveStatAllocationResult,
  toSaveStatAllocationRpcArgs,
} from '../../utils/stat-allocation-rpc';
import { SaveStatAllocationRpcRow } from '../../types/stat-allocation-rpc.types';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class Hero {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);

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

  getHeroEstateAddress() {
    return this.getHeroData()
      .pipe(
        switchMap((hero) =>
          this.backend.getAll<Pick<Row<'estates'>, 'address' | 'district_code'>>({
            table: TABLES.estates,
            select: 'address, district_code',
            filters: {
              heroId: { operator: FilterOperator.EQ, value: hero.id },
              serverId: { operator: FilterOperator.EQ, value: hero.server_id },
            },
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

  saveProgressionDraft(
    stats: Record<string, number>,
    nextCharacterPoints: number,
    saveContext: {
      previousCharacterPoints: number;
    },
  ): Observable<SaveStatAllocationResult> {
    return this.getHeroData().pipe(
      switchMap((hero) =>
        this.backend.rpc<SaveStatAllocationRpcRow[]>(
          RPC.save_stat_allocation,
          toSaveStatAllocationRpcArgs({
            heroId: hero.id,
            stats,
            previousCharacterPoints: saveContext.previousCharacterPoints,
            nextCharacterPoints,
          }),
        ),
      ),
      map((rows) => {
        const row = Array.isArray(rows) ? rows[0] : null;

        if (!row) {
          throw new Error('Stat allocation save returned no result.');
        }

        const result = mapSaveStatAllocationResult(row);
        const activeHero = this.authState.hero();

        if (activeHero) {
          this.authState.setHero({
            ...activeHero,
            characterPoints: result.characterPointsAfter,
          });
        }

        return result;
      }),
    );
  }
}
