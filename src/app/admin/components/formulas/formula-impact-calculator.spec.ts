import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  FormulaVariableHelp,
  toFormulaVariableHelpKey,
} from '../../../core/services/formula/formula-variable-help';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { FormulaImpactCalculator } from './formula-impact-calculator';

describe('FormulaImpactCalculator', () => {
  let fixture: ComponentFixture<FormulaImpactCalculator>;
  let component: FormulaImpactCalculator;
  let variableHelp: jasmine.SpyObj<FormulaVariableHelp>;

  beforeEach(() => {
    variableHelp = jasmine.createSpyObj<FormulaVariableHelp>('FormulaVariableHelp', [
      'getHelpByTargetVariable',
    ]);
    variableHelp.getHelpByTargetVariable.and.returnValue(of(new Map([
      [
        toFormulaVariableHelpKey('building_upgrade_cost', 'targetLevel'),
        'The level being priced/timed by this building preview.',
      ],
    ])));

    TestBed.configureTestingModule({
      imports: [FormulaImpactCalculator],
      providers: [{ provide: FormulaVariableHelp, useValue: variableHelp }],
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

  it('uses building target variables without legacy level', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.variableOptions().map((option) => option.value)).toEqual([
      'currentLevel',
      'targetLevel',
      'baseCost',
      'rank',
    ]);
    expect(component.variableOptions().some((option) => option.value === 'level')).toBeFalse();
  });

  it('uses exact building upgrade time variables from the current contract', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow(
      'baseTimeSeconds + targetLevel',
      'building_upgrade_time',
      ['currentLevel', 'targetLevel', 'baseTimeSeconds', 'rank'],
      { currentLevel: 0, targetLevel: 1, baseTimeSeconds: 120, rank: 1 },
    )]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.variableOptions().map((option) => option.value)).toEqual([
      'currentLevel',
      'targetLevel',
      'baseTimeSeconds',
      'rank',
    ]);
  });

  it('does not expose removed formula variables for active tester targets', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(
      component.variableOptions().some((option) =>
        /^(level|heroLevel|statLevel|levelDifference|nextLevel)$/.test(option.value),
      ),
    ).toBeFalse();
  });

  it('syncs currentLevel 0 to targetLevel 1 for building previews', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    variableControl(component, 'currentLevel').setValue(0);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(variableControl(component, 'targetLevel').value).toBe(1);
    expect(component.outputSummary()).toBe('Previewing upgrade currentLevel 0 -> targetLevel 1');
  });

  it('syncs currentLevel 2 to targetLevel 3 for building previews', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    variableControl(component, 'currentLevel').setValue(2);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(variableControl(component, 'targetLevel').value).toBe(3);
    expect(component.outputSummary()).toBe('Previewing upgrade currentLevel 2 -> targetLevel 3');
  });

  it('syncs currentLevel 5 to targetLevel 6 for building previews', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    variableControl(component, 'currentLevel').setValue(5);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(variableControl(component, 'targetLevel').value).toBe(6);
    expect(component.outputSummary()).toBe('Previewing upgrade currentLevel 5 -> targetLevel 6');
  });

  it('normalizes manual targetLevel edits back to the standard next target level', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    variableControl(component, 'currentLevel').setValue(5);
    fixture.detectChanges();
    TestBed.flushEffects();
    variableControl(component, 'targetLevel').setValue(2);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(variableControl(component, 'targetLevel').value).toBe(6);
    expect(component.buildingTargetLevelWarning()).toBeNull();
  });

  it('shows targetLevel as derived instead of an editable building input', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.sweepVariable()).toBe('targetLevel');
    expect(component.editableVariables()).toEqual(['currentLevel', 'baseCost', 'rank']);
    expect(component.derivedTargetLevel()).toBe(1);
  });

  it('sweeps targetLevel and derives currentLevel per building preview sample', () => {
    fixture.componentRef.setInput('rows', [
      buildingFormulaRow('currentLevel + targetLevel'),
    ]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.sweepVariable()).toBe('targetLevel');
    expect(component.previewRows().slice(0, 3).map((row) => row.value)).toEqual([
      1,
      3,
      5,
    ]);
  });

  it('uses DB metadata for building target variable tooltips', () => {
    fixture.componentRef.setInput('rows', [buildingFormulaRow('baseCost + targetLevel')]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.variableHelpText('targetLevel')).toContain('level being priced/timed');
  });

  it('labels Luck variables distinctly and falls back to canonical Luck helper text', () => {
    fixture.componentRef.setInput('rows', [
      formulaRow(
        'testedStatValue + luckInfluence',
        'trial_power',
        ['testedStatValue', 'luck', 'luckInfluence', 'trialPower'],
        {
          testedStatValue: 30,
          luck: 12,
          luckInfluence: 4,
          trialPower: 34,
        },
      ),
    ]);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.variableOptions().map((option) => option.label)).toEqual([
      'Tested stat value (testedStatValue)',
      'Luck value (luck)',
      'Luck influence (luckInfluence)',
      'Trial Power (trialPower)',
    ]);
    expect(component.variableHelpText('luck')).toContain('Raw Luck input');
    expect(component.variableHelpText('luckInfluence').toLowerCase()).toContain(
      'formula-derived',
    );
    expect(component.variableHelpText('trialPower')).toContain('tested stat value plus');
  });
});

function variableControl(
  component: FormulaImpactCalculator,
  variable: string,
) {
  const control = component.form.controls.variables.controls[variable];

  if (!control) {
    throw new Error(`Formula preview variable control "${variable}" is not registered.`);
  }

  return control;
}

function formulaRow(
  expression: string,
  targetKey = 'combat_initiative_score',
  allowedVariables: string[] = ['currentLevel'],
  defaultTestContext: Record<string, number> = { currentLevel: 1 },
): FormulaTargetAssignmentRow {
  return {
    target: {
      id: 'target-1',
      key: targetKey,
      scopeKey: 'combat',
      label: 'Combat initiative score',
      description: 'Orders combat attack slots.',
      allowedVariables,
      defaultTestContext,
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

function buildingFormulaRow(
  expression: string,
  targetKey = 'building_upgrade_cost',
  allowedVariables: string[] = ['currentLevel', 'targetLevel', 'baseCost', 'rank'],
  defaultTestContext: Record<string, number> = {
    currentLevel: 0,
    targetLevel: 1,
    baseCost: 100,
    rank: 1,
  },
): FormulaTargetAssignmentRow {
  return {
    ...formulaRow(expression),
    target: {
      id: 'target-building-cost',
      key: targetKey,
      scopeKey: 'building_balance',
      label: 'Building upgrade cost',
      description: 'Prices the next building upgrade.',
      allowedVariables,
      defaultTestContext,
      sortOrder: 10,
      createdAt: '2026-05-02T10:00:00.000Z',
    },
    formula: {
      id: 'formula-building-cost',
      key: 'building-cost-preview',
      scopeKey: 'building_balance',
      label: 'Building cost preview',
      expression,
      description: null,
      isEnabled: true,
      createdAt: '2026-05-02T10:00:00.000Z',
      updatedAt: '2026-05-02T10:00:00.000Z',
    },
  };
}
