import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { FormulaImpactCalculator } from './formula-impact-calculator';

describe('FormulaImpactCalculator', () => {
  let fixture: ComponentFixture<FormulaImpactCalculator>;
  let component: FormulaImpactCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormulaImpactCalculator],
    });

    fixture = TestBed.createComponent(FormulaImpactCalculator);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rows', [formulaRow('random(10, 20)')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('marks random formulas as non-deterministic and skips stable chart plotting', () => {
    expect(component.isSelectedFormulaNonDeterministic()).toBeTrue();
    expect(component.chartState().canPlot).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('uses random()');
  });

  it('rerolls random preview samples on demand', () => {
    const random = spyOn(Math, 'random');
    random.and.returnValue(0.1);
    component.rerollPreview();

    const first = component.previewRows()[0].value;

    random.and.returnValue(0.9);
    component.rerollPreview();

    expect(component.previewRows()[0].value).toBeGreaterThan(first ?? 0);
  });
});

function formulaRow(expression: string): FormulaTargetAssignmentRow {
  return {
    target: {
      id: 'target-1',
      key: 'combat_initiative_score',
      scopeKey: 'combat',
      label: 'Combat initiative score',
      description: 'Orders combat attack slots.',
      allowedVariables: ['level'],
      defaultTestContext: { level: 1 },
      sortOrder: 10,
      createdAt: '2026-05-02T10:00:00.000Z',
    },
    assignment: {
      id: 'assignment-1',
      targetId: 'target-1',
      formulaId: 'formula-1',
      createdAt: '2026-05-02T10:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
    },
    formula: {
      id: 'formula-1',
      key: 'combat-random-preview',
      scopeKey: 'combat',
      label: 'Combat random preview',
      expression,
      description: null,
      isEnabled: true,
      createdAt: '2026-05-02T10:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
    },
    status: 'enabled',
    statusLabel: 'Enabled',
  };
}
