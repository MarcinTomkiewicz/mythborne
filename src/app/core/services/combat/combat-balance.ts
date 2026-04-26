import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  CombatAssignedFormula,
  CombatBalanceRules,
  CombatantSnapshot,
} from '../../domain/combat/combat.model';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';

const COMBAT_TARGET_KEYS = {
  hitWindow: 'combat_hit_green_zone',
  evasionChance: 'combat_evasion_chance',
  criticalChance: 'combat_critical_chance',
  finalDamage: 'combat_final_damage',
} as const;

type CombatFormulaKind = keyof typeof COMBAT_TARGET_KEYS;

@Injectable({ providedIn: 'root' })
export class CombatBalanceService {
  private readonly formulaService = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);

  getRules(): Observable<CombatBalanceRules> {
    return forkJoin({
      hitWindow: this.formulaService.getAssignedFormula(COMBAT_TARGET_KEYS.hitWindow),
      evasionChance: this.formulaService.getAssignedFormula(COMBAT_TARGET_KEYS.evasionChance),
      criticalChance: this.formulaService.getAssignedFormula(COMBAT_TARGET_KEYS.criticalChance),
      finalDamage: this.formulaService.getAssignedFormula(COMBAT_TARGET_KEYS.finalDamage),
    }).pipe(
      map(({ hitWindow, evasionChance, criticalChance, finalDamage }) => ({
        hitWindow: this.toAssignedFormula(hitWindow.target.key, hitWindow.target.label, hitWindow.formula.expression),
        evasionChance: this.toAssignedFormula(
          evasionChance.target.key,
          evasionChance.target.label,
          evasionChance.formula.expression
        ),
        criticalChance: this.toAssignedFormula(
          criticalChance.target.key,
          criticalChance.target.label,
          criticalChance.formula.expression
        ),
        finalDamage: this.toAssignedFormula(
          finalDamage.target.key,
          finalDamage.target.label,
          finalDamage.formula.expression
        ),
      }))
    );
  }

  evaluateHitWindow(
    rules: CombatBalanceRules,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot
  ): number {
    return this.evaluatePercent(rules.hitWindow, attacker, defender);
  }

  evaluateEvasionChance(
    rules: CombatBalanceRules,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot
  ): number {
    return this.evaluatePercent(rules.evasionChance, attacker, defender);
  }

  evaluateCriticalChance(
    rules: CombatBalanceRules,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot
  ): number {
    return this.evaluatePercent(rules.criticalChance, attacker, defender);
  }

  evaluateFinalDamage(
    rules: CombatBalanceRules,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    rolledDamage: number,
    critMultiplier: number
  ): number {
    return Math.max(
      0,
      Math.round(
        this.evaluateNumber(rules.finalDamage, attacker, defender, {
          rolledDamage,
          critMultiplier,
        })
      )
    );
  }

  private evaluatePercent(
    rule: CombatAssignedFormula,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot
  ) {
    return Math.max(0, Math.min(100, this.evaluateNumber(rule, attacker, defender)));
  }

  private evaluateNumber(
    rule: CombatAssignedFormula,
    attacker: CombatantSnapshot,
    defender: CombatantSnapshot,
    extra: Record<string, number> = {}
  ) {
    const context = {
      attackerStrength: attacker.baseStats.strength,
      attackerDexterity: attacker.baseStats.dexterity,
      attackerAgility: attacker.baseStats.agility,
      attackerCunning: attacker.baseStats.cunning,
      attackerLuck: attacker.derived.luck,
      attackerDefense: attacker.derived.def,
      defenderAgility: defender.baseStats.agility,
      defenderLuck: defender.derived.luck,
      defenderDefense: defender.derived.def,
      defenderEndurance: defender.baseStats.endurance,
      hitBonusFromItems: attacker.bonuses.hitBonusFromItems,
      critBonusFromItems: attacker.bonuses.critBonusFromItems,
      evasionBonusFromItems: defender.bonuses.evasionBonusFromItems,
      damageBonusFromItems: attacker.bonuses.damageBonusFromItems,
      ...extra,
    };
    const result = this.formulaRuntime.evaluate(rule.expression, context, Object.keys(context));

    if (result.error || result.value === null) {
      throw new Error(`${rule.targetLabel} formula is invalid: ${result.error ?? 'unknown error'}`);
    }

    return result.value;
  }

  private toAssignedFormula(
    targetKey: string,
    targetLabel: string,
    expression: string
  ): CombatAssignedFormula {
    return {
      targetKey,
      targetLabel,
      expression,
    };
  }
}
