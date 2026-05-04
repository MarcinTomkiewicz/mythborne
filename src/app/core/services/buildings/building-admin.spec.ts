import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { EditableBuilding } from '../../domain/building/building.model';
import { Backend } from '../backend/backend';
import { BonusTemplateAdminService } from '../bonus/bonus-template-admin';
import { FormulaService } from '../formula/formula';
import { BuildingProgressionService } from '../progression/building-progression';
import { BuildingExplainabilityMetadata } from './building-explainability-metadata';
import { BuildingAdminService } from './building-admin';

describe('BuildingAdminService', () => {
  let service: BuildingAdminService;
  let backend: jasmine.SpyObj<Backend>;
  let progression: jasmine.SpyObj<BuildingProgressionService>;
  let formulaService: jasmine.SpyObj<FormulaService>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'create',
      'createMany',
      'delete',
      'getAll',
      'rpc',
      'update',
    ]);
    progression = jasmine.createSpyObj<BuildingProgressionService>(
      'BuildingProgressionService',
      ['clearCache'],
    );
    formulaService = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'assignFormulaToEntity',
      'clearCache',
      'getAdminData',
    ]);

    backend.update.and.returnValue(of({ id: 'building-1' }));
    backend.delete.and.returnValue(of(void 0));
    backend.createMany.and.returnValue(of([]));
    formulaService.getAdminData.and.returnValue(of({
      formulas: [],
      targets: [],
      assignments: [],
      entityAssignments: [],
      blocks: [],
    }));

    TestBed.configureTestingModule({
      providers: [
        BuildingAdminService,
        { provide: Backend, useValue: backend },
        { provide: BuildingProgressionService, useValue: progression },
        { provide: FormulaService, useValue: formulaService },
        {
          provide: BonusTemplateAdminService,
          useValue: jasmine.createSpyObj<BonusTemplateAdminService>(
            'BonusTemplateAdminService',
            ['getAdminData'],
          ),
        },
        {
          provide: BuildingExplainabilityMetadata,
          useValue: jasmine.createSpyObj<BuildingExplainabilityMetadata>(
            'BuildingExplainabilityMetadata',
            ['getAdminEntries'],
          ),
        },
      ],
    });
    service = TestBed.inject(BuildingAdminService);
  });

  it('saves starting level through the existing building editor write path', (done) => {
    service.saveBuilding(editableBuilding()).subscribe({
      next: () => {
        expect(backend.update).toHaveBeenCalledWith(
          TABLES.buildings,
          'building-1',
          jasmine.objectContaining({
            key: 'market',
            startingLevel: 2,
            baseBuildTimeSeconds: 120,
            maxLevel: 0,
          }),
        );
        expect(backend.createMany).toHaveBeenCalledWith(
          TABLES.building_resource_costs,
          [jasmine.objectContaining({
            buildingId: 'building-1',
            resourceType: 'drachma',
            baseValue: 100,
            appliesFromLevel: 1,
          })],
        );
        expect(progression.clearCache).toHaveBeenCalled();
        expect(formulaService.clearCache).toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });
  });

  it('saves starting level 0 without normalizing it to 1', (done) => {
    service.saveBuilding({
      ...editableBuilding(),
      startingLevel: 0,
    }).subscribe({
      next: () => {
        expect(backend.update).toHaveBeenCalledWith(
          TABLES.buildings,
          'building-1',
          jasmine.objectContaining({
            startingLevel: 0,
          }),
        );
        done();
      },
      error: done.fail,
    });
  });
});

function editableBuilding(): EditableBuilding {
  return {
    id: 'building-1',
    key: 'market',
    name: 'Market',
    description: 'Trade building.',
    imagePath: '',
    districtCode: 'A',
    sortOrder: 10,
    startingLevel: 2,
    baseBuildTimeSeconds: 120,
    maxLevel: 0,
    formulaOverrides: {
      upgradeCostFormulaId: null,
      upgradeTimeFormulaId: null,
      bonusGrowthFormulaId: null,
    },
    bonuses: [],
    resourceCosts: [
      {
        id: null,
        resourceType: 'drachma',
        baseValue: 100,
        appliesFromLevel: 1,
      },
    ],
  };
}
