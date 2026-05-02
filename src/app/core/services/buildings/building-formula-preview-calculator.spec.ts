import { TestBed } from '@angular/core/testing';
import { FormulaService } from '../formula/formula';
import { BuildingFormulaPreviewCalculator } from './building-formula-preview-calculator';

describe('BuildingFormulaPreviewCalculator', () => {
  let calculator: BuildingFormulaPreviewCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BuildingFormulaPreviewCalculator,
        {
          provide: FormulaService,
          useValue: jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']),
        },
      ],
    });
    calculator = TestBed.inject(BuildingFormulaPreviewCalculator);
  });

  it('uses editable resource cost rows for positive single-level preview costs', () => {
    const preview = calculator.singleLevelPreview(1, {
      building: createBuilding(),
      rules: {
        costExpression: 'baseCost',
        timeExpression: 'baseTime',
        bonusExpression: 'baseBonus',
      },
      costs: [
        { id: null, resourceType: 'drachma', baseValue: 100, appliesFromLevel: 1 },
        { id: null, resourceType: 'materials', baseValue: 50, appliesFromLevel: 1 },
      ],
      bonuses: [],
    });

    expect(preview.nextCosts).toEqual([
      { resourceType: 'drachma', amount: 100, reason: null },
      { resourceType: 'materials', amount: 50, reason: null },
    ]);
  });

  it('explains when no editable cost row applies to the preview level', () => {
    const preview = calculator.singleLevelPreview(1, {
      building: createBuilding(),
      rules: {
        costExpression: 'baseCost',
        timeExpression: 'baseTime',
        bonusExpression: 'baseBonus',
      },
      costs: [{ id: null, resourceType: 'drachma', baseValue: 100, appliesFromLevel: 5 }],
      bonuses: [],
    });

    expect(preview.nextCosts).toEqual([]);
    expect(preview.costUnavailableReason).toBe(
      'No editable resource cost row applies to level 2. The first configured row starts at level 5.',
    );
  });
});

function createBuilding() {
  return {
    id: 'building-1',
    key: 'test_building',
    name: 'Test building',
    description: '',
    imagePath: '',
    districtCode: 'A',
    sortOrder: 1,
    baseBuildTimeSeconds: 10,
    maxLevel: 15,
    formulaOverrides: {
      upgradeCostFormulaId: null,
      upgradeTimeFormulaId: null,
      bonusGrowthFormulaId: null,
    },
    bonuses: [],
    resourceCosts: [],
  };
}
