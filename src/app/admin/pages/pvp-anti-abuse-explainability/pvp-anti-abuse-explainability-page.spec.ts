import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
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
  PvpAntiAbuseExplainabilityAdmin,
  PvpAntiAbuseExplainabilityAdminData,
} from '../../../core/services/pvp/pvp-anti-abuse-explainability-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpAntiAbuseExplainabilityPage } from './pvp-anti-abuse-explainability-page';

describe('PvpAntiAbuseExplainabilityPage', () => {
  let fixture: ComponentFixture<PvpAntiAbuseExplainabilityPage>;
  let antiAbuse: jasmine.SpyObj<PvpAntiAbuseExplainabilityAdmin>;

  beforeEach(() => {
    antiAbuse = jasmine.createSpyObj<PvpAntiAbuseExplainabilityAdmin>(
      'PvpAntiAbuseExplainabilityAdmin',
      ['getData'],
    );
    antiAbuse.getData.and.returnValue(of(explainabilityData()));

    TestBed.configureTestingModule({
      imports: [PvpAntiAbuseExplainabilityPage],
      providers: [
        provideRouter([]),
        { provide: PvpAntiAbuseExplainabilityAdmin, useValue: antiAbuse },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpAntiAbuseExplainabilityPage);
  });

  it('renders PvP signal dictionary rows as review aids', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(antiAbuse.getData).toHaveBeenCalled();
    expect(text).toContain('same_ip_pvp_attack');
    expect(text).toContain('Shared network PvP attack');
    expect(text).toContain('pvp_feeding_pattern');
    expect(text).toContain('PvP feeding pattern');
    expect(text).toContain('Signals are review aids');
    expect(text).toContain('do not decide sanctions by themselves');
  });

  it('renders mercenary contract as context only, not an allowlist', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('mercenary_contract');
    expect(text).toContain('Mercenary contract');
    expect(text).toContain('context only');
    expect(text).toContain('not an allowlist');
    expect(text).toContain('do not disable anti-abuse review');
    expect(text).not.toContain('declaration-based suppression');
  });

  it('does not render private technical identifiers or raw signal payloads', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('raw signal payloads are not displayed');
    expect(text).not.toContain('192.0.2.10');
    expect(text).not.toContain('device-token-1');
    expect(text).not.toContain('"metadataJson"');
  });

  it('surfaces missing dictionary and metadata rows as configuration gaps', async () => {
    antiAbuse.getData.and.returnValue(of({
      dictionaries: {
        sanctionTypes: [],
        reportTypes: [],
        declarationTypes: [],
        signalTypes: [],
      },
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('dictionary gap');
    expect(text).toContain('same_ip_pvp_attack');
    expect(text).toContain('pvp_feeding_pattern');
    expect(text).toContain('mercenary_contract');
    expect(text).toContain('No active review-aid metadata row.');
    expect(text).toContain('No active declaration-context metadata row.');
  });

  it('surfaces loading errors without stale dictionary rows', async () => {
    antiAbuse.getData.and.returnValue(
      throwError(() => new Error('anti-abuse metadata unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('anti-abuse metadata unavailable');
    expect(text).not.toContain('Shared network PvP attack');
  });
});

function textContent(
  fixture: ComponentFixture<PvpAntiAbuseExplainabilityPage>,
): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function explainabilityData(): PvpAntiAbuseExplainabilityAdminData {
  return {
    dictionaries: {
      sanctionTypes: [],
      reportTypes: [],
      declarationTypes: [
        {
          key: 'mercenary_contract',
          label: 'Mercenary contract',
          description: 'A case-specific payment declaration for staff context.',
          helperText: 'Used as context during review.',
          adminDescription: null,
          category: 'relationship',
          sortOrder: 10,
          isActive: true,
          minParticipants: 2,
          maxParticipants: null,
          requiresAmount: true,
          requiresExpiration: true,
          requiresTradeSelection: false,
          requiresItemSelection: false,
        },
      ],
      signalTypes: [
        {
          key: 'same_ip_pvp_attack',
          label: 'Shared network PvP attack',
          description: 'Dictionary explanation for shared-network PvP review.',
          helperText: null,
          adminDescription: null,
          category: 'pvp',
          sortOrder: 10,
          isActive: true,
          defaultSeverity: 'warning',
          defaultScore: 30,
          defaultConfidence: 70,
        },
        {
          key: 'pvp_feeding_pattern',
          label: 'PvP feeding pattern',
          description: 'Dictionary explanation for repeated one-sided PvP value.',
          helperText: null,
          adminDescription: null,
          category: 'pvp',
          sortOrder: 20,
          isActive: true,
          defaultSeverity: 'warning',
          defaultScore: 40,
          defaultConfidence: 80,
        },
      ],
    },
    metadataEntries: [
      metadataEntry(
        'pvp_review_aids',
        'PvP review aids',
        'Signals guide staff review and require human decision context.',
      ),
      metadataEntry(
        'mercenary_contract_context',
        'Mercenary context',
        'Mercenary declarations provide review context only.',
      ),
    ],
  };
}

function metadataEntry(
  key: string,
  label: string,
  description: string,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: 'pvp_anti_abuse_section',
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
