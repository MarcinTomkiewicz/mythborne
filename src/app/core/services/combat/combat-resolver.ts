import { Injectable } from '@angular/core';
import {
  CombatBalanceRules,
  CombatantSnapshot,
  CombatEntryResult,
  CombatRoundEntry,
} from '../../domain/combat/combat-sandbox.model';
import { CombatBalanceService } from './combat-balance';
import { isInsideWalkingDeadZone, toWalkingDeadZone } from '../../utils/combat-walking-dead';

@Injectable({ providedIn: 'root' })
export class CombatResolverService {
  constructor(private readonly balance: CombatBalanceService) {}

  resolvePlayerAttack(
    turn: number,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    defenderHealthBefore: number,
    rules: CombatBalanceRules,
    indicatorPosition: number,
    streak: number
  ): { entry: CombatRoundEntry; defenderHealthAfter: number; nextStreak: number } {
    const hitWindowWidth = this.balance.evaluateHitWindow(rules, attacker, defender);
    const hitWindow = toWalkingDeadZone(hitWindowWidth, streak);
    const timingHit = isInsideWalkingDeadZone(indicatorPosition, hitWindow.start, hitWindow.end);

    if (!timingHit) {
      return {
        defenderHealthAfter: defenderHealthBefore,
        nextStreak: 0,
        entry: this.createMissEntry(
          turn,
          attacker,
          defender,
          defenderHealthBefore,
          indicatorPosition,
          hitWindow
        ),
      };
    }

    return this.resolveSuccessfulTimingAttack(
      turn,
      attacker,
      defender,
      defenderHealthBefore,
      rules,
      indicatorPosition,
      hitWindow
    );
  }

  resolveAutoAttack(
    turn: number,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    defenderHealthBefore: number,
    rules: CombatBalanceRules
  ): { entry: CombatRoundEntry; defenderHealthAfter: number } {
    const hitWindowWidth = this.balance.evaluateHitWindow(rules, attacker, defender);
    const indicatorPosition = Number((Math.random() * 100).toFixed(2));
    const hitWindow = toWalkingDeadZone(hitWindowWidth, 0);
    const timingHit = isInsideWalkingDeadZone(indicatorPosition, hitWindow.start, hitWindow.end);

    if (!timingHit) {
      return {
        defenderHealthAfter: defenderHealthBefore,
        entry: this.createMissEntry(
          turn,
          attacker,
          defender,
          defenderHealthBefore,
          indicatorPosition,
          hitWindow
        ),
      };
    }

    const result = this.resolveSuccessfulTimingAttack(
      turn,
      attacker,
      defender,
      defenderHealthBefore,
      rules,
      indicatorPosition,
      hitWindow
    );

    return {
      defenderHealthAfter: result.defenderHealthAfter,
      entry: result.entry,
    };
  }

  private resolveSuccessfulTimingAttack(
    turn: number,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    defenderHealthBefore: number,
    rules: CombatBalanceRules,
    indicatorPosition: number,
    hitWindow: { start: number; end: number; width: number }
  ) {
    const evasionChance = this.balance.evaluateEvasionChance(rules, attacker, defender);
    const wasDodged = Math.random() * 100 < evasionChance;

    if (wasDodged) {
      return {
        defenderHealthAfter: defenderHealthBefore,
        nextStreak: 1,
        entry: {
          turn,
          attackerKey: attacker.key,
          attackerName: attacker.name,
          defenderKey: defender.key,
          defenderName: defender.name,
          indicatorPosition,
          hitWindowStart: hitWindow.start,
          hitWindowEnd: hitWindow.end,
          hitWindowWidth: hitWindow.width,
          hitChance: hitWindow.width,
          evasionChance,
          criticalChance: 0,
          rawDamage: 0,
          damage: 0,
          defenderHealthAfter: defenderHealthBefore,
          wasCritical: false,
          wasDodged: true,
          result: 'evaded' as const,
        },
      };
    }

    const criticalChance = this.balance.evaluateCriticalChance(rules, attacker, defender);
    const wasCritical = Math.random() * 100 < criticalChance;
    const rawDamage = this.randomInt(attacker.derived.minDmg, attacker.derived.maxDmg);
    const result: CombatEntryResult = wasCritical ? 'critical' : 'hit';
    const damage = this.balance.evaluateFinalDamage(
      rules,
      attacker,
      defender,
      rawDamage,
      wasCritical ? this.criticalMultiplier(attacker) : 1
    );
    const defenderHealthAfter = Math.max(0, defenderHealthBefore - damage);

    return {
      defenderHealthAfter,
      nextStreak: 1,
      entry: {
        turn,
        attackerKey: attacker.key,
        attackerName: attacker.name,
        defenderKey: defender.key,
        defenderName: defender.name,
        indicatorPosition,
        hitWindowStart: hitWindow.start,
        hitWindowEnd: hitWindow.end,
        hitWindowWidth: hitWindow.width,
        hitChance: hitWindow.width,
        evasionChance,
        criticalChance,
        rawDamage,
        damage,
        defenderHealthAfter,
        wasCritical,
        wasDodged: false,
        result,
      },
    };
  }

  private createMissEntry(
    turn: number,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    defenderHealthBefore: number,
    indicatorPosition: number,
    hitWindow: { start: number; end: number; width: number }
  ): CombatRoundEntry {
    return {
      turn,
      attackerKey: attacker.key,
      attackerName: attacker.name,
      defenderKey: defender.key,
      defenderName: defender.name,
      indicatorPosition,
      hitWindowStart: hitWindow.start,
      hitWindowEnd: hitWindow.end,
      hitWindowWidth: hitWindow.width,
      hitChance: hitWindow.width,
      evasionChance: 0,
      criticalChance: 0,
      rawDamage: 0,
      damage: 0,
      defenderHealthAfter: defenderHealthBefore,
      wasCritical: false,
      wasDodged: false,
      result: 'miss' as const,
    };
  }

  private randomInt(min: number, max: number): number {
    const normalizedMin = Math.min(min, max);
    const normalizedMax = Math.max(min, max);
    return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin;
  }

  private criticalMultiplier(attacker: CombatantSnapshot): number {
    const criticalDamagePercent =
      attacker.derived.criticalDamage + attacker.bonuses.criticalDamageBonusFromItems;

    return 1 + Math.max(0, criticalDamagePercent) / 100;
  }
}
