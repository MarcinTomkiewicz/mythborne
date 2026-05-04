import {
  FormulaBlock,
  FormulaTarget,
  FormulaVariableDefinition,
} from '../../domain/formula/formula.model';

export interface ScopeVariableCatalogItem {
  key: string;
  label: string;
  helperText: string;
  targetLabels: string[];
}

export function buildScopeVariableCatalog(input: {
  target: FormulaTarget | null;
  variables: readonly FormulaVariableDefinition[];
  blocks: readonly FormulaBlock[];
}): ScopeVariableCatalogItem[] {
  if (!input.target) {
    return [];
  }

  return input.variables
    .map((variable) => variable.key)
    .filter(Boolean)
    .map((key) => {
      const block = input.blocks.find((entry) => entry.token === key) ?? null;

      return {
        key,
        label: block?.label ?? key,
        helperText: block?.helperText ?? '',
        targetLabels: [input.target?.label ?? ''],
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}
