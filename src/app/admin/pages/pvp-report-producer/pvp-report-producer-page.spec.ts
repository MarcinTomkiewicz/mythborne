import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { GameReportTypeEntry } from '../../../core/domain/reports/game-report.model';
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
  PvpReportProducerAdmin,
  PvpReportProducerAdminData,
} from '../../../core/services/pvp/pvp-report-producer-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpReportProducerPage } from './pvp-report-producer-page';

describe('PvpReportProducerPage', () => {
  let fixture: ComponentFixture<PvpReportProducerPage>;
  let reportProducer: jasmine.SpyObj<PvpReportProducerAdmin>;

  beforeEach(() => {
    reportProducer = jasmine.createSpyObj<PvpReportProducerAdmin>(
      'PvpReportProducerAdmin',
      ['getData'],
    );
    reportProducer.getData.and.returnValue(of(reportProducerData()));

    TestBed.configureTestingModule({
      imports: [PvpReportProducerPage],
      providers: [
        provideRouter([]),
        { provide: PvpReportProducerAdmin, useValue: reportProducer },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpReportProducerPage);
  });

  it('renders PvP combat report type from the report type dictionary', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(reportProducer.getData).toHaveBeenCalled();
    expect(text).toContain('pvp_combat');
    expect(text).toContain('PvP combat');
    expect(text).toContain('DB PvP combat report type.');
    expect(text).toContain('active report type');
  });

  it('explains the PvP report wrapper and linked combat section boundary', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('source entity type');
    expect(text).toContain('pvp_result');
    expect(text).toContain('combat source: pvp');
    expect(text).toContain('linked combat result snapshot');
    expect(text).toContain('not duplicated into report tables');
    expect(text).not.toContain('combat_result_attacks duplicated');
  });

  it('renders PvP report metadata through explicit metadata rows', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp_report_producer');
    expect(text).toContain('DB copy for PvP report wrapping.');
    expect(text).toContain('pvp_report_combat_section');
    expect(text).toContain('DB copy for linked combat sections.');
    expect(text).not.toContain('No active PvP report producer metadata row.');
    expect(text).not.toContain('No active combat-section metadata row.');
  });

  it('surfaces missing report type and metadata rows as gaps', async () => {
    reportProducer.getData.and.returnValue(of({
      reportTypes: [reportType('combat', 'Combat')],
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('dictionary gap');
    expect(text).toContain('pvp_combat');
    expect(text).toContain('No active PvP report producer metadata row.');
    expect(text).toContain('No active combat-section metadata row.');
  });

  it('surfaces loading errors without stale report rows', async () => {
    reportProducer.getData.and.returnValue(
      throwError(() => new Error('report producer unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('report producer unavailable');
    expect(text).not.toContain('DB PvP combat report type.');
  });
});

function textContent(fixture: ComponentFixture<PvpReportProducerPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function reportProducerData(): PvpReportProducerAdminData {
  return {
    reportTypes: [
      reportType('pvp_combat', 'PvP combat'),
      reportType('combat', 'Combat'),
    ],
    metadataEntries: [
      metadataEntry(
        'pvp_report_producer',
        'PvP report producer metadata',
        'DB copy for PvP report wrapping.',
      ),
      metadataEntry(
        'pvp_report_combat_section',
        'Combat section metadata',
        'DB copy for linked combat sections.',
      ),
    ],
  };
}

function reportType(key: string, label: string): GameReportTypeEntry {
  return {
    key,
    label,
    description: key === 'pvp_combat'
      ? 'DB PvP combat report type.'
      : 'DB combat report type.',
    helperText: 'DB report type helper.',
    sortOrder: 10,
    isActive: true,
  };
}

function metadataEntry(
  key: string,
  label: string,
  description: string,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: 'pvp_report_section',
    key,
    label,
    description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
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
