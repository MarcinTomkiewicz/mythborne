import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
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
  PvpFoundationDiagnostic,
  PvpFoundationDiagnosticAdmin,
} from '../../../core/services/pvp/pvp-foundation-diagnostic-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpFoundationDiagnosticPage } from './pvp-foundation-diagnostic-page';

describe('PvpFoundationDiagnosticPage', () => {
  let fixture: ComponentFixture<PvpFoundationDiagnosticPage>;
  let diagnostics: jasmine.SpyObj<PvpFoundationDiagnosticAdmin>;

  beforeEach(() => {
    diagnostics = jasmine.createSpyObj<PvpFoundationDiagnosticAdmin>(
      'PvpFoundationDiagnosticAdmin',
      ['getDiagnostic'],
    );
    diagnostics.getDiagnostic.and.returnValue(of(diagnosticData()));

    TestBed.configureTestingModule({
      imports: [PvpFoundationDiagnosticPage],
      providers: [
        provideRouter([]),
        { provide: PvpFoundationDiagnosticAdmin, useValue: diagnostics },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpFoundationDiagnosticPage);
  });

  it('loads diagnostics for the selected server through the admin service', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(diagnostics.getDiagnostic).toHaveBeenCalledWith('server-1');
    expect(textContent(fixture)).toContain('PvP foundation diagnostic');
  });

  it('renders structural status, formula status and missing objects', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Structural status');
    expect(text).toContain('ok');
    expect(text).toContain('Formula status');
    expect(text).toContain('formula_warning');
    expect(text).toContain('missing_function');
    expect(text).toContain('missing_trigger');
  });

  it('renders incoming notification count and positive smoke prerequisites', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Incoming notifications');
    expect(text).toContain('2');
    expect(text).toContain('second hero with estate');
    expect(text).toContain('does not create heroes, estates, actions, reports, notifications or combat results');
  });

  it('surfaces missing diagnostic detail as backend read-model dependency', async () => {
    diagnostics.getDiagnostic.and.returnValue(of({
      structuralStatus: null,
      formulaStatus: null,
      missingFunctions: [],
      missingTriggers: [],
      incomingNotificationCount: null,
      positiveSmokePrerequisites: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('not returned');
    expect(text).toContain('N/D');
    expect(text).toContain('Some status fields were not returned');
    expect(text).toContain('No positive-smoke prerequisites were returned.');
  });

  it('shows backend/admin dependency if the diagnostic RPC is not accessible', async () => {
    diagnostics.getDiagnostic.and.returnValue(
      throwError(() => new Error('permission denied for function')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('permission denied for function');
    expect(text).toContain('approved admin RPC boundary');
    expect(text).not.toContain('missing_function');
  });
});

function textContent(
  fixture: ComponentFixture<PvpFoundationDiagnosticPage>,
): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function diagnosticData(): PvpFoundationDiagnostic {
  return {
    structuralStatus: 'ok',
    formulaStatus: 'formula_warning',
    missingFunctions: ['missing_function'],
    missingTriggers: ['missing_trigger'],
    incomingNotificationCount: 2,
    positiveSmokePrerequisites: ['second hero with estate'],
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
