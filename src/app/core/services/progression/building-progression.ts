import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';
import {
  BUILDING_PROGRESSION_TARGET_KEYS,
  BuildingProgressionRules,
} from '../../domain/progression/building-progression.model';
import { nonNegativeInteger } from '../../utils/number';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from './formula-runtime';

@Injectable({ providedIn: 'root' })
export class BuildingProgressionService {
  private readonly formulaService = inject(FormulaService);
  private readonly runtime = inject(FormulaRuntimeService);

  private rules$?: Observable<BuildingProgressionRules>;

  getRules(): Observable<BuildingProgressionRules> {
    if (!this.rules$) {
      this.rules$ = forkJoin({
        cost: this.formulaService.getAssignedFormula(
          BUILDING_PROGRESSION_TARGET_KEYS.upgradeCost
        ),
        time: this.formulaService.getAssignedFormula(
          BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime
        ),
        bonus: this.formulaService.getAssignedFormula(
          BUILDING_PROGRESSION_TARGET_KEYS.bonusGrowth
        ),
      }).pipe(
        map(({ cost, time, bonus }) => ({
          costExpression: cost.formula.expression,
          timeExpression: time.formula.expression,
          bonusExpression: bonus.formula.expression,
        })),
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
    return this.evaluateNumeric(
      rules.costExpression,
      { level, baseCost, rank },
      true
    );
  }

  getUpgradeTimeMinutes(
    level: number,
    baseTime: number,
    rank: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.evaluateNumeric(
      rules.timeExpression,
      { level, baseTime, rank },
      true
    );
  }

  getBonusValue(
    level: number,
    baseBonus: number,
    rules: BuildingProgressionRules
  ): number | null {
    return this.evaluateNumeric(
      rules.bonusExpression,
      { level, baseBonus },
      false
    );
  }

  private evaluateNumeric(
    expression: string,
    context: Record<string, number>,
    integerOnly: boolean
  ): number | null {
    const result = this.runtime.evaluate(expression, context);

    if (result.error || result.value === null || result.value === undefined) {
      return null;
    }

    const numeric = Number(result.value);

    if (!Number.isFinite(numeric)) {
      return null;
    }

    return integerOnly ? nonNegativeInteger(numeric) : numeric;
  }
}
