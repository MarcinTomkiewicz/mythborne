import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FormulaService } from '../formula/formula';
import {
  FormulaEvaluationResult,
  STAT_PROGRESSION_TARGET_KEYS,
  StatProgressionRules,
} from '../../domain/progression/stat-progression.model';
import { nonNegativeInteger, positiveInteger } from '../../utils/number';
import { FormulaRuntimeService } from './formula-runtime';
import { FormulaTarget } from '../../domain/formula/formula.model';
import { resolveAssignedFormula } from '../../utils/formula-assignment-resolution';

@Injectable({ providedIn: 'root' })
export class StatProgressionService {
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly formulaService = inject(FormulaService);

  getRules(): Observable<StatProgressionRules> {
    return this.formulaService.getAdminData().pipe(
      map((data) => {
        const cost = resolveAssignedFormula(data, STAT_PROGRESSION_TARGET_KEYS.cost);
        const cap = resolveAssignedFormula(data, STAT_PROGRESSION_TARGET_KEYS.cap);

        return {
          costTarget: cost.target,
          capTarget: cap.target,
          costFormula: cost.formula,
          capFormula: cap.formula,
        };
      })
    );
  }

  evaluateNextLevelCost(
    statCurrentLevel: number,
    costFormula: string,
    options?: {
      target?: FormulaTarget;
    }
  ): FormulaEvaluationResult {
    return this.evaluateFormula(
      costFormula,
      {
        statCurrentLevel: this.normalizeWholeNumber(statCurrentLevel),
      },
      options?.target
    );
  }

  evaluateStatCap(
    currentLevel: number,
    capFormula: string,
    target?: FormulaTarget
  ): FormulaEvaluationResult {
    return this.evaluateFormula(
      capFormula,
      {
        currentLevel: this.normalizeWholeNumber(currentLevel, 1),
      },
      target
    );
  }

  getNextLevelCost(
    statCurrentLevel: number,
    costFormula: string,
    options?: {
      target?: FormulaTarget;
    }
  ): number | null {
    const result = this.evaluateNextLevelCost(statCurrentLevel, costFormula, options);

    if (result.error || result.value === null) {
      return null;
    }

    return nonNegativeInteger(result.value);
  }

  getStatCap(currentLevel: number, capFormula: string, target?: FormulaTarget): number | null {
    const result = this.evaluateStatCap(currentLevel, capFormula, target);

    if (result.error || result.value === null) {
      return null;
    }

    return positiveInteger(result.value);
  }

  private evaluateFormula(
    expression: string,
    variables: Record<string, number>,
    target?: FormulaTarget
  ): FormulaEvaluationResult {
    return this.formulaRuntime.evaluate(expression, variables, target?.allowedVariables);
  }

  private normalizeWholeNumber(value: number, fallback = 0): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return nonNegativeInteger(value);
  }
}
