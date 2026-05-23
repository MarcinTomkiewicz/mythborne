import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { CombatPageLoadedData } from '../../domain/combat/combat-page-loader.model';
import { Origin, OriginBonus } from '../../domain/origin/origin.model';
import { Hero } from '../hero/hero';
import { HeroDerivedStats } from '../hero/hero-derived-stats';
import { HeroDashboardRuntimeStats } from '../hero/hero-dashboard-runtime-stats';
import { EquipmentBonusesService } from '../items/equipment-bonuses';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { CombatBalanceService } from './combat-balance';
import { CombatDemoFactoryService } from './combat-demo-factory';
import { CombatDictionariesService } from './combat-dictionaries';
import { HeroCombatantResolver } from './hero-combatant-resolver';

@Injectable({ providedIn: 'root' })
export class CombatPageLoaderService {
  private readonly heroService = inject(Hero);
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly heroRuntimeStats = inject(HeroDashboardRuntimeStats);
  private readonly equipmentBonuses = inject(EquipmentBonusesService);
  private readonly originsService = inject(Origins);
  private readonly statsService = inject(StatsService);
  private readonly balance = inject(CombatBalanceService);
  private readonly demoFactory = inject(CombatDemoFactoryService);
  private readonly dictionaries = inject(CombatDictionariesService);
  private readonly heroCombatantResolver = inject(HeroCombatantResolver);

  load(): Observable<CombatPageLoadedData> {
    return forkJoin({
      hero: this.heroService.getHeroData(),
      baseStats: this.heroService.getHeroStats(),
      statsDefinitions: this.statsService.getStats(),
      rules: this.balance.getRules(),
      dictionaries: this.dictionaries.getCombatDictionaries(),
    }).pipe(
      switchMap(({ hero, baseStats, statsDefinitions, rules, dictionaries }) => {
        const originRequest$: Observable<{
          origin: Origin | null;
          bonuses: OriginBonus[];
        }> = hero.origin_id
          ? this.originsService.getOriginWithBonuses(hero.origin_id)
          : of({ origin: null, bonuses: [] });

        return originRequest$.pipe(
          switchMap(({ origin, bonuses }) =>
            forkJoin({
              derivedStats: this.heroDerivedStats.resolveActiveHeroDerivedStats('combat'),
              runtimeStats: this.heroRuntimeStats.getRuntimeStats(hero.id),
              equipmentBonuses: this.equipmentBonuses.getEquipmentBonusesForHero(hero.id),
            }).pipe(
              map(({ derivedStats, runtimeStats, equipmentBonuses }) => {
                const heroSnapshot = this.heroCombatantResolver.resolveHeroCombatant({
                  name: hero.name,
                  level: hero.level ?? 1,
                  baseStats,
                  derivedStats,
                  equipmentBonuses,
                  originBonuses: bonuses,
                });
                const enemySnapshot = this.demoFactory.createOpponent(heroSnapshot.level);

                return {
                  heroId: hero.id,
                  origin,
                  originBonuses: bonuses,
                  statsDefinitions,
                  runtimeStats,
                  rules,
                  dictionaries,
                  hero: heroSnapshot,
                  enemy: enemySnapshot,
                };
              }),
            ),
          ),
        );
      }),
    );
  }
}
