import { TestBed } from '@angular/core/testing';
import { BONUS_TARGETS } from '../../constants/bonus-targets.const';
import { StatsService } from '../stats/stats';
import { HeroCombatantResolver } from './hero-combatant-resolver';

describe('HeroCombatantResolver', () => {
  it('builds a hero combatant snapshot with effective stats and combat equipment inputs', () => {
    TestBed.configureTestingModule({
      providers: [
        HeroCombatantResolver,
        {
          provide: StatsService,
          useValue: {
            getFinalStats: (baseStats: Record<string, number>) => ({
              ...baseStats,
              strength: baseStats['strength'] + 2,
            }),
          },
        },
      ],
    });
    const resolver = TestBed.inject(HeroCombatantResolver);

    const combatant = resolver.resolveHeroCombatant({
      name: 'Hero',
      level: 5,
      baseStats: {
        strength: 10,
        dexterity: 8,
        endurance: 9,
        agility: 7,
        cunning: 6,
        charisma: 5,
        wisdom: 4,
        intelligence: 3,
        spirituality: 2,
      },
      derivedStats: {
        health: 100,
        def: 9,
        luck: 4,
        minDmg: 6,
        maxDmg: 11,
        critical: 12,
        criticalDamage: 50,
        evasion: 8,
      },
      equipmentBonuses: [
        {
          target: BONUS_TARGETS.CriticalDamage,
          value: 30,
          type: 'flat',
          scope: 'combat',
          levelsStep: null,
          sourceStat: null,
          scalingFactor: null,
        },
      ],
      originBonuses: [],
    });

    expect(combatant.baseStats.strength).toBe(12);
    expect(combatant.derived.criticalDamage).toBe(50);
    expect(combatant.bonuses.criticalDamageBonusFromItems).toBe(30);
  });
});
