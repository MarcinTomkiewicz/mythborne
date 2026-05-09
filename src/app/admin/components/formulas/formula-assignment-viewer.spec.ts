import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  FormulaVariableHelp,
  toFormulaVariableHelpKey,
} from '../../../core/services/formula/formula-variable-help';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { FormulaAssignmentViewer } from './formula-assignment-viewer';

describe('FormulaAssignmentViewer', () => {
  let fixture: ComponentFixture<FormulaAssignmentViewer>;
  let variableHelp: jasmine.SpyObj<FormulaVariableHelp>;

  beforeEach(() => {
    variableHelp = jasmine.createSpyObj<FormulaVariableHelp>('FormulaVariableHelp', [
      'getHelpByTargetVariable',
    ]);
    variableHelp.getHelpByTargetVariable.and.returnValue(of(new Map([
      [
        toFormulaVariableHelpKey('trial_power', 'luckValue'),
        'DB says this is raw Luck.',
      ],
    ])));

    TestBed.configureTestingModule({
      imports: [FormulaAssignmentViewer],
      providers: [{ provide: FormulaVariableHelp, useValue: variableHelp }],
    });

    fixture = TestBed.createComponent(FormulaAssignmentViewer);
  });

  it('renders Luck formula variables with distinct readable labels', () => {
    fixture.componentRef.setInput('rows', [
      formulaRow('trial_power', [
        'testedStatValue',
        'luckValue',
        'luckInfluence',
        'trialPower',
      ]),
    ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Tested stat value (testedStatValue)');
    expect(text).toContain('Luck value (luckValue)');
    expect(text).toContain('Luck influence (luckInfluence)');
    expect(text).toContain('Trial Power (trialPower)');
  });

  it('prefers DB metadata help before fallback text', () => {
    const row = formulaRow('trial_power', ['luckValue']);

    fixture.componentRef.setInput('rows', [row]);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(fixture.componentInstance.variableHelpText(row.target, 'luckValue')).toBe(
      'DB says this is raw Luck.',
    );
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
      scopeKey: 'exploration',
      label: 'Trial Power',
      description: 'DB-owned Trial Power target.',
      allowedVariables,
      defaultTestContext: {
        testedStatValue: 30,
        luckValue: 12,
        luckInfluence: 4,
        trialPower: 34,
      },
      sortOrder: 10,
      createdAt: '2026-05-09T10:00:00.000Z',
    },
    assignment: null,
    formula: null,
    status: 'no_assignment',
    statusLabel: 'No assignment',
  };
}
