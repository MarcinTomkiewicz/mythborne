import { TestBed } from '@angular/core/testing';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { BuildingProgressionService } from './building-progression';

describe('BuildingProgressionService', () => {
  let service: BuildingProgressionService;

  const adminData: FormulaAdminData = {
    targets: [
      {
        id: 'target-cost',
        key: 'building_upgrade_cost',
        scopeKey: 'building_balance',
        label: 'Building upgrade cost',
        description: null,
        allowedVariables: ['currentLevel', 'targetLevel', 'baseCost', 'rank'],
        defaultTestContext: { currentLevel: 0, targetLevel: 1, baseCost: 10, rank: 1 },
        sortOrder: 10,
        createdAt: null,
      },
      {
        id: 'target-time',
        key: 'building_upgrade_time',
        scopeKey: 'building_balance',
        label: 'Building upgrade time',
        description: null,
        allowedVariables: ['currentLevel', 'targetLevel', 'baseTimeSeconds', 'rank'],
        defaultTestContext: { currentLevel: 0, targetLevel: 1, baseTimeSeconds: 10, rank: 1 },
        sortOrder: 20,
        createdAt: null,
      },
      {
        id: 'target-bonus',
        key: 'building_bonus_growth',
        scopeKey: 'building_balance',
        label: 'Building bonus growth',
        description: null,
        allowedVariables: ['currentLevel', 'baseBonus'],
        defaultTestContext: { currentLevel: 1, baseBonus: 1 },
        sortOrder: 30,
        createdAt: null,
      },
    ],
    formulas: [
      {
        id: 'formula-global-cost',
        key: 'global-cost',
        scopeKey: 'building_balance',
        label: 'Global cost',
        expression: 'baseCost + targetLevel',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'formula-local-cost',
        key: 'local-cost',
        scopeKey: 'building_balance',
        label: 'Local cost',
        expression: 'baseCost + targetLevel + 100',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'formula-global-time',
        key: 'global-time',
        scopeKey: 'building_balance',
        label: 'Global time',
        expression: 'baseTimeSeconds + targetLevel',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'formula-global-bonus',
        key: 'global-bonus',
        scopeKey: 'building_balance',
        label: 'Global bonus',
        expression: 'baseBonus + currentLevel',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
    ],
    assignments: [
      {
        id: 'assignment-cost',
        targetId: 'target-cost',
        formulaId: 'formula-global-cost',
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'assignment-time',
        targetId: 'target-time',
        formulaId: 'formula-global-time',
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'assignment-bonus',
        targetId: 'target-bonus',
        formulaId: 'formula-global-bonus',
        createdAt: null,
        updatedAt: null,
      },
    ],
    entityAssignments: [
      {
        id: 'entity-assignment-cost',
        entityKind: 'building',
        entityId: 'building-local',
        targetId: 'target-cost',
        formulaId: 'formula-local-cost',
        createdAt: null,
        updatedAt: null,
      },
    ],
    blocks: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FormulaService,
          useValue: jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']),
        },
      ],
    });
    service = TestBed.inject(BuildingProgressionService);
  });

  it('uses local building formula assignment before the global default', () => {
    const rules = service.resolveRulesForBuilding('building-local', adminData);

    expect(rules.costFormulaId).toBe('formula-local-cost');
    expect(rules.costExpression).toBe('baseCost + targetLevel + 100');
    expect(rules.timeFormulaId).toBe('formula-global-time');
  });

  it('falls back to global formula assignment when the building has no local override', () => {
    const rules = service.resolveRulesForBuilding('building-without-override', adminData);

    expect(rules.costFormulaId).toBe('formula-global-cost');
    expect(rules.costExpression).toBe('baseCost + targetLevel');
  });

  it('calculates upgrade cost from the positive base cost and target level', () => {
    const rules = service.resolveRulesForBuilding('building-without-override', adminData);

    expect(service.getUpgradeCost(2, 100, 1, rules)).toBe(103);
  });

  it('passes current and target level without legacy level for upgrade formulas', () => {
    const rules = {
      costFormulaId: 'formula-snake-cost',
      timeFormulaId: 'formula-snake-time',
      bonusFormulaId: 'formula-snake-bonus',
      costExpression: 'baseCost + currentLevel + targetLevel',
      timeExpression: 'baseTimeSeconds + currentLevel + targetLevel',
      bonusExpression: 'baseBonus + currentLevel',
    };

    expect(service.getUpgradeCost(2, 100, 1, rules)).toBe(105);
    expect(service.getUpgradeTimeSeconds(2, 20, 1, rules)).toBe(25);
    expect(service.getBonusValue(3, 7, rules)).toBe(10);
  });

  it('returns formula evaluation errors for invalid local preview formulas', () => {
    const result = service.getUpgradeCostResult(
      3,
      100,
      1,
      {
        costFormulaId: 'formula-invalid-cost',
        timeFormulaId: null,
        bonusFormulaId: null,
        costExpression: 'baseCost + missing_variable',
        timeExpression: '',
        bonusExpression: '',
      },
    );

    expect(result.value).toBeNull();
    expect(result.error).toBe('Unknown token in formula: missing_variable.');
  });
});
