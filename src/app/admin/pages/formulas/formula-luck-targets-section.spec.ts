import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  FormulaVariableHelp,
  toFormulaVariableHelpKey,
} from '../../../core/services/formula/formula-variable-help';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { FormulaLuckTargetsSection } from './formula-luck-targets-section';

describe('FormulaLuckTargetsSection', () => {
  let fixture: ComponentFixture<FormulaLuckTargetsSection>;
  let variableHelp: jasmine.SpyObj<FormulaVariableHelp>;

  beforeEach(() => {
    variableHelp = jasmine.createSpyObj<FormulaVariableHelp>('FormulaVariableHelp', [
      'getHelpByTargetVariable',
    ]);
    variableHelp.getHelpByTargetVariable.and.returnValue(of(new Map([
      [
        toFormulaVariableHelpKey('trial_power', 'luckValue'),
        'DB metadata for raw Luck.',
      ],
    ])));

    TestBed.configureTestingModule({
      imports: [FormulaLuckTargetsSection],
      providers: [{ provide: FormulaVariableHelp, useValue: variableHelp }],
    });

    fixture = TestBed.createComponent(FormulaLuckTargetsSection);
  });

  it('renders only Luck Foundation target rows with readable variables', () => {
    fixture.componentRef.setInput('rows', [
      formulaRow('trial_power', ['testedStatValue', 'luckValue', 'luckInfluence', 'trialPower']),
      formulaRow('building_upgrade_cost', ['currentLevel', 'targetLevel']),
    ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(fixture.componentInstance.luckFormulaRows().map((row) => row.target.key)).toEqual([
      'trial_power',
    ]);
    expect(text).toContain('Luck Foundation formula targets');
    expect(text).toContain('Luck value (luckValue)');
    expect(text).not.toContain('Building upgrade cost');
  });

  it('prefers DB metadata help before fallback text', () => {
    const row = formulaRow('trial_power', ['luckValue']);

    fixture.componentRef.setInput('rows', [row]);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(fixture.componentInstance.variableHelpText(row, 'luckValue')).toBe(
      'DB metadata for raw Luck.',
    );
  });
});

function formulaRow(
  targetKey: string,
  allowedVariables: string[],
): FormulaTargetAssignmentRow {
  return {
    target: {
      id: `target-${targetKey}`,
      key: targetKey,
      scopeKey: targetKey === 'trial_power' ? 'exploration' : 'building_balance',
      label: targetKey === 'trial_power' ? 'Trial Power' : 'Building upgrade cost',
      description: null,
      allowedVariables,
      defaultTestContext: {},
      sortOrder: 10,
      createdAt: '2026-05-09T10:00:00.000Z',
    },
    assignment: null,
    formula: null,
    status: 'no_assignment',
    statusLabel: 'No assignment',
  };
}
