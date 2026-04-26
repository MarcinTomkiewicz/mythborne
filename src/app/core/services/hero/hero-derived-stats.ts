import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  DEFAULT_DERIVED_STAT_SCOPE,
  TRANSITIONAL_HEALTH_FALLBACK,
} from '../../constants/derived-stats.const';
import { TABLES } from '../../constants/tables.const';
import { DerivedStatEntityType, DerivedStatKey } from '../../enums/derived-stat.enum';
import { FilterOperator } from '../../enums/filter-operators';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { Bonus, BonusScope } from '../../types/bonus.types';
import { EntityBonusWithTemplateRow } from '../../types/hero-derived-stats.types';
import { IHeroDerived } from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import {
  filterBonusesForScope,
  findDerivedDefinition,
  mapEntityBonus,
  normalizeRuntimeDerivedStats,
  resolveAdditiveDerivedStats,
  resolveDerivedStatHealth,
  toHeroDerived,
} from '../../utils/hero-derived-stats';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { Hero } from './hero';

@Injectable({ providedIn: 'root' })
export class HeroDerivedStats {
  private readonly backend = inject(Backend);
  private readonly formulaService = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly heroService = inject(Hero);

  resolveActiveHeroDerivedStats(scope: BonusScope = DEFAULT_DERIVED_STAT_SCOPE): Observable<IHeroDerived> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) =>
        forkJoin({
          baseStats: this.heroService.getHeroStats(),
          definitions: this.loadDerivedDefinitions(),
          bonuses: this.loadActiveBonuses(hero),
        }).pipe(
          switchMap(({ baseStats, definitions, bonuses }) =>
            this.resolveDerivedStats(baseStats, definitions, bonuses, hero.level ?? 1, scope),
          ),
        ),
      ),
    );
  }

  resolveDerivedStats(
    baseStats: IHeroStats,
    definitions: Row<'derived_stat_definitions'>[],
    bonuses: Bonus[],
    heroLevel: number,
    scope: BonusScope = DEFAULT_DERIVED_STAT_SCOPE,
  ): Observable<IHeroDerived> {
    const activeBonuses = filterBonusesForScope(bonuses, scope);
    const additiveStats = resolveAdditiveDerivedStats(
      baseStats,
      definitions,
      activeBonuses,
      heroLevel,
    );

    return this.resolveBaseHealth(baseStats, definitions, heroLevel).pipe(
      map((baseHealth) =>
        toHeroDerived(
          normalizeRuntimeDerivedStats({
            ...additiveStats,
            [DerivedStatKey.Health]: resolveDerivedStatHealth(
              baseHealth,
              findDerivedDefinition(DerivedStatKey.Health, definitions),
              baseStats,
              activeBonuses,
              heroLevel,
            ),
          }),
        ),
      ),
    );
  }

  private loadDerivedDefinitions(): Observable<Row<'derived_stat_definitions'>[]> {
    return this.backend.getAll<Row<'derived_stat_definitions'>>({
      table: TABLES.derived_stat_definitions,
      filters: { isActive: { operator: FilterOperator.EQ, value: true } },
      orderBy: { column: 'sort_order' },
      camelCase: false,
    });
  }

  private loadActiveBonuses(hero: Row<'hero'>): Observable<Bonus[]> {
    return forkJoin([
      this.loadEntityBonuses(DerivedStatEntityType.Hero, hero.id),
      hero.origin_id ? this.loadEntityBonuses(DerivedStatEntityType.Origin, hero.origin_id) : of([]),
    ]).pipe(
      map((sources) => sources.flat()),
    );
  }

  private loadEntityBonuses(entityType: DerivedStatEntityType, entityId: string): Observable<Bonus[]> {
    return this.backend
      .getAll<EntityBonusWithTemplateRow>({
        table: TABLES.entity_bonuses,
        select: '*, bonus_templates (*)',
        filters: {
          entityType: { operator: FilterOperator.EQ, value: entityType },
          entityId: { operator: FilterOperator.EQ, value: entityId },
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(
        map((rows) =>
          rows
            .map((row) => mapEntityBonus(row))
            .filter((bonus): bonus is Bonus => !!bonus),
        ),
      );
  }

  private resolveBaseHealth(
    baseStats: IHeroStats,
    definitions: Row<'derived_stat_definitions'>[],
    heroLevel: number,
  ): Observable<number> {
    const definition = findDerivedDefinition(DerivedStatKey.Health, definitions);
    const fallbackHealth = this.resolveFallbackHealth(baseStats);

    if (!definition?.formula_target_key) {
      return of(fallbackHealth);
    }

    return this.formulaService.getAssignedFormula(definition.formula_target_key).pipe(
      map(({ target, formula }) => {
        const result = this.formulaRuntime.evaluate(
          formula.expression,
          {
            ...baseStats,
            heroLevel,
            level: heroLevel,
          },
          target.allowedVariables,
        );

        if (result.error || result.value === null || result.value === undefined) {
          throw new Error(result.error ?? 'Health formula returned no value.');
        }

        return Number(result.value);
      }),
      catchError(() => of(fallbackHealth)),
    );
  }

  private resolveFallbackHealth(baseStats: IHeroStats): number {
    return Math.max(
      1,
      TRANSITIONAL_HEALTH_FALLBACK.base +
        (baseStats.endurance ?? 0) * TRANSITIONAL_HEALTH_FALLBACK.enduranceMultiplier,
    );
  }
}
