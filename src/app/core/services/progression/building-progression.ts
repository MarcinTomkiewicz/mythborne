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
import { buildBuildingUpgradeFormulaVariables } from '../../utils/building-upgrade-formula-variables';

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
    currentLevel: number,
    baseCost: number,
    rank: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getUpgradeCostResult(currentLevel, baseCost, rank, rules).value;
  }

  getUpgradeCostResult(
    currentLevel: number,
    baseCost: number,
    rank: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.costExpression,
      buildBuildingUpgradeFormulaVariables({ currentLevel, baseCost, rank }),
      true
    );
  }

  getUpgradeTimeSeconds(
    currentLevel: number,
    baseTimeSeconds: number,
    rank: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getUpgradeTimeSecondsResult(currentLevel, baseTimeSeconds, rank, rules).value;
  }

  getUpgradeTimeSecondsResult(
    currentLevel: number,
    baseTimeSeconds: number,
    rank: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.timeExpression,
      buildBuildingUpgradeFormulaVariables({
        currentLevel,
        baseTimeSeconds,
        rank,
      }),
      true
    );
  }

  getBonusValue(
    currentLevel: number,
    baseBonus: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.getBonusValueResult(currentLevel, baseBonus, rules).value;
  }

  getBonusValueResult(
    currentLevel: number,
    baseBonus: number,
    rules: BuildingProgressionRules
  ): BuildingProgressionFormulaResult {
    return this.evaluateNumeric(
      rules.bonusExpression,
      { currentLevel, baseBonus },
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
    variables: Record<string, number>,
    integerOnly: boolean
  ): BuildingProgressionFormulaResult {
    const result = this.runtime.evaluate(expression, variables);

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
