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

@Injectable({ providedIn: 'root' })
export class StatProgressionService {
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly formulaService = inject(FormulaService);

  getRules(): Observable<StatProgressionRules> {
    return this.formulaService.getAdminData().pipe(
      map((data) => {
        const costTarget = data.targets.find(
          (entry) => entry.key === STAT_PROGRESSION_TARGET_KEYS.cost
        );
        const capTarget = data.targets.find(
          (entry) => entry.key === STAT_PROGRESSION_TARGET_KEYS.cap
        );

        if (!costTarget || !capTarget) {
          throw new Error('Stat progression targets are missing in the formulas catalog.');
        }

        const costAssignment = data.assignments.find(
          (entry) => entry.targetId === costTarget.id
        );
        const capAssignment = data.assignments.find((entry) => entry.targetId === capTarget.id);

        if (!costAssignment || !capAssignment) {
          throw new Error('Stat progression targets do not have assigned formulas.');
        }

        const costFormula = data.formulas.find(
          (entry) => entry.id === costAssignment.formulaId && entry.isEnabled
        );
        const capFormula = data.formulas.find(
          (entry) => entry.id === capAssignment.formulaId && entry.isEnabled
        );

        if (!costFormula || !capFormula) {
          throw new Error('Assigned stat progression formulas are missing or disabled.');
        }

        return {
          costTarget,
          capTarget,
          costFormula,
          capFormula,
        };
      })
    );
  }

  evaluateNextLevelCost(level: number, costFormula: string): FormulaEvaluationResult {
    return this.evaluateFormula(costFormula, {
      level: this.normalizeWholeNumber(level),
    });
  }

  evaluateStatCap(heroLevel: number, capFormula: string): FormulaEvaluationResult {
    return this.evaluateFormula(capFormula, {
      heroLevel: this.normalizeWholeNumber(heroLevel, 1),
    });
  }

  getNextLevelCost(level: number, costFormula: string): number | null {
    const result = this.evaluateNextLevelCost(level, costFormula);

    if (result.error || result.value === null) {
      return null;
    }

    return nonNegativeInteger(result.value);
  }

  getStatCap(heroLevel: number, capFormula: string): number | null {
    const result = this.evaluateStatCap(heroLevel, capFormula);

    if (result.error || result.value === null) {
      return null;
    }

    return positiveInteger(result.value);
  }

  private evaluateFormula(
    expression: string,
    context: Record<string, number>
  ): FormulaEvaluationResult {
    return this.formulaRuntime.evaluate(expression, context);
  }

  private normalizeWholeNumber(value: number, fallback = 0): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return nonNegativeInteger(value);
  }
}
