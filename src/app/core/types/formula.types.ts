import { Row } from './supabase.types';

export type FormulaTargetRow = Row<'balance_formula_targets'>;
export type BalanceFormulaRow = Row<'balance_formulas'>;
export type FormulaAssignmentRow = Row<'balance_formula_assignments'>;
export type FormulaBlockRow = Row<'balance_formula_blocks'>;
export type EntityFormulaAssignmentRow = Row<'entity_formula_assignments'>;

export interface FormulaTarget {
  id: string;
  key: string;
  scopeKey: string;
  label: string;
  description: string | null;
  allowedVariables: string[];
  defaultTestContext: Record<string, number>;
  sortOrder: number;
  createdAt: string | null;
}

export interface FormulaVariableDefinition {
  key: string;
  defaultValue: number;
}

export interface BalanceFormula {
  id: string;
  key: string;
  scopeKey: string;
  label: string;
  expression: string;
  description: string | null;
  isEnabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FormulaAssignment {
  id: string;
  targetId: string;
  formulaId: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface EntityFormulaAssignment {
  id: string;
  entityKind: string;
  entityId: string;
  targetId: string;
  formulaId: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export type FormulaAssignmentSource = 'entity' | 'global';

export interface FormulaEntityAssignmentLookup {
  entityKind: string;
  entityId: string;
}

export interface FormulaAssignmentResolution {
  target: FormulaTarget;
  formula: BalanceFormula;
  assignment: FormulaAssignment | EntityFormulaAssignment;
  source: FormulaAssignmentSource;
}

export interface FormulaBlock {
  id: string;
  scopeKey: string;
  category: string;
  label: string;
  token: string;
  helperText: string | null;
  sortOrder: number;
  createdAt: string | null;
}

export interface FormulaFunctionGuide {
  key: string;
  label: string;
  syntax: string;
  friendlySyntax: string;
  humanSyntax: string;
  description: string;
  example: string;
  exampleHuman: string;
  insertTemplate: string;
}

export interface FormulaTemplateGuide {
  key: string;
  label: string;
  expressionTemplate: string;
  humanTemplate: string;
  summary: string;
  effect: string;
}

export interface FormulaAdminData {
  targets: FormulaTarget[];
  formulas: BalanceFormula[];
  assignments: FormulaAssignment[];
  entityAssignments: EntityFormulaAssignment[];
  blocks: FormulaBlock[];
}

export interface EditableBalanceFormula {
  id: string | null;
  key: string;
  scopeKey: string;
  label: string;
  expression: string;
  description: string;
  isEnabled: boolean;
}
