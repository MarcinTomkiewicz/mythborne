import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { ToastService } from '../ui/toast';
import { ItemGenerationFormulaBalanceFacade } from './item-generation-formula-balance.facade';

describe('ItemGenerationFormulaBalanceFacade', () => {
  let facade: ItemGenerationFormulaBalanceFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ItemGenerationFormulaBalanceFacade,
        FormulaRuntimeService,
        {
          provide: FormulaService,
          useValue: jasmine.createSpyObj<FormulaService>('FormulaService', {
            getAdminData: of(formulaData()),
            saveFormula: of(undefined),
            saveTargetVariables: of(undefined),
            assignFormula: of(undefined),
            clearCache: undefined,
          }),
        },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj<ToastService>('ToastService', ['show']),
        },
      ],
    });

    facade = TestBed.inject(ItemGenerationFormulaBalanceFacade);
    facade.setData(formulaData(), { targetKey: 'building_upgrade_cost' });
    TestBed.flushEffects();
  });

  it('shows Scope variables for building_upgrade_cost without legacy or stat variables', () => {
    expect(facade.scopeVariables().map((variable) => variable.key)).toEqual([
      'baseCost',
      'currentLevel',
      'rank',
      'targetLevel',
    ]);
  });

  it('shows Scope variables for building_upgrade_time with baseTimeSeconds only', () => {
    facade.setData(formulaData(), { targetKey: 'building_upgrade_time' });

    expect(facade.scopeVariables().map((variable) => variable.key)).toEqual([
      'baseTimeSeconds',
      'currentLevel',
      'rank',
      'targetLevel',
    ]);
  });

  it('keeps statCurrentLevel on stat target and out of building target variables', () => {
    facade.setData(formulaData(), { targetKey: 'hero_stat_upgrade_cost' });
    expect(facade.scopeVariables().map((variable) => variable.key)).toEqual([
      'statCurrentLevel',
    ]);

    facade.setData(formulaData(), { targetKey: 'building_upgrade_cost' });
    expect(facade.scopeVariables().map((variable) => variable.key)).not.toContain(
      'statCurrentLevel',
    );
  });

  it('uses the tester target variables when editor formula and assignment target diverge', () => {
    facade.setData(formulaData(), {
      targetKey: 'hero_stat_upgrade_cost',
      formulaKey: 'building-time-formula',
    });

    expect(facade.selectedTargetKey()).toBe('hero_stat_upgrade_cost');
    expect(facade.testerReferenceTarget()?.key).toBe('building_upgrade_time');
    expect(facade.scopeVariables().map((variable) => variable.key)).toEqual([
      'baseTimeSeconds',
      'currentLevel',
      'rank',
      'targetLevel',
    ]);
  });

  it('syncs building tester currentLevel to targetLevel', () => {
    facade.selectTesterTarget('target-cost');

    facade.updateTesterVariable('currentLevel', '5');

    expect(facade.getTesterValue('currentLevel')).toBe(5);
    expect(facade.getTesterValue('targetLevel')).toBe(6);
  });

  it('reverse-syncs manual building tester targetLevel edits to currentLevel', () => {
    facade.selectTesterTarget('target-cost');

    facade.updateTesterVariable('currentLevel', '5');
    facade.updateTesterVariable('targetLevel', '2');

    expect(facade.getTesterValue('currentLevel')).toBe(1);
    expect(facade.getTesterValue('targetLevel')).toBe(2);
  });
});

function formulaData(): FormulaAdminData {
  return {
    targets: [
      target('target-cost', 'building_upgrade_cost', ['currentLevel', 'targetLevel', 'baseCost', 'rank']),
      target('target-time', 'building_upgrade_time', [
        'currentLevel',
        'targetLevel',
        'baseTimeSeconds',
        'rank',
      ]),
      target('target-bonus', 'building_bonus_growth', ['currentLevel', 'baseBonus']),
      target('target-stat-cost', 'hero_stat_upgrade_cost', ['statCurrentLevel'], 'hero_progression'),
    ],
    formulas: [
      formula('formula-building-time', 'building-time-formula', 'building_balance'),
      formula('formula-stat-cost', 'stat-cost-formula', 'hero_progression'),
    ],
    assignments: [
      {
        id: 'assignment-building-time',
        targetId: 'target-time',
        formulaId: 'formula-building-time',
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'assignment-stat-cost',
        targetId: 'target-stat-cost',
        formulaId: 'formula-stat-cost',
        createdAt: null,
        updatedAt: null,
      },
    ],
    entityAssignments: [],
    blocks: [
      variableBlock('currentLevel'),
      variableBlock('targetLevel'),
      variableBlock('baseCost'),
      variableBlock('rank'),
      variableBlock('baseBonus'),
      variableBlock('baseTimeSeconds'),
      variableBlock('statCurrentLevel', 'hero_progression'),
    ],
  };
}

function target(
  id: string,
  key: string,
  allowedVariables: string[],
  scopeKey = 'building_balance',
) {
  return {
    id,
    key,
    scopeKey,
    label: key,
    description: null,
    allowedVariables,
    defaultTestContext: Object.fromEntries(
      allowedVariables.map((variable) => [variable, variable === 'targetLevel' ? 1 : 0]),
    ),
    sortOrder: 10,
    createdAt: null,
  };
}

function formula(id: string, key: string, scopeKey: string) {
  return {
    id,
    key,
    scopeKey,
    label: key,
    expression: 'currentLevel + 1',
    description: null,
    isEnabled: true,
    createdAt: null,
    updatedAt: null,
  };
}

function variableBlock(token: string, scopeKey = 'building_balance') {
  return {
    id: `block-${token}`,
    scopeKey,
    category: 'variables',
    token,
    label: token,
    description: null,
    helperText: null,
    sortOrder: 10,
    isActive: true,
    createdAt: null,
    updatedAt: null,
  };
}
