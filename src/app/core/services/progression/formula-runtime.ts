import { Injectable } from '@angular/core';
import { FormulaFunctionGuide, FormulaTemplateGuide } from '../../domain/formula/formula.model';
import { FormulaEvaluationResult } from '../../domain/progression/stat-progression.model';
import { FormulaContext, FormulaFn } from '../../types/formula-runtime.types';

@Injectable({ providedIn: 'root' })
export class FormulaRuntimeService {
  private readonly allowedFunctions: Record<string, FormulaFn> = {
    abs: Math.abs,
    ceil: Math.ceil,
    clamp: (min, max, value) => Math.min(Math.max(value, min), max),
    floor: Math.floor,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    random: (min?: number, max?: number) => {
      if (min === undefined && max === undefined) {
        return Math.random();
      }

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return Number.NaN;
      }

      return Math.random() * (Number(max) - Number(min)) + Number(min);
    },
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
  private readonly functionGuides: readonly FormulaFunctionGuide[] = [
    {
      key: 'pow',
      label: 'pow()',
      syntax: 'pow(base, exponent)',
      friendlySyntax: 'power(base, exponent)',
      humanSyntax: 'base^exponent',
      description: 'Raises the first value to the power of the second value.',
      example: 'pow(level, 1.45)',
      exampleHuman: 'level^1.45',
      insertTemplate: 'pow(level, 1.45)',
    },
    {
      key: 'roundUp',
      label: 'roundUp()',
      syntax: 'roundUp(value, step)',
      friendlySyntax: 'round up(value, step)',
      humanSyntax: 'round value up to the next step',
      description: 'Rounds the result up. Good for costs, time and thresholds.',
      example: 'roundUp(4 + level * 2 + pow(level, 1.45), 5)',
      exampleHuman: 'round up (4 + level * 2 + level^1.45) to step 5',
      insertTemplate: 'roundUp(level * 10, 5)',
    },
    {
      key: 'roundDown',
      label: 'roundDown()',
      syntax: 'roundDown(value, step)',
      friendlySyntax: 'round down(value, step)',
      humanSyntax: 'round value down to the previous step',
      description: 'Rounds the result down. Good when you do not want to overshoot.',
      example: 'roundDown(baseBonus * 1.2, 1)',
      exampleHuman: 'round down (baseBonus * 1.2) to step 1',
      insertTemplate: 'roundDown(level * 10, 5)',
    },
    {
      key: 'round',
      label: 'round()',
      syntax: 'round(value)',
      friendlySyntax: 'round(value)',
      humanSyntax: 'round value to the nearest integer',
      description: 'Standard mathematical rounding.',
      example: 'round(baseBonus * 1.15)',
      exampleHuman: 'round baseBonus * 1.15 to the nearest integer',
      insertTemplate: 'round(level * 1.2)',
    },
    {
      key: 'floor',
      label: 'floor()',
      syntax: 'floor(value)',
      friendlySyntax: 'floor(value)',
      humanSyntax: 'drop the decimal part',
      description: 'Always rounds down to a whole number.',
      example: 'floor(itemPower / 3)',
      exampleHuman: 'drop decimals from itemPower / 3',
      insertTemplate: 'floor(level / 2)',
    },
    {
      key: 'ceil',
      label: 'ceil()',
      syntax: 'ceil(value)',
      friendlySyntax: 'ceil(value)',
      humanSyntax: 'always round up to a whole number',
      description: 'Always rounds up to a whole number.',
      example: 'ceil(level / 2)',
      exampleHuman: 'always round level / 2 up',
      insertTemplate: 'ceil(level / 2)',
    },
    {
      key: 'min',
      label: 'min()',
      syntax: 'min(a, b)',
      friendlySyntax: 'minimum(a, b)',
      humanSyntax: 'smaller of a and b',
      description: 'Caps a value from above by picking the lower result.',
      example: 'min(level * 3, 100)',
      exampleHuman: 'pick the smaller of level * 3 and 100',
      insertTemplate: 'min(level * 3, 100)',
    },
    {
      key: 'max',
      label: 'max()',
      syntax: 'max(a, b)',
      friendlySyntax: 'maximum(a, b)',
      humanSyntax: 'larger of a and b',
      description: 'Guarantees a minimum floor by picking the higher result.',
      example: 'max(baseCost, 50)',
      exampleHuman: 'pick the larger of baseCost and 50',
      insertTemplate: 'max(level * 3, 10)',
    },
    {
      key: 'clamp',
      label: 'clamp()',
      syntax: 'clamp(min, max, value)',
      friendlySyntax: 'clamp(min, max, value)',
      humanSyntax: 'keep value between min and max',
      description: 'Useful when a formula should never go below or above a limit.',
      example: 'clamp(10, 80, level * 4)',
      exampleHuman: 'keep level * 4 between 10 and 80',
      insertTemplate: 'clamp(10, 80, level * 4)',
    },
    {
      key: 'abs',
      label: 'abs()',
      syntax: 'abs(value)',
      friendlySyntax: 'absolute(value)',
      humanSyntax: 'absolute value',
      description: 'Turns negative values into positive values.',
      example: 'abs(level - rank)',
      exampleHuman: 'distance between level and rank',
      insertTemplate: 'abs(level - rank)',
    },
    {
      key: 'random',
      label: 'random()',
      syntax: 'random() or random(min, max)',
      friendlySyntax: 'random() / random(min, max)',
      humanSyntax: 'random decimal value',
      description: 'Returns a random decimal. Use floor, ceil or round when a whole number is needed.',
      example: 'round(random(1, 6))',
      exampleHuman: 'roll a decimal from 1 to 6, then round it',
      insertTemplate: 'random(0, 1)',
    },
  ];
  private readonly templateGuides: readonly FormulaTemplateGuide[] = [
    {
      key: 'linear',
      label: 'Linear',
      expressionTemplate: '10 + {{x}} * 4',
      humanTemplate: '10 + {{x}} * 4',
      summary: 'Steady, predictable growth.',
      effect: 'Each step adds almost the same amount. Good for calm, readable scaling.',
    },
    {
      key: 'late-ramp',
      label: 'Late ramp',
      expressionTemplate: '4 + pow({{x}}, 1.45)',
      humanTemplate: '4 + {{x}}^1.45',
      summary: 'Starts gently and accelerates later.',
      effect: 'Useful when early values should stay moderate and later values should rise much faster.',
    },
    {
      key: 'fast-start',
      label: 'Fast start',
      expressionTemplate: '20 + 90 * (1 - 1 / ({{x}} + 1))',
      humanTemplate: '20 + 90 * (1 - 1 / ({{x}} + 1))',
      summary: 'Strong jump at the beginning, then gradual slowdown.',
      effect: 'Good when early progression should feel fast and later gains should flatten out.',
    },
    {
      key: 'soft-cap',
      label: 'Soft cap',
      expressionTemplate: 'min(120, 20 + {{x}} * 8)',
      humanTemplate: 'min(120, 20 + {{x}} * 8)',
      summary: 'Linear growth until it reaches a cap.',
      effect: 'Useful when a value should stop growing after hitting a clear limit.',
    },
    {
      key: 'decay',
      label: 'Decay',
      expressionTemplate: '120 / ({{x}} + 1)',
      humanTemplate: '120 / ({{x}} + 1)',
      summary: 'Drops quickly at first, then slows down.',
      effect: 'Useful for diminishing returns, cooldown reductions or fading bonuses.',
    },
  ];

