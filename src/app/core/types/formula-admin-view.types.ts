import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAdminData,
  FormulaAssignment,
  FormulaBlock,
  FormulaTarget,
} from '../domain/formula/formula.model';
import { Row } from './supabase.types';

export type FormulaAssignmentStatus =
  | 'enabled'
  | 'disabled'
  | 'missing_formula'
  | 'no_assignment';

export interface FormulaTargetAssignmentRow {
  target: FormulaTarget;
  assignment: FormulaAssignment | null;
  formula: BalanceFormula | null;
  status: FormulaAssignmentStatus;
  statusLabel: string;
}

export interface EntityFormulaInspectionRow {
  assignment: EntityFormulaAssignment;
  target: FormulaTarget | null;
  formula: BalanceFormula | null;
  globalAssignment: FormulaAssignment | null;
  globalFormula: BalanceFormula | null;
  entityLabel: string | null;
  entityKey: string | null;
  resolutionLabel: string;
}

export interface FormulaScopeInspectionRow {
  scopeKey: string;
  formulas: BalanceFormula[];
  blocks: FormulaBlock[];
}

export const EMPTY_FORMULA_ADMIN_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
  entityAssignments: [],
  blocks: [],
};

export interface FormulaEntityReference {
  entityKind: string;
  entityId: string;
  label: string;
  key: string | null;
}

export type FormulaEntityKey = `${string}:${string}`;

export type FormulaBuildingLabelRow = Pick<
  Row<'buildings'>,
  'id' | 'key' | 'name' | 'sort_order'
>;
