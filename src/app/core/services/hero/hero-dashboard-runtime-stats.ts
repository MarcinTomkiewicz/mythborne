import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { mapHeroDashboardRuntimeStats } from '../../domain/hero/hero-dashboard-runtime-stats.mapper';
import { HeroDashboardRuntimeStatsReadModel } from '../../domain/hero/hero-dashboard-runtime-stats.model';
import {
  GetHeroDashboardRuntimeStatsRpcArgs,
  GetHeroDashboardRuntimeStatsRpcRow,
} from '../../types/hero-runtime-stats-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class HeroDashboardRuntimeStats {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroRuntimeStats(): Observable<HeroDashboardRuntimeStatsReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => this.getRuntimeStats(context.heroId).pipe(
        map((stats) => {
          if (this.activeHero.state()?.heroId !== context.heroId) {
            throw new Error('Dashboard runtime stats context changed.');
          }

          return stats;
        }),
      )),
    );
  }

  getRuntimeStats(heroId: string): Observable<HeroDashboardRuntimeStatsReadModel> {
    const args: GetHeroDashboardRuntimeStatsRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend
      .rpc<GetHeroDashboardRuntimeStatsRpcRow[]>(
        RPC.get_hero_dashboard_runtime_stats,
        args,
      )
      .pipe(
        map((rows) => {
          const row = firstRow(rows, RPC.get_hero_dashboard_runtime_stats);

          if (row.hero_id !== heroId) {
            throw new Error('Dashboard runtime stats returned a row for a different hero.');
          }

          return mapHeroDashboardRuntimeStats(row);
        }),
      );
  }
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no runtime stats row.`);
  }

  return row;
}
