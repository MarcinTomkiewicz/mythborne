import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  PvpActionKindEntry,
  PvpActionStatusEntry,
} from '../../../core/domain/pvp/pvp.model';
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
  PvpActionLifecycleAdmin,
  PvpActionLifecycleAdminData,
} from '../../../core/services/pvp/pvp-action-lifecycle-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpActionLifecyclePage } from './pvp-action-lifecycle-page';

describe('PvpActionLifecyclePage', () => {
  let fixture: ComponentFixture<PvpActionLifecyclePage>;
  let lifecycle: jasmine.SpyObj<PvpActionLifecycleAdmin>;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj<PvpActionLifecycleAdmin>(
      'PvpActionLifecycleAdmin',
      ['getData'],
    );
    lifecycle.getData.and.returnValue(of(lifecycleData()));

    TestBed.configureTestingModule({
      imports: [PvpActionLifecyclePage],
      providers: [
        provideRouter([]),
        { provide: PvpActionLifecycleAdmin, useValue: lifecycle },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpActionLifecyclePage);
  });

  it('renders DB-backed action kinds and lifecycle statuses without write controls', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(lifecycle.getData).toHaveBeenCalled();
    expect(text).toContain('PvP action lifecycle');
    expect(text).toContain('Attack');
    expect(text).toContain('attack');
    expect(text).toContain('Spy');
    expect(text).toContain('spy');
    expect(text).toContain('Travelling');
    expect(text).toContain('blocking');
    expect(text).toContain('Resolved');
    expect(text).toContain('terminal');
    expect(text).not.toContain('Save');
    expect(text).not.toContain('Create');
    expect(text).not.toContain('Delete');
  });

  it('shows siege as future inactive instead of implemented gameplay', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Siege');
    expect(text).toContain('future/inactive');
    expect(text).not.toContain('Siege implemented');
  });

  it('surfaces lifecycle loading errors', async () => {
    lifecycle.getData.and.returnValue(
      throwError(() => new Error('pvp lifecycle unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp lifecycle unavailable');
    expect(text).not.toContain('Attack');
  });
});

function textContent(fixture: ComponentFixture<PvpActionLifecyclePage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function lifecycleData(): PvpActionLifecycleAdminData {
  return {
    actionKinds: [
      actionKind({ key: 'attack', label: 'Attack', createsCombat: true }),
      actionKind({
        key: 'spy',
        label: 'Spy',
        createsCombat: false,
        createsSpyResult: true,
      }),
      actionKind({
        key: 'siege',
        label: 'Siege',
        description: 'Future siege action.',
        isActive: false,
      }),
    ],
    actionStatuses: [
      actionStatus({
        key: 'travelling',
        label: 'Travelling',
        isBlocking: true,
        isTerminal: false,
      }),
      actionStatus({
        key: 'resolved',
        label: 'Resolved',
        isBlocking: false,
        isTerminal: true,
      }),
    ],
  };
}

function actionKind(
  overrides: Partial<PvpActionKindEntry> = {},
): PvpActionKindEntry {
  return {
    key: 'attack',
    label: 'Attack',
    description: 'Attack another hero.',
    helperText: 'Travel to target.',
    adminDescription: 'DB-owned action kind.',
    sortOrder: 10,
    isActive: true,
    createsCombat: true,
    createsRuntimeActivity: true,
    createsSpyResult: false,
    isTravelAction: true,
    ...overrides,
  };
}

function actionStatus(
  overrides: Partial<PvpActionStatusEntry> = {},
): PvpActionStatusEntry {
  return {
    key: 'travelling',
    label: 'Travelling',
    description: 'Action is travelling.',
    helperText: null,
    adminDescription: 'DB-owned status.',
    sortOrder: 10,
    isActive: true,
    isBlocking: true,
    isTerminal: false,
    ...overrides,
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
