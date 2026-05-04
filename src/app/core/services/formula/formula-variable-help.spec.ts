import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import {
  FORMULA_VARIABLE_HELP_NAMESPACE,
  FormulaVariableHelp,
  toFormulaVariableHelpKey,
} from './formula-variable-help';
import { Row } from '../../types/supabase.types';
import { FormulaTargetAssignmentRow } from '../../types/formula-admin-view.types';

describe('FormulaVariableHelp', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: FormulaVariableHelp;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of([
      uiMetadataRow('building_upgrade_cost.targetLevel', 'The level being priced/timed.'),
    ]));

    TestBed.configureTestingModule({
      providers: [
        FormulaVariableHelp,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(FormulaVariableHelp);
  });

  it('loads formula variable help from canonical UI metadata RPC', async () => {
    const result = await firstValueFrom(service.getHelpByTargetVariable([
      formulaRow('building_upgrade_cost', ['targetLevel']),
    ]));

    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: FORMULA_VARIABLE_HELP_NAMESPACE,
      p_keys: [toFormulaVariableHelpKey('building_upgrade_cost', 'targetLevel')],
      p_include_inactive: false,
    });
    expect(result.get('building_upgrade_cost.targetLevel')).toBe('The level being priced/timed.');
  });
});

function formulaRow(
  targetKey: string,
  allowedVariables: string[],
): FormulaTargetAssignmentRow {
  return {
    target: {
      id: 'target-1',
      key: targetKey,
      scopeKey: 'building_balance',
      label: 'Building target',
      description: null,
      allowedVariables,
      defaultTestContext: {},
      sortOrder: 10,
      createdAt: null,
    },
    assignment: null,
    formula: null,
    status: 'no_assignment',
    statusLabel: 'No assignment',
  };
}

function uiMetadataRow(key: string, helperText: string): Row<'ui_metadata_entries'> {
  return {
    id: 'metadata-1',
    namespace: FORMULA_VARIABLE_HELP_NAMESPACE,
    key,
    label: key,
    description: null,
    helper_text: helperText,
    impact_summary: null,
    warning_text: null,
    ui_group_key: null,
    ui_group_label: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-04T00:00:00.000Z',
    updated_at: '2026-05-04T00:00:00.000Z',
  };
}
