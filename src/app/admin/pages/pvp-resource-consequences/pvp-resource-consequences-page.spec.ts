import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { ResourceTypeReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import {
  BalanceFormula,
  FormulaAdminData,
  FormulaAssignment,
  FormulaTarget,
} from '../../../core/domain/formula/formula.model';
import {
  GameServerKind,
  GameServerStatus,
  GlobalRoleKey,
} from '../../../core/enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import {
  PvpResourceConsequencesAdmin,
  PvpResourceConsequencesAdminData,
} from '../../../core/services/pvp/pvp-resource-consequences-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpResourceConsequencesPage } from './pvp-resource-consequences-page';

describe('PvpResourceConsequencesPage', () => {
  let fixture: ComponentFixture<PvpResourceConsequencesPage>;
  let resourceConsequences: jasmine.SpyObj<PvpResourceConsequencesAdmin>;

  beforeEach(() => {
    resourceConsequences = jasmine.createSpyObj<PvpResourceConsequencesAdmin>(
      'PvpResourceConsequencesAdmin',
      ['getData'],
    );
    resourceConsequences.getData.and.returnValue(of(resourceConsequenceData()));

    TestBed.configureTestingModule({
      imports: [PvpResourceConsequencesPage],
      providers: [
        provideRouter([]),
        {
          provide: PvpResourceConsequencesAdmin,
          useValue: resourceConsequences,
        },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpResourceConsequencesPage);
  });

  it('renders eligible PvP resource dictionary rows only', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(resourceConsequences.getData).toHaveBeenCalled();
    expect(text).toContain('Drachma');
    expect(text).toContain('Materials');
    expect(text).toContain('Workforce');
    expect(text).toContain('Drachma admin copy.');
    expect(text).toContain('Not eligible resource keys');
    expect(text).toContain('Character Points');
    expect(text).toContain('Items');
    expect(text).toContain('Buildings');
    expect(text).toContain('Estate ownership');
    expect(text).not.toContain('Character Points transfer');
    expect(text).not.toContain('Item transfer');
    expect(text).not.toContain('Building transfer');
    expect(text).not.toContain('Estate ownership transfer');
  });

  it('renders resource consequence formula targets from formula read data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Attacker victory resource steal percent');
    expect(text).toContain('pvp_resource_steal_percent');
    expect(text).toContain('Defender victory attacker loss percent');
    expect(text).toContain('pvp_attacker_defeat_resource_loss_percent');
    expect(text).toContain('resource consequence formula');
    expect(text).toContain('base_percent * victory_modifier');
    expect(text).toContain('base_percent');
    expect(text).toContain('"base_percent": 10');
  });

  it('renders forbidden boundary explanations by explicit metadata key', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Forbidden consequence metadata');
    expect(text).toContain('DB forbidden consequence copy.');
    expect(text).not.toContain('metadata gap: forbidden consequences');
  });

  it('does not match boundary metadata by description text alone', async () => {
    resourceConsequences.getData.and.returnValue(of({
      formulas: emptyFormulaData(),
      resourceTypes: [],
      metadataEntries: [
        metadataEntry(
          'unrelated_copy',
          'Unrelated metadata',
          'This text mentions forbidden consequences.',
        ),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('metadata gap: forbidden consequences');
    expect(text).not.toContain('Unrelated metadata');
  });

  it('surfaces missing formula targets, resources and metadata as gaps', async () => {
    resourceConsequences.getData.and.returnValue(of({
      formulas: {
        targets: [
          target(
            'pvp_resource_steal_percent',
            'Attacker victory resource steal percent',
          ),
        ],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      },
      resourceTypes: [resourceType('drachma', 'Drachma')],
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp_attacker_defeat_resource_loss_percent');
    expect(text).toContain('materials');
    expect(text).toContain('workforce');
    expect(text).toContain('metadata gap: forbidden consequences');
  });

  it('surfaces loading errors without stale resource rows', async () => {
    resourceConsequences.getData.and.returnValue(
      throwError(() => new Error('resource consequence read unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('resource consequence read unavailable');
    expect(text).not.toContain('Drachma admin copy.');
  });
});

function textContent(
  fixture: ComponentFixture<PvpResourceConsequencesPage>,
): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function resourceConsequenceData(): PvpResourceConsequencesAdminData {
  const targets = [
    target(
      'pvp_resource_steal_percent',
      'Attacker victory resource steal percent',
    ),
    target(
      'pvp_attacker_defeat_resource_loss_percent',
      'Defender victory attacker loss percent',
    ),
  ];
  const formulas = targets.map((formulaTarget, index) =>
    formula(`formula-${index + 1}`, `${formulaTarget.key}_formula`),
  );

  return {
    formulas: {
      targets,
      formulas,
      assignments: targets.map((formulaTarget, index) =>
        assignment(`assignment-${index + 1}`, formulaTarget.id, formulas[index].id),
      ),
      entityAssignments: [],
      blocks: [],
    },
    resourceTypes: [
      resourceType('drachma', 'Drachma'),
      resourceType('materials', 'Materials'),
      resourceType('workforce', 'Workforce'),
      resourceType('character_points', 'Character Points'),
    ],
    metadataEntries: [
      metadataEntry(
        'forbidden_consequences',
        'Forbidden consequence metadata',
        'DB forbidden consequence copy.',
      ),
    ],
  };
}

function emptyFormulaData(): FormulaAdminData {
  return {
    targets: [],
    formulas: [],
    assignments: [],
    entityAssignments: [],
    blocks: [],
  };
}

function target(key: string, label: string): FormulaTarget {
  return {
    id: `${key}-id`,
    key,
    scopeKey: 'pvp',
    label,
    description: `${label} DB description.`,
    allowedVariables: ['base_percent', 'victory_modifier'],
    defaultTestContext: {
      base_percent: 10,
      victory_modifier: 1,
    },
    sortOrder: 10,
    createdAt: '2026-05-07T00:00:00.000Z',
  };
}

function formula(id: string, key: string): BalanceFormula {
  return {
    id,
    key,
    scopeKey: 'pvp',
    label: key === 'pvp_resource_steal_percent_formula'
      ? 'resource consequence formula'
      : key,
    expression: 'base_percent * victory_modifier',
    description: 'Formula DB description.',
    isEnabled: true,
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function assignment(
  id: string,
  targetId: string,
  formulaId: string,
): FormulaAssignment {
  return {
    id,
    targetId,
    formulaId,
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function resourceType(key: string, label: string): ResourceTypeReadModel {
  return {
    key,
    label,
    description: `${label} description.`,
    helperText: `${label} helper.`,
    adminDescription: `${label} admin copy.`,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function metadataEntry(
  key: string,
  label: string,
  description: string,
  uiGroupKey: string | null = null,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: 'pvp_resource_transfer_section',
    key,
    label,
    description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function activeServerStub(): Pick<ActiveServer, 'access' | 'selectedServer'> {
  return {
    access: signal<ServerAccessState>({
      userId: 'user-1',
      isAdmin: true,
      isOperator: false,
      isTester: false,
      isModerator: false,
      isMembershipBlocked: false,
      globalRoleKey: GlobalRoleKey.Admin,
      membershipStatus: null,
      membership: null,
      serverStaffRole: null,
      isServerStaff: false,
      isMembershipActive: true,
      isMembershipSuspended: false,
      isMembershipBanned: false,
      canAccessSandbox: false,
      canManageSelectedServer: true,
    }),
    selectedServer: signal<SelectedGameServer>({
      id: 'server-1',
      key: 'server-1',
      name: 'Server One',
      kind: GameServerKind.Standard,
      status: GameServerStatus.Live,
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: null,
      membership: null,
      staffRole: null,
      canManage: true,
      canUseAsSandbox: false,
    }),
  };
}
