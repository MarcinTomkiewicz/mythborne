import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
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
import { PvpTravelTimingAdmin } from '../../../core/services/pvp/pvp-travel-timing-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpTravelTimingPage } from './pvp-travel-timing-page';

describe('PvpTravelTimingPage', () => {
  let fixture: ComponentFixture<PvpTravelTimingPage>;
  let travelTiming: jasmine.SpyObj<PvpTravelTimingAdmin>;

  beforeEach(() => {
    travelTiming = jasmine.createSpyObj<PvpTravelTimingAdmin>(
      'PvpTravelTimingAdmin',
      ['getData'],
    );
    travelTiming.getData.and.returnValue(of(timingData()));

    TestBed.configureTestingModule({
      imports: [PvpTravelTimingPage],
      providers: [
        provideRouter([]),
        { provide: PvpTravelTimingAdmin, useValue: travelTiming },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpTravelTimingPage);
  });

  it('renders travel and manual window formula targets from formula read data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(travelTiming.getData).toHaveBeenCalled();
    expect(text).toContain('Attack travel seconds');
    expect(text).toContain('pvp_attack_travel_time_seconds');
    expect(text).toContain('Spy travel seconds');
    expect(text).toContain('pvp_spy_travel_time_seconds');
    expect(text).toContain('Manual fight window seconds');
    expect(text).toContain('pvp_manual_fight_window_seconds');
    expect(text).toContain('timing formula');
    expect(text).toContain('distance_score * db_seconds');
    expect(text).toContain('distance_score');
    expect(text).toContain('"db_seconds": 60');
  });

  it('makes the seconds unit visible for every timing row', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text.match(/Expected unit/g)?.length).toBe(3);
    expect(text.match(/seconds/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
  });

  it('surfaces missing timing formula targets', async () => {
    travelTiming.getData.and.returnValue(of({
      targets: [
        target('pvp_attack_travel_time_seconds', 'Attack travel seconds'),
      ],
      formulas: [],
      assignments: [],
      entityAssignments: [],
      blocks: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp_spy_travel_time_seconds');
    expect(text).toContain('pvp_manual_fight_window_seconds');
  });

  it('surfaces loading errors without stale timing rows', async () => {
    travelTiming.getData.and.returnValue(
      throwError(() => new Error('timing read unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('timing read unavailable');
    expect(text).not.toContain('Attack travel seconds');
  });
});

function textContent(fixture: ComponentFixture<PvpTravelTimingPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function timingData(): FormulaAdminData {
  const targets = [
    target('pvp_attack_travel_time_seconds', 'Attack travel seconds'),
    target('pvp_spy_travel_time_seconds', 'Spy travel seconds'),
    target('pvp_manual_fight_window_seconds', 'Manual fight window seconds'),
  ];
  const formulas = targets.map((formulaTarget, index) =>
    formula(`formula-${index + 1}`, `${formulaTarget.key}_formula`),
  );

  return {
    targets,
    formulas,
    assignments: targets.map((formulaTarget, index) =>
      assignment(`assignment-${index + 1}`, formulaTarget.id, formulas[index].id),
    ),
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
    allowedVariables: ['distance_score', 'db_seconds'],
    defaultTestContext: {
      distance_score: 12,
      db_seconds: 60,
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
    label: key === 'pvp_attack_travel_time_seconds_formula'
      ? 'timing formula'
      : key,
    expression: 'distance_score * db_seconds',
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
