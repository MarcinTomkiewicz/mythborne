import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  BUILDING_PROGRESSION_TARGET_KEYS,
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
    return this.evaluateNumeric(rules.bonusExpression, { level, baseBonus }, false);
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
