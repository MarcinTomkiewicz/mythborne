import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  BUILDING_PROGRESSION_TARGET_KEYS,
  BuildingProgressionFormulaResult,
  BuildingProgressionRules,
} from '../../domain/progression/building-progression.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { nonNegativeInteger } from '../../utils/number';
import { resolveAssignedFormula } from '../../utils/formula-assignment-resolution';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from './formula-runtime';

@Injectable({ providedIn: 'root' })
export class BuildingProgressionService {
  private readonly formulaService = inject(FormulaService);
  private readonly runtime = inject(FormulaRuntimeService);

  private rules$?: Observable<BuildingProgressionRules>;

  getRules(): Observable<BuildingProgressionRules> {
    if (!this.rules$) {
      this.rules$ = this.formulaService.getAdminData().pipe(
        map((data) => this.resolveRulesForBuilding(null, data)),
        shareReplay(1)
      );
    }

    return this.rules$;
  }

  clearCache() {
    this.rules$ = undefined;
  }

  getUpgradeCost(
    level: number,
    baseCost: number,
    rank: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getUpgradeCostResult(level, baseCost, rank, rules).value;
  }

  getUpgradeCostResult(
    level: number,
    baseCost: number,
    rank: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.costExpression,
      { level, baseCost, base_cost: baseCost, rank },
      true
    );
  }

  getUpgradeTimeSeconds(
    level: number,
    baseTime: number,
    rank: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getUpgradeTimeSecondsResult(level, baseTime, rank, rules).value;
  }

  getUpgradeTimeSecondsResult(
    level: number,
    baseTime: number,
    rank: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.timeExpression,
      { level, baseTime, base_time: baseTime, rank },
      true
    );
  }

  getBonusValue(
    level: number,
    baseBonus: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getBonusValueResult(level, baseBonus, rules).value;
  }

  getBonusValueResult(
    level: number,
    baseBonus: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.bonusExpression,
      { level, baseBonus, base_bonus: baseBonus },
      false
    );
  }

  resolveRulesForBuilding(
    buildingId: string | null,
    data: FormulaAdminData
  ): BuildingProgressionRules {
    const formulaFor = (targetKey: string) => {
      return resolveAssignedFormula(
        data,
        targetKey,
        buildingId ? { entityKind: 'building', entityId: buildingId } : undefined
      ).formula;
    };

    const cost = formulaFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeCost);
    const time = formulaFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime);
    const bonus = formulaFor(BUILDING_PROGRESSION_TARGET_KEYS.bonusGrowth);

    return {
      costFormulaId: cost.id,
      timeFormulaId: time.id,
      bonusFormulaId: bonus.id,
      costExpression: cost.expression,
      timeExpression: time.expression,
      bonusExpression: bonus.expression,
    };
  }

  private evaluateNumeric(
    expression: string,
    context: Record<string, number>,
    integerOnly: boolean
  ): BuildingProgressionFormulaResult {
    const result = this.runtime.evaluate(expression, context);

    if (result.error || result.value === null || result.value === undefined) {
      return { value: null, error: result.error ?? 'Formula did not return a value.' };
    }

    const numeric = Number(result.value);

    if (!Number.isFinite(numeric)) {
      return { value: null, error: 'Formula did not return a finite number.' };
    }

    return {
      value: integerOnly ? nonNegativeInteger(numeric) : numeric,
      error: null,
    };
  }
}
