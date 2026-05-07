import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
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
  PvpTargetingAdmin,
  PvpTargetingAdminData,
} from '../../../core/services/pvp/pvp-targeting-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpTargetingPage } from './pvp-targeting-page';

describe('PvpTargetingPage', () => {
  let fixture: ComponentFixture<PvpTargetingPage>;
  let targeting: jasmine.SpyObj<PvpTargetingAdmin>;

  beforeEach(() => {
    targeting = jasmine.createSpyObj<PvpTargetingAdmin>('PvpTargetingAdmin', [
      'getData',
    ]);
    targeting.getData.and.returnValue(of(targetingData()));

    TestBed.configureTestingModule({
      imports: [PvpTargetingPage],
      providers: [
        provideRouter([]),
        { provide: PvpTargetingAdmin, useValue: targeting },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpTargetingPage);
  });

  it('renders PvP targeting formula targets from formula read data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(targeting.getData).toHaveBeenCalled();
    expect(text).toContain('Minimum target level');
    expect(text).toContain('pvp_attack_min_target_level');
    expect(text).toContain('min target formula');
    expect(text).toContain('attacker_level - db_window');
    expect(text).toContain('db_window');
    expect(text).toContain('"db_window": 3');
    expect(text).toContain('Maximum target level');
    expect(text).toContain('Attack travel seconds');
    expect(text).toContain('pvp_attack_travel_time_seconds');
    expect(text).toContain('Spy travel seconds');
    expect(text).toContain('pvp_spy_travel_time_seconds');
    expect(text).toContain('Manual fight window seconds');
    expect(text).toContain('pvp_manual_fight_window_seconds');
    expect(text).toContain('Protection seconds');
  });

  it('renders targeting protection and incoming attack explanations from metadata rows', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Protection metadata');
    expect(text).toContain('DB protection copy.');
    expect(text).toContain('Incoming attack metadata');
    expect(text).toContain('DB one incoming attack copy.');
    expect(text).not.toContain('metadata gap: protection');
    expect(text).not.toContain('metadata gap: incoming attack');
  });

  it('surfaces missing formula targets and metadata as gaps', async () => {
    targeting.getData.and.returnValue(of({
      formulas: {
        targets: [target('pvp_attack_min_target_level', 'Minimum target level')],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      },
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp_attack_max_target_level');
    expect(text).toContain('pvp_attack_travel_time_seconds');
    expect(text).toContain('pvp_spy_travel_time_seconds');
    expect(text).toContain('pvp_manual_fight_window_seconds');
    expect(text).toContain('pvp_target_protection_seconds');
    expect(text).toContain('metadata gap: protection');
    expect(text).toContain('metadata gap: incoming attack');
  });

  it('does not match targeting metadata by description text alone', async () => {
    targeting.getData.and.returnValue(of({
      formulas: {
        targets: [],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      },
      metadataEntries: [
        metadataEntry(
          'unrelated_copy',
          'Unrelated metadata',
          'This text mentions target protection and one incoming attack.',
        ),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('metadata gap: protection');
    expect(text).toContain('metadata gap: incoming attack');
    expect(text).not.toContain('Unrelated metadata');
  });

  it('matches targeting metadata by explicit group key when present', async () => {
    targeting.getData.and.returnValue(of({
      formulas: {
        targets: [],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      },
      metadataEntries: [
        metadataEntry(
          'custom_protection_copy',
          'Grouped protection',
          'DB protection group copy.',
          'target_protection',
        ),
        metadataEntry(
          'custom_incoming_copy',
          'Grouped incoming attack',
          'DB incoming group copy.',
          'one_incoming_attack',
        ),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Grouped protection');
    expect(text).toContain('Grouped incoming attack');
    expect(text).not.toContain('metadata gap: protection');
    expect(text).not.toContain('metadata gap: incoming attack');
  });

  it('matches targeting metadata from configurator namespace', async () => {
    targeting.getData.and.returnValue(of({
      formulas: {
        targets: [],
        formulas: [],
        assignments: [],
        entityAssignments: [],
        blocks: [],
      },
      metadataEntries: [
        metadataEntry(
          'target_protection',
          'Configurator protection',
          'DB protection configurator copy.',
          null,
          'pvp_configurator_section',
        ),
        metadataEntry(
          'one_incoming_attack',
          'Configurator incoming attack',
          'DB incoming configurator copy.',
          null,
          'pvp_configurator_section',
        ),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Configurator protection');
    expect(text).toContain('Configurator incoming attack');
    expect(text).not.toContain('metadata gap: protection');
    expect(text).not.toContain('metadata gap: incoming attack');
  });

  it('surfaces loading errors without stale targeting rows', async () => {
    targeting.getData.and.returnValue(
      throwError(() => new Error('targeting read unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('targeting read unavailable');
    expect(text).not.toContain('Minimum target level');
  });
});

function textContent(fixture: ComponentFixture<PvpTargetingPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function targetingData(): PvpTargetingAdminData {
  const targets = [
    target('pvp_attack_min_target_level', 'Minimum target level'),
    target('pvp_attack_max_target_level', 'Maximum target level'),
    target('pvp_attack_travel_time_seconds', 'Attack travel seconds'),
    target('pvp_spy_travel_time_seconds', 'Spy travel seconds'),
    target('pvp_manual_fight_window_seconds', 'Manual fight window seconds'),
    target('pvp_target_protection_seconds', 'Protection seconds'),
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
    metadataEntries: [
      metadataEntry(
        'target_protection',
        'Protection metadata',
        'DB protection copy.',
      ),
      metadataEntry(
        'one_incoming_attack',
        'Incoming attack metadata',
        'DB one incoming attack copy.',
      ),
    ],
  };
}

function target(key: string, label: string): FormulaTarget {
  return {
    id: `${key}-id`,
    key,
    scopeKey: 'pvp',
    label,
    description: `${label} DB description.`,
    allowedVariables: ['attacker_level', 'db_window'],
    defaultTestContext: {
      attacker_level: 10,
      db_window: 3,
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
    label: key === 'pvp_attack_min_target_level_formula'
      ? 'min target formula'
      : key,
    expression: 'attacker_level - db_window',
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

function metadataEntry(
  key: string,
  label: string,
  description: string,
  uiGroupKey: string | null = null,
  namespace = 'pvp_targeting_section',
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace,
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
