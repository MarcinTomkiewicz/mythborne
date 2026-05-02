import { Injectable, inject } from '@angular/core';
import { BonusSource } from '../../domain/bonus/bonus.model';
import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import { OriginBonus } from '../../domain/origin/origin.model';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IHeroDerived } from '../../types/hero.types';
import { toCombatBonusSnapshotFromEquipment } from '../../utils/combat-equipment-bonuses';
import { StatsService } from '../stats/stats';

export interface HeroCombatantResolverInput {
  name: string;
  level: number;
  baseStats: IHeroStats;
  derivedStats: IHeroDerived;
  equipmentBonuses: BonusSource['bonuses'];
  originBonuses: readonly OriginBonus[];
}

@Injectable({ providedIn: 'root' })
export class HeroCombatantResolver {
  private readonly statsService = inject(StatsService);

  resolveHeroCombatant(input: HeroCombatantResolverInput): CombatantSnapshot {
    const effectiveBaseStats = this.statsService.getFinalStats(
      input.baseStats,
      [this.originBonusSource(input.originBonuses)],
      { heroLevel: input.level },
    ) as IHeroStats;

    return {
      key: 'hero',
      name: input.name,
      level: input.level,
      baseStats: effectiveBaseStats,
      derived: {
        health: input.derivedStats.health,
        def: input.derivedStats.def,
        luck: input.derivedStats.luck,
        minDmg: input.derivedStats.minDmg,
        maxDmg: input.derivedStats.maxDmg,
        critical: input.derivedStats.critical,
        criticalDamage: input.derivedStats.criticalDamage,
        evasion: input.derivedStats.evasion,
      },
      bonuses: toCombatBonusSnapshotFromEquipment(
        input.equipmentBonuses,
        input.level,
        effectiveBaseStats,
      ),
    };
  }

  private originBonusSource(originBonuses: readonly OriginBonus[]): BonusSource {
    return {
      name: 'origin',
      bonuses: originBonuses.map((bonus) => ({
        target: bonus.target ?? '',
        value: bonus.baseValue,
        type: bonus.type,
        scope: bonus.scope,
        levelsStep: bonus.levelsStep,
        sourceStat: bonus.sourceStat,
        scalingFactor: bonus.scalingFactor,
      })),
    };
  }
}
