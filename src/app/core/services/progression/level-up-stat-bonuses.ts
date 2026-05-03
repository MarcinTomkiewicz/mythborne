import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { LevelUpStatBonusAdminData } from '../../domain/progression/level-up-stat-bonus.model';
import { Row } from '../../types/supabase.types';
import {
  mapLevelUpStatBonusRule,
  mapLevelUpStatBonusRuleStat,
  toLevelUpStatBonusAdminData,
} from '../../utils/level-up-stat-bonus-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class LevelUpStatBonuses {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<LevelUpStatBonusAdminData> {
    return forkJoin({
      rules: this.backend.getAll<Row<'level_up_stat_bonus_rules'>>({
        table: TABLES.level_up_stat_bonus_rules,
        orderBy: { column: 'sort_order', ascending: true },
        camelCase: false,
      }),
      ruleStats: this.backend.getAll<Row<'level_up_stat_bonus_rule_stats'>>({
        table: TABLES.level_up_stat_bonus_rule_stats,
        orderBy: { column: 'sort_order', ascending: true },
        camelCase: false,
      }),
      stats: this.backend.getAll<Pick<Row<'stats'>, 'key' | 'label'>>({
        table: TABLES.stats,
        select: 'key, label',
        orderBy: { column: 'order', ascending: true },
        camelCase: false,
      }),
    }).pipe(
      map(({ rules, ruleStats, stats }) =>
        toLevelUpStatBonusAdminData({
          rules: rules.map(mapLevelUpStatBonusRule),
          ruleStats: ruleStats.map(mapLevelUpStatBonusRuleStat),
          stats,
        })
      ),
    );
  }
}
