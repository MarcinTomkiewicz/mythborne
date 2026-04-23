import { Injectable } from '@angular/core';
import { FormulaEvaluationResult } from '../../domain/progression/stat-progression.model';

type FormulaContext = Record<string, number>;

type FormulaFn = (...args: number[]) => number;

@Injectable({ providedIn: 'root' })
export class FormulaRuntimeService {
  private readonly allowedFunctions: Record<string, FormulaFn> = {
    abs: Math.abs,
    ceil: Math.ceil,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    floor: Math.floor,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    round: Math.round,
    roundDown: (value, step = 1) => {
      const normalizedStep = step <= 0 ? 1 : step;
      return Math.floor(value / normalizedStep) * normalizedStep;
    },
    roundUp: (value, step = 1) => {
      const normalizedStep = step <= 0 ? 1 : step;
      return Math.ceil(value / normalizedStep) * normalizedStep;
    },
  };

  evaluate(expression: string, context: FormulaContext): FormulaEvaluationResult {
    const normalizedExpression = expression.trim();

    if (!normalizedExpression) {
      return {
        value: null,
        error: 'Formula cannot be empty.',
      };
    }

    if (!/^[\dA-Za-z_+\-*/%().,\s]*$/.test(normalizedExpression)) {
      return {
        value: null,
        error: 'Formula contains unsupported characters.',
      };
    }

    const identifiers = normalizedExpression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
    const allowedIdentifiers = new Set([
      ...Object.keys(context),
      ...Object.keys(this.allowedFunctions),
    ]);
    const unknownIdentifiers = identifiers.filter((identifier) => !allowedIdentifiers.has(identifier));

    if (unknownIdentifiers.length > 0) {
      return {
        value: null,
        error: `Unknown token in formula: ${unknownIdentifiers[0]}.`,
      };
    }

    try {
      const scope = {
        ...this.allowedFunctions,
        ...context,
      };
      const scopeKeys = Object.keys(scope);
      const scopeValues = Object.values(scope);
      const runtime = new Function(
        ...scopeKeys,
        `"use strict"; return (${normalizedExpression});`
      ) as (...args: Array<number | FormulaFn>) => unknown;
      const value = Number(runtime(...scopeValues));

      if (!Number.isFinite(value)) {
        return {
          value: null,
          error: 'Formula did not return a finite number.',
        };
      }

      return {
        value,
        error: null,
      };
    } catch {
      return {
        value: null,
        error: 'Formula could not be evaluated.',
      };
    }
  }
}
