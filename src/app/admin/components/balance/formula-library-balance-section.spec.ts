import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { FormulaActionGroup } from './formula-action-group';
import { FormulaLibraryBalanceSection } from './formula-library-balance-section';

describe('FormulaLibraryBalanceSection', () => {
  let fixture: ComponentFixture<FormulaLibraryBalanceSection>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormulaLibraryBalanceSection],
      providers: [{ provide: ItemGenerationBalancePageFacade, useValue: pageFacade() }],
    });

    fixture = TestBed.createComponent(FormulaLibraryBalanceSection);
    fixture.detectChanges();
  });

  it('renders selected target Scope variables without legacy building variables', () => {
    const scopeGroup = fixture.debugElement
      .queryAll(By.directive(FormulaActionGroup))
      .map((element) => element.componentInstance as FormulaActionGroup)
      .find((group) => group.title() === 'Scope variables');

    expect(scopeGroup).toBeDefined();
    expect(scopeGroup?.items().map((item) => item.label)).toEqual([
      'currentLevel',
      'targetLevel',
      'baseCost',
      'rank',
    ]);
    expect(scopeGroup?.items().some((item) => item.label === 'level')).toBeFalse();
    expect(scopeGroup?.items().some((item) => item.label === 'nextLevel')).toBeFalse();
  });
});

function pageFacade(): Partial<ItemGenerationBalancePageFacade> {
  const selectorForm = new FormGroup({
    selectedId: new FormControl('', { nonNullable: true }),
  });
  const editorForm = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    key: new FormControl('', { nonNullable: true }),
    scopeKey: new FormControl('building_balance', { nonNullable: true }),
    label: new FormControl('', { nonNullable: true }),
    expression: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    isEnabled: new FormControl(true, { nonNullable: true }),
  });

  return {
    isLoading: signal(false),
    isBusy: computed(() => false),
    formulas: {
      selectorForm,
      editorForm,
      data: () => ({
        targets: [],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      }),
      availableScopes: () => ['building_balance'],
      newFormula: () => undefined,
      blocks: () => [],
      functionGuides: () => [],
      formulaTemplates: () => [],
      templateVariable: () => 'currentLevel',
      scopeVariables: () => [
        { key: 'currentLevel', label: 'currentLevel', helperText: '', targetLabels: [] },
        { key: 'targetLevel', label: 'targetLevel', helperText: '', targetLabels: [] },
        { key: 'baseCost', label: 'baseCost', helperText: '', targetLabels: [] },
        { key: 'rank', label: 'rank', helperText: '', targetLabels: [] },
      ],
      previewVariableDefinitions: () => [],
      variableTooltip: () => '',
      formulaValidationError: () => null,
      humanExpression: () => '',
      chartVariable: () => '',
      chartState: () => ({ canPlot: false, points: [] }),
      isFormulaNonDeterministic: () => false,
      targetsForCurrentScope: () => [],
      testerTargetId: () => '',
      selectTesterTarget: () => undefined,
      testerVariables: () => [],
      getTesterValue: () => 0,
      updateTesterVariable: () => undefined,
      preview: () => ({ value: null, error: null }),
      rerollPreview: () => undefined,
      isSaving: () => false,
      saveFormula: () => undefined,
      deleteFormula: () => undefined,
    } as unknown as ItemGenerationBalancePageFacade['formulas'],
  };
}
