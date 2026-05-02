import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import { CombatBalanceService } from './combat-balance';
import { CombatResolverService } from './combat-resolver';

describe('CombatResolverService', () => {
  it('uses critical damage percent instead of a fixed critical multiplier', () => {
    let receivedCritMultiplier = 0;
    const balance = {
      evaluateHitWindow: () => 100,
      evaluateEvasionChance: () => 0,
      evaluateCriticalChance: () => 100,
      evaluateFinalDamage: (
        _rules: unknown,
        _attacker: CombatantSnapshot,
        _defender: CombatantSnapshot,
        rolledDamage: number,
        critMultiplier: number,
      ) => {
        receivedCritMultiplier = critMultiplier;
        return Math.round(rolledDamage * critMultiplier);
      },
    } as unknown as CombatBalanceService;
    const resolver = new CombatResolverService(balance);
    spyOn(Math, 'random').and.returnValues(0.99, 0, 0);

    const result = resolver.resolvePlayerAttack(
      1,
      createCombatant({
        criticalDamage: 30,
        criticalDamageBonusFromItems: 20,
      }),
      createCombatant({ key: 'defender', name: 'Defender' }),
      100,
      {} as never,
      50,
      0,
    );

    expect(receivedCritMultiplier).toBe(1.5);
    expect(result.entry.wasCritical).toBeTrue();
    expect(result.entry.damage).toBe(15);
  });
});

function createCombatant(overrides: {
  key?: string;
  name?: string;
  criticalDamage?: number;
  criticalDamageBonusFromItems?: number;
} = {}): CombatantSnapshot {
  return {
    key: overrides.key ?? 'attacker',
    name: overrides.name ?? 'Attacker',
    level: 1,
    baseStats: {
      strength: 10,
      dexterity: 10,
      endurance: 10,
      agility: 10,
      cunning: 10,
      charisma: 10,
      wisdom: 10,
      intelligence: 10,
      spirituality: 10,
    },
    derived: {
      health: 100,
      def: 0,
      luck: 0,
      minDmg: 10,
      maxDmg: 10,
      critical: 100,
      criticalDamage: overrides.criticalDamage ?? 50,
      evasion: 0,
    },
    bonuses: {
      hitBonusFromItems: 0,
      critBonusFromItems: 0,
      criticalDamageBonusFromItems: overrides.criticalDamageBonusFromItems ?? 0,
      evasionBonusFromItems: 0,
      damageBonusFromItems: 0,
    },
  };
}