  evaluate(
    expression: string,
    context: FormulaContext,
    allowedVariables?: readonly string[]
  ): FormulaEvaluationResult {
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

    const identifiers = this.extractIdentifiers(normalizedExpression);
    const allowedIdentifiers = new Set([
      ...(allowedVariables ?? Object.keys(context)),
      ...Object.keys(this.allowedFunctions),
    ]);
    const unknownIdentifiers = identifiers.filter((identifier) => !allowedIdentifiers.has(identifier));

    if (unknownIdentifiers.length > 0) {
      return {
        value: null,
        error: `Unknown token in formula: ${unknownIdentifiers[0]}.`,
      };
    }

    const missingContextVariables = (allowedVariables ?? [])
      .filter((identifier) => identifiers.includes(identifier))
      .filter((identifier) => !Object.hasOwn(context, identifier));

    if (missingContextVariables.length > 0) {
      return {
        value: null,
        error: `Formula is missing a value for "${missingContextVariables[0]}".`,
      };
    }

    const functionCallError = this.validateFunctionCalls(normalizedExpression);

    if (functionCallError) {
      return {
        value: null,
        error: functionCallError,
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

  getVariables(expression: string): string[] {
    const normalizedExpression = expression.trim();

    if (!normalizedExpression) {
      return [];
    }

    return this.extractIdentifiers(normalizedExpression).filter(
      (identifier) => !Object.hasOwn(this.allowedFunctions, identifier)
    );
  }

  getFunctionGuides(): readonly FormulaFunctionGuide[] {
    return this.functionGuides;
  }

  getTemplateGuides(): readonly FormulaTemplateGuide[] {
    return this.templateGuides;
  }

  getUnknownVariables(
    expression: string,
    allowedVariables: readonly string[]
  ): string[] {
    const identifiers = this.getVariables(expression);
    const allowed = new Set(allowedVariables);
    return identifiers.filter((identifier) => !allowed.has(identifier));
  }

  isNonDeterministic(expression: string): boolean {
    return this.extractIdentifiers(expression.trim()).includes('random');
  }

  humanizeExpression(expression: string): string {
    const normalizedExpression = expression.trim();

    if (!normalizedExpression) {
      return '';
    }

    return this.humanizeSegment(normalizedExpression)
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractIdentifiers(expression: string): string[] {
    return expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  }

  private validateFunctionCalls(expression: string): string | null {
    let index = 0;

    while (index < expression.length) {
      const current = expression[index];

      if (!/[A-Za-z_]/.test(current)) {
        index += 1;
        continue;
      }

      let end = index + 1;
      while (end < expression.length && /[A-Za-z0-9_]/.test(expression[end])) {
        end += 1;
      }

      const identifier = expression.slice(index, end);
      let nextIndex = end;

      while (nextIndex < expression.length && /\s/.test(expression[nextIndex])) {
        nextIndex += 1;
      }

      if (identifier !== 'random') {
        index = end;
        continue;
      }

      if (expression[nextIndex] !== '(') {
        return 'random must be called as random() or random(min, max).';
      }

      const closingIndex = this.findClosingParenthesis(expression, nextIndex);

      if (closingIndex <= nextIndex) {
        return 'random must be called as random() or random(min, max).';
      }

      const inner = expression.slice(nextIndex + 1, closingIndex);
      const argCount = inner.trim() ? this.splitTopLevelArgs(inner).length : 0;

      if (argCount !== 0 && argCount !== 2) {
        return 'random accepts either no arguments or exactly two arguments: random() or random(min, max).';
      }

      index = closingIndex + 1;
    }

    return null;
  }

  private humanizeSegment(expression: string): string {
    let result = '';
    let index = 0;

    while (index < expression.length) {
      const current = expression[index];

      if (/[A-Za-z_]/.test(current)) {
        let end = index + 1;
        while (end < expression.length && /[A-Za-z0-9_]/.test(expression[end])) {
          end += 1;
        }

        const identifier = expression.slice(index, end);
        let nextIndex = end;

        while (nextIndex < expression.length && /\s/.test(expression[nextIndex])) {
          nextIndex += 1;
        }

        if (
          nextIndex < expression.length &&
          expression[nextIndex] === '(' &&
          this.functionGuides.some((guide) => guide.key === identifier)
        ) {
          const closingIndex = this.findClosingParenthesis(expression, nextIndex);

          if (closingIndex > nextIndex) {
            const inner = expression.slice(nextIndex + 1, closingIndex);
            const args = this.splitTopLevelArgs(inner).map((arg) => this.humanizeSegment(arg));
            result += this.humanizeFunction(identifier, args);
            index = closingIndex + 1;
            continue;
          }
        }

        result += identifier;
        index = end;
        continue;
      }

      result += current;
      index += 1;
    }

    return result;
  }

  private humanizeFunction(identifier: string, args: string[]): string {
    const [first = '', second = '', third = ''] = args.map((arg) => this.wrapIfNeeded(arg));

    switch (identifier) {
      case 'pow':
        return `${first}^${second}`;
      case 'roundUp':
        return `round up ${first}${second ? ` to step ${second}` : ''}`;
      case 'roundDown':
        return `round down ${first}${second ? ` to step ${second}` : ''}`;
      case 'round':
        return `round ${first}`;
      case 'floor':
        return `round down ${first}`;
      case 'ceil':
        return `round up ${first}`;
      case 'min':
        return `smaller of ${first} and ${second}`;
      case 'max':
        return `larger of ${first} and ${second}`;
      case 'clamp':
        return `keep ${third} between ${first} and ${second}`;
      case 'abs':
        return `absolute value of ${first}`;
      case 'random':
        return second ? `random decimal between ${first} and ${second}` : 'random decimal between 0 and 1';
      default:
        return `${identifier}(${args.join(', ')})`;
    }
  }

  private wrapIfNeeded(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return trimmed;
    }

    return /[+\-*/% ]/.test(trimmed) ? `(${trimmed})` : trimmed;
  }

  private findClosingParenthesis(expression: string, openIndex: number): number {
    let depth = 0;

    for (let index = openIndex; index < expression.length; index += 1) {
      if (expression[index] === '(') {
        depth += 1;
      } else if (expression[index] === ')') {
        depth -= 1;

        if (depth === 0) {
          return index;
        }
      }
    }

    return -1;
  }

  private splitTopLevelArgs(value: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;

    for (const char of value) {
      if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
        continue;
      }

      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth = Math.max(0, depth - 1);
      }

      current += char;
    }

    current.trim() && args.push(current.trim());
    return args;
  }
}
