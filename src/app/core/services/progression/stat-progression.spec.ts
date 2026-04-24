import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { StatProgressionService } from './stat-progression';

describe('StatProgressionService', () => {
  let service: StatProgressionService;
  let formulaService: jasmine.SpyObj<FormulaService>;

  beforeEach(() => {
    formulaService = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']);
    const adminData: FormulaAdminData = {
        targets: [
          {
            id: 'target-cost',
            key: 'hero_stat_upgrade_cost',
            scopeKey: 'hero_progression',
            label: 'Hero stat upgrade cost',
            description: null,
            allowedVariables: ['heroLevel', 'level', 'statLevel'],
            defaultTestContext: { heroLevel: 1, level: 1, statLevel: 1 } as Record<string, number>,
            sortOrder: 10,
            createdAt: null,
          },
          {
            id: 'target-cap',
            key: 'hero_stat_level_cap',
            scopeKey: 'hero_progression',
            label: 'Hero stat level cap',
            description: null,
            allowedVariables: ['heroLevel'],
            defaultTestContext: { heroLevel: 1 } as Record<string, number>,
            sortOrder: 20,
            createdAt: null,
          },
        ],
        formulas: [
          {
            id: 'formula-cost',
            key: 'hero-stat-upgrade-cost-default',
            scopeKey: 'hero_progression',
            label: 'Cost',
            expression: 'roundUp(4 + level * 2 + pow(level, 1.45), 5)',
            description: null,
            isEnabled: true,
            createdAt: null,
            updatedAt: null,
          },
          {
            id: 'formula-cap',
            key: 'hero-stat-level-cap-default',
            scopeKey: 'hero_progression',
            label: 'Cap',
            expression: 'heroLevel + 4',
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
            formulaId: 'formula-cost',
            createdAt: null,
            updatedAt: null,
          },
          {
            id: 'assignment-cap',
            targetId: 'target-cap',
            formulaId: 'formula-cap',
            createdAt: null,
            updatedAt: null,
          },
        ],
        blocks: [],
      };
    formulaService.getAdminData.and.returnValue(of(adminData));

    TestBed.configureTestingModule({
      providers: [{ provide: FormulaService, useValue: formulaService }],
    });
    service = TestBed.inject(StatProgressionService);
  });

  it('returns a next level cost from the active formula', () => {
    expect(
      service.getNextLevelCost(1, 'roundUp(4 + statLevel * 2 + heroLevel, 5)', {
        heroLevel: 3,
        statLevel: 1,
        target: {
          id: 'target-cost',
          key: 'hero_stat_upgrade_cost',
          scopeKey: 'hero_progression',
          label: 'Hero stat upgrade cost',
          description: null,
          allowedVariables: ['heroLevel', 'level', 'statLevel'],
          defaultTestContext: { heroLevel: 1, level: 1, statLevel: 1 },
          sortOrder: 10,
          createdAt: null,
        },
      })
    ).toBe(10);
  });

  it('returns a project cap based on hero level', () => {
    const target = {
      id: 'target-cap',
      key: 'hero_stat_level_cap',
      scopeKey: 'hero_progression',
      label: 'Hero stat level cap',
      description: null,
      allowedVariables: ['heroLevel'],
      defaultTestContext: { heroLevel: 1 } as Record<string, number>,
      sortOrder: 20,
      createdAt: null,
    };
    expect(service.getStatCap(1, 'heroLevel + 4', target)).toBe(5);
    expect(service.getStatCap(5, 'heroLevel + 4', target)).toBe(9);
  });
});
