import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAssignment,
  FormulaBlock,
  FormulaTarget,
} from '../domain/formula/formula.model';

export function mapFormulaTarget(row: {
  id: string;
  key: string;
  scope_key: string;
  label: string;
  description: string | null;
  allowed_variables: string[] | null;
  default_test_context: unknown;
  sort_order: number;
  created_at: string | null;
}): FormulaTarget {
  return {
    id: row.id,
    key: row.key,
    scopeKey: row.scope_key,
    label: row.label,
    description: row.description,
    allowedVariables: row.allowed_variables ?? [],
    defaultTestContext: normalizeFormulaContext(row.default_test_context),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapBalanceFormula(row: {
  id: string;
  key: string;
  scope_key: string;
  label: string;
  expression: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}): BalanceFormula {
  return {
    id: row.id,
    key: row.key,
    scopeKey: row.scope_key,
    label: row.label,
    expression: row.expression,
    description: row.description,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFormulaAssignment(row: {
  id: string;
  target_id: string;
  formula_id: string;
  created_at: string | null;
  updated_at: string | null;
}): FormulaAssignment {
  return {
    id: row.id,
    targetId: row.target_id,
    formulaId: row.formula_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEntityFormulaAssignment(row: {
  id: string;
  entity_kind: string;
  entity_id: string;
  target_id: string;
  formula_id: string;
  created_at: string | null;
  updated_at: string | null;
}): EntityFormulaAssignment {
  return {
    id: row.id,
    entityKind: row.entity_kind,
    entityId: row.entity_id,
    targetId: row.target_id,
    formulaId: row.formula_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFormulaBlock(row: {
  id: string;
  scope_key: string;
  category: string;
  label: string;
  token: string;
  helper_text: string | null;
  sort_order: number;
  created_at: string | null;
}): FormulaBlock {
  return {
    id: row.id,
    scopeKey: row.scope_key,
    category: row.category,
    label: row.label,
    token: row.token,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function normalizeFormulaContext(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, rawValue]) => {
      const normalized = Number(rawValue);
      Number.isFinite(normalized) && (acc[key] = normalized);
      return acc;
    },
    {} as Record<string, number>
  );
}
