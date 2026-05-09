import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { FormulaAdminData } from '../../../core/domain/formula/formula.model';
import { FormulaEntityLabels } from '../../../core/services/formula/formula-entity-labels';
import { FormulaVariableHelp } from '../../../core/services/formula/formula-variable-help';
import { FormulaService } from '../../../core/services/formula/formula';
import { ProgressionExplainabilityMetadata } from '../../../core/services/progression/progression-explainability-metadata';
import { FormulasPage } from './formulas-page';

describe('FormulasPage', () => {
  let fixture: ComponentFixture<FormulasPage>;

  beforeEach(() => {
    const formulaService = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
    ]);
    const entityLabels = jasmine.createSpyObj<FormulaEntityLabels>('FormulaEntityLabels', [
      'getEntityLabels',
      'referenceKey',
    ]);
    const progressionMetadata = jasmine.createSpyObj<ProgressionExplainabilityMetadata>(
      'ProgressionExplainabilityMetadata',
      ['getEntries'],
    );
    const variableHelp = jasmine.createSpyObj<FormulaVariableHelp>('FormulaVariableHelp', [
      'getHelpByTargetVariable',
    ]);

    formulaService.getAdminData.and.returnValue(of(formulaData()));
    entityLabels.getEntityLabels.and.returnValue(of(new Map()));
    entityLabels.referenceKey.and.callFake((entityKind: string, entityId: string) =>
      `${entityKind}:${entityId}`,
    );
    progressionMetadata.getEntries.and.returnValue(of([] as UiMetadataEntryReadModel[]));
    variableHelp.getHelpByTargetVariable.and.returnValue(of(new Map()));

    TestBed.configureTestingModule({
      imports: [FormulasPage],
      providers: [
        { provide: FormulaService, useValue: formulaService },
        { provide: FormulaEntityLabels, useValue: entityLabels },
        { provide: ProgressionExplainabilityMetadata, useValue: progressionMetadata },
        { provide: FormulaVariableHelp, useValue: variableHelp },
      ],
    });

    fixture = TestBed.createComponent(FormulasPage);
    fixture.detectChanges();
  });

  it('shows a focused Luck Foundation formula target view without hiding global rows', () => {
    TestBed.flushEffects();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(component.targetRows().length).toBe(2);
    expect(text).toContain('Luck Foundation formula targets');
    expect(text).toContain('Trial Power (trialPower)');
    expect(text).toContain('Building upgrade cost');
  });
});

function formulaData(): FormulaAdminData {
  return {
    targets: [
      {
        id: 'target-luck',
        key: 'trial_power',
        scopeKey: 'exploration',
        label: 'Trial Power',
        description: 'DB-owned Trial Power formula target.',
        allowedVariables: [
          'testedStatValue',
          'luckValue',
          'luckInfluence',
          'trialPower',
        ],
        defaultTestContext: {
          testedStatValue: 30,
          luckValue: 12,
          luckInfluence: 4,
          trialPower: 34,
        },
        sortOrder: 10,
        createdAt: '2026-05-09T10:00:00.000Z',
      },
      {
        id: 'target-building',
        key: 'building_upgrade_cost',
        scopeKey: 'building_balance',
        label: 'Building upgrade cost',
        description: 'Building formula target.',
        allowedVariables: ['currentLevel', 'targetLevel', 'baseCost', 'rank'],
        defaultTestContext: {
          currentLevel: 1,
          targetLevel: 2,
          baseCost: 100,
          rank: 1,
        },
        sortOrder: 20,
        createdAt: '2026-05-09T10:00:00.000Z',
      },
    ],
    formulas: [
      {
        id: 'formula-luck',
        key: 'trial-power-formula',
        scopeKey: 'exploration',
        label: 'Trial Power formula',
        expression: 'testedStatValue + luckInfluence',
        description: 'DB-owned preview formula.',
        isEnabled: true,
        createdAt: '2026-05-09T10:00:00.000Z',
        updatedAt: '2026-05-09T10:00:00.000Z',
      },
      {
        id: 'formula-building',
        key: 'building-cost-formula',
        scopeKey: 'building_balance',
        label: 'Building cost formula',
        expression: 'baseCost + targetLevel',
        description: null,
        isEnabled: true,
        createdAt: '2026-05-09T10:00:00.000Z',
        updatedAt: '2026-05-09T10:00:00.000Z',
      },
    ],
    assignments: [
      {
        id: 'assignment-luck',
        targetId: 'target-luck',
        formulaId: 'formula-luck',
        createdAt: '2026-05-09T10:00:00.000Z',
        updatedAt: '2026-05-09T10:00:00.000Z',
      },
      {
        id: 'assignment-building',
        targetId: 'target-building',
        formulaId: 'formula-building',
        createdAt: '2026-05-09T10:00:00.000Z',
        updatedAt: '2026-05-09T10:00:00.000Z',
      },
    ],
    entityAssignments: [],
    blocks: [],
  };
}
