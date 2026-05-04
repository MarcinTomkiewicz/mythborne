import {
  FormulaBlock,
  FormulaFunctionGuide,
  FormulaTemplateGuide,
} from '../../../core/domain/formula/formula.model';

export function humanizeFormulaScope(scopeKey: string): string {
  return scopeKey
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formulaFunctionGuide(
  guides: readonly FormulaFunctionGuide[],
  block: FormulaBlock,
): FormulaFunctionGuide | null {
  return formulaFunctionGuideByKey(guides, block.token.replace(/\(.*/, ''));
}

export function formulaFunctionGuideByKey(
  guides: readonly FormulaFunctionGuide[],
  key: string,
): FormulaFunctionGuide | null {
  return guides.find((guide) => guide.key === key) ?? null;
}

export function formulaBlockTooltip(input: {
  block: FormulaBlock;
  guide: FormulaFunctionGuide | null;
}): string {
  const parts = [
    input.guide?.humanSyntax ? `Human: ${input.guide.humanSyntax}` : null,
    input.guide?.description ?? null,
    input.guide?.example ? `Example: ${input.guide.example}` : null,
    input.guide?.exampleHuman ? `Meaning: ${input.guide.exampleHuman}` : null,
    !input.guide ? input.block.helperText : null,
  ].filter((part): part is string => !!part);

  return parts.join('\n');
}

export function formulaFunctionGuideTooltip(guide: FormulaFunctionGuide): string {
  return [
    `Human: ${guide.humanSyntax}`,
    guide.description,
    `Example: ${guide.example}`,
    `Meaning: ${guide.exampleHuman}`,
  ].join('\n');
}

export function formulaTemplateTooltip(input: {
  template: FormulaTemplateGuide;
  variable: string;
}): string {
  return [
    `Expression: ${resolveFormulaTemplateExpression(input.template, input.variable)}`,
    `Human: ${resolveFormulaTemplateHuman(input.template, input.variable)}`,
    input.template.summary,
    `Effect: ${input.template.effect}`,
    'Click to replace the current expression with this template.',
  ].join('\n');
}

export function resolveFormulaTemplateExpression(
  template: FormulaTemplateGuide,
  variable: string,
): string {
  return template.expressionTemplate.replaceAll('{{x}}', variable);
}

export function resolveFormulaTemplateHuman(
  template: FormulaTemplateGuide,
  variable: string,
): string {
  return template.humanTemplate.replaceAll('{{x}}', variable);
}
