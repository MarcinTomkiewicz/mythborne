import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { mapHeroProgressionLedgerEntry } from '../../domain/hero/hero-progression-ledger.mapper';
import { LevelUpStatBonusGrantView } from '../../domain/progression/level-up-stat-bonus.model';
import { FilterOperator } from '../../enums/filter-operators';
import { HeroProgressionHistoryReadModel } from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import {
  mapLevelUpStatBonusGrant,
  mapLevelUpStatBonusRule,
  mapLevelUpStatBonusRuleStat,
  toLevelUpStatBonusGrantViews,
} from '../../utils/level-up-stat-bonus-mappers';
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
        }).pipe(
          switchMap((rows) => this.withStatBonusGrants(rows, context.heroId, context.serverId)),
        ),
      ),
    );
  }

  private withStatBonusGrants(
    rows: Row<'hero_progression_ledger'>[],
    heroId: string,
    serverId: string,
  ): Observable<HeroProgressionHistoryReadModel[]> {
    const history = rows.map(mapHeroProgressionLedgerEntry);
    const ledgerIds = history
      .filter((entry) => entry.entryType === 'level_up')
      .map((entry) => entry.id);

    if (!ledgerIds.length) {
      return of(history);
    }

    return forkJoin({
      grants: this.backend.getAll<Row<'hero_level_stat_bonus_grants'>>({
        table: TABLES.hero_level_stat_bonus_grants,
        filters: {
          heroId: { operator: FilterOperator.EQ, value: heroId },
          serverId: { operator: FilterOperator.EQ, value: serverId },
          levelUpLedgerId: { operator: FilterOperator.IN, value: ledgerIds },
        },
        orderBy: { column: 'created_at', ascending: true },
        camelCase: false,
      }),
      rules: this.backend.getAll<Row<'level_up_stat_bonus_rules'>>({
        table: TABLES.level_up_stat_bonus_rules,
        camelCase: false,
      }),
      ruleStats: this.backend.getAll<Row<'level_up_stat_bonus_rule_stats'>>({
        table: TABLES.level_up_stat_bonus_rule_stats,
        camelCase: false,
      }),
      stats: this.backend.getAll<Pick<Row<'stats'>, 'key' | 'label'>>({
        table: TABLES.stats,
        select: 'key, label',
        camelCase: false,
      }),
    }).pipe(
      map(({ grants, rules, ruleStats, stats }) => {
        const grantViews = toLevelUpStatBonusGrantViews({
          grants: grants.map(mapLevelUpStatBonusGrant),
          rules: rules.map(mapLevelUpStatBonusRule),
          ruleStats: ruleStats.map(mapLevelUpStatBonusRuleStat),
          stats,
        });

        return history.map((entry) => ({
          ...entry,
          statBonusGrants: grantsForLedger(entry.id, grantViews),
        }));
      }),
    );
  }
}

function grantsForLedger(
  ledgerId: string,
  grants: readonly LevelUpStatBonusGrantView[],
): LevelUpStatBonusGrantView[] {
  return grants.filter((entry) => entry.grant.levelUpLedgerId === ledgerId);
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
