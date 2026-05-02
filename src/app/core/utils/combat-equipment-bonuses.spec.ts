import { Bonus } from '../types/bonus.types';
import { BONUS_TARGETS } from '../constants/bonus-targets.const';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
import {
  emptyCombatBonusSnapshot,
  toCombatBonusSnapshotFromEquipment,
} from './combat-equipment-bonuses';

describe('combat equipment bonuses', () => {
  it('starts with empty combat item inputs', () => {
    expect(emptyCombatBonusSnapshot()).toEqual({
      hitBonusFromItems: 0,
      critBonusFromItems: 0,
      criticalDamageBonusFromItems: 0,
      evasionBonusFromItems: 0,
      damageBonusFromItems: 0,
    });
  });

  it('maps scoped equipment bonuses to combat formula inputs', () => {
    const snapshot = toCombatBonusSnapshotFromEquipment(
      [
        createBonus({ target: BONUS_TARGETS.Damage, value: 4 }),
        createBonus({ target: BONUS_TARGETS.MinDamage, value: 2 }),
        createBonus({ target: BONUS_TARGETS.CriticalChance, value: 7 }),
        createBonus({ target: BONUS_TARGETS.CriticalDamage, value: 25 }),
        createBonus({ target: BONUS_TARGETS.EvasionChance, value: 3 }),
        createBonus({ target: BONUS_TARGETS.Damage, value: 99, scope: 'trade' }),
      ],
      10,
      createStats({ strength: 8 })
    );

    expect(snapshot).toEqual({
      hitBonusFromItems: 0,
      critBonusFromItems: 7,
      criticalDamageBonusFromItems: 25,
      evasionBonusFromItems: 3,
      damageBonusFromItems: 6,
    });
  });

  it('resolves per-level and scaled-stat equipment bonuses', () => {
    const snapshot = toCombatBonusSnapshotFromEquipment(
      [
        createBonus({
          target: BONUS_TARGETS.Damage,
          value: 2,
          type: 'per_levels',
          levelsStep: 4,
        }),
        createBonus({
          target: BONUS_TARGETS.CriticalChance,
          value: 1,
          type: 'scaled_stat_bonus',
          sourceStat: 'cunning',
          scalingFactor: 0.5,
        }),
      ],
      9,
      createStats({ cunning: 10 })
    );

    expect(snapshot.damageBonusFromItems).toBe(4);
    expect(snapshot.critBonusFromItems).toBe(6);
  });
});

function createBonus(overrides: Partial<Bonus>): Bonus {
  return {
    target: 'damage',
    value: 1,
    type: 'flat',
    scope: 'combat',
    levelsStep: null,
    sourceStat: null,
    scalingFactor: null,
    ...overrides,
  };
}

function createStats(overrides: Partial<IHeroStats> = {}): IHeroStats {
  return {
    strength: 1,
    dexterity: 1,
    endurance: 1,
    agility: 1,
    cunning: 1,
    charisma: 1,
    wisdom: 1,
    intelligence: 1,
    spirituality: 1,
    ...overrides,
  };
}
