import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REPORT_SECTION_METADATA_NAMESPACE,
  PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
  PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
  PVP_SPY_SECTION_METADATA_NAMESPACE,
  PVP_TARGETING_SECTION_METADATA_NAMESPACE,
  PvpUiMetadataNamespace,
} from '../../../core/constants/pvp-ui-metadata.const';
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
import { PvpUiMetadata } from '../../../core/services/pvp/pvp-ui-metadata';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpOverviewPage } from './pvp-overview-page';

describe('PvpOverviewPage', () => {
  let fixture: ComponentFixture<PvpOverviewPage>;
  let pvpMetadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    pvpMetadata = jasmine.createSpyObj<PvpUiMetadata>(
      'PvpUiMetadata',
      ['getEntries'],
    );
    pvpMetadata.getEntries.and.returnValue(of(metadataEntries()));

    TestBed.configureTestingModule({
      imports: [PvpOverviewPage],
      providers: [
        provideRouter([]),
        { provide: PvpUiMetadata, useValue: pvpMetadata },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpOverviewPage);
  });

  it('renders DB-backed PvP overview sections without action controls', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(pvpMetadata.getEntries).toHaveBeenCalled();
    expect(text).toContain('PvP foundation overview');
    expect(text).toContain('DB-backed PvP metadata header.');
    expect(text).toContain('Action kinds');
    expect(text).toContain('Attack and spy actions');
    expect(text).toContain('Targeting');
    expect(text).toContain('Targeting boundaries');
    expect(text).toContain('Runtime');
    expect(text).toContain('Runtime activity');
    expect(text).toContain('Spy');
    expect(text).toContain('Spy snapshot');
    expect(text).toContain('Resources');
    expect(text).toContain('Resource transfer');
    expect(text).toContain('Rewards');
    expect(text).toContain('XP rewards');
    expect(text).toContain('Reports');
    expect(text).toContain('PvP combat report readiness');
    expect(text).toContain('Anti-abuse');
    expect(text).toContain('Relationship context');
    expect(text).not.toContain('Save');
    expect(text).not.toContain('Create');
    expect(text).not.toContain('Delete');
  });

  it('keeps future systems explicit instead of implying implementation', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Future siege, guild and Prestige systems');
    expect(text).not.toContain('Siege implemented');
    expect(text).not.toContain('Guild implemented');
    expect(text).not.toContain('Prestige implemented');
  });

  it('surfaces metadata loading errors instead of showing stale overview rows', async () => {
    pvpMetadata.getEntries.and.returnValue(
      throwError(() => new Error('metadata RPC unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('metadata RPC unavailable');
    expect(text).not.toContain('Action kinds');
  });
});

function textContent(fixture: ComponentFixture<PvpOverviewPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function metadataEntries(): UiMetadataEntryReadModel[] {
  return [
    metadataEntry(
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      'overview',
      'PvP foundation overview',
      'DB-backed PvP metadata header.',
    ),
    metadataEntry(
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      'action_kinds',
      'Attack and spy actions',
      'Attack and spy are active; siege stays future/inactive.',
    ),
    metadataEntry(
      PVP_TARGETING_SECTION_METADATA_NAMESPACE,
      'overview',
      'Targeting boundaries',
      'Estate-vicinity targeting and protection metadata.',
    ),
    metadataEntry(
      PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
      'overview',
      'Runtime activity',
      'Central runtime activity covers PvP attack and spy travel.',
    ),
    metadataEntry(
      PVP_SPY_SECTION_METADATA_NAMESPACE,
      'overview',
      'Spy snapshot',
      'Owner-safe spy result snapshots.',
    ),
    metadataEntry(
      PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
      'overview',
      'Resource transfer',
      'PvP resource consequences use DB-owned transfer rules.',
    ),
    metadataEntry(
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
      'overview',
      'XP rewards',
      'PvP reward context uses DB-owned XP reward routing.',
    ),
    metadataEntry(
      PVP_REPORT_SECTION_METADATA_NAMESPACE,
      'overview',
      'PvP combat report readiness',
      'Reports use existing report content boundaries.',
    ),
    metadataEntry(
      PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
      'overview',
      'Relationship context',
      'Anti-abuse relationship context is review metadata only.',
    ),
  ];
}

function metadataEntry(
  namespace: PvpUiMetadataNamespace,
  key: string,
  label: string,
  description: string,
): UiMetadataEntryReadModel {
  return {
    id: `${namespace}-${key}`,
    namespace,
    key,
    label,
    description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: key === 'overview' ? 10 : 20,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-07T10:00:00.000Z',
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
