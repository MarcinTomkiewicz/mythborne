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

export interface FormulaAdminData {
  targets: FormulaTarget[];
  formulas: BalanceFormula[];
  assignments: FormulaAssignment[];
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
