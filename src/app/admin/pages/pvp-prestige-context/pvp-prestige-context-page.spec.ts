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
  PvpPrestigeContextAdmin,
  PvpPrestigeContextAdminData,
} from '../../../core/services/pvp/pvp-prestige-context-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpPrestigeContextPage } from './pvp-prestige-context-page';

describe('PvpPrestigeContextPage', () => {
  let fixture: ComponentFixture<PvpPrestigeContextPage>;
  let prestigeContext: jasmine.SpyObj<PvpPrestigeContextAdmin>;

  beforeEach(() => {
    prestigeContext = jasmine.createSpyObj<PvpPrestigeContextAdmin>(
      'PvpPrestigeContextAdmin',
      ['getData'],
    );
    prestigeContext.getData.and.returnValue(of(prestigeData()));

    TestBed.configureTestingModule({
      imports: [PvpPrestigeContextPage],
      providers: [
        provideRouter([]),
        { provide: PvpPrestigeContextAdmin, useValue: prestigeContext },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpPrestigeContextPage);
  });

  it('renders the future Prestige context formula target from formula read data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(prestigeContext.getData).toHaveBeenCalled();
    expect(text).toContain('pvp_prestige_delta_context');
    expect(text).toContain('PvP Prestige delta context');
    expect(text).toContain('Prestige context formula');
    expect(text).toContain('opponentLevelDelta * outcomeMultiplier');
    expect(text).toContain('recipientLevel');
    expect(text).toContain('"opponentLevelDelta": 2');
  });

  it('renders the expected future Prestige context fields', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('recipientLevel');
    expect(text).toContain('Default value: 10');
    expect(text).toContain('opponentLevel');
    expect(text).toContain('Default value: 12');
    expect(text).toContain('opponentLevelDelta');
    expect(text).toContain('Default value: 2');
    expect(text).toContain('outcomeMultiplier');
    expect(text).toContain('Default value: 1.5');
    expect(text).not.toContain('missing variable');
  });

  it('keeps Prestige explicitly future-only', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Prestige context, not Prestige points');
    expect(text).toContain('future Prestige context metadata');
    expect(text).toContain('does not expose current Prestige points, ranks, scoring');
    expect(text).not.toContain('Prestige points implemented');
    expect(text).not.toContain('current Prestige rank');
  });

  it('surfaces missing formula target, fields and metadata as gaps', async () => {
    prestigeContext.getData.and.returnValue(of({
      formulas: {
        targets: [
          target(
            'pvp_prestige_delta_context',
            'PvP Prestige delta context',
            ['recipientLevel'],
            { recipientLevel: 10 },
          ),
        ],
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

    expect(text).toContain('metadata gap: future Prestige context');
    expect(text).toContain('opponentLevel');
    expect(text).toContain('opponentLevelDelta');
    expect(text).toContain('outcomeMultiplier');
    expect(text).toContain('missing variable');
  });

  it('surfaces loading errors without stale Prestige context rows', async () => {
    prestigeContext.getData.and.returnValue(
      throwError(() => new Error('prestige context unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('prestige context unavailable');
    expect(text).not.toContain('Prestige context formula');
  });
});

function textContent(fixture: ComponentFixture<PvpPrestigeContextPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function prestigeData(): PvpPrestigeContextAdminData {
  const targetRow = target(
    'pvp_prestige_delta_context',
    'PvP Prestige delta context',
    [
      'recipientLevel',
      'opponentLevel',
      'opponentLevelDelta',
      'outcomeMultiplier',
    ],
    {
      recipientLevel: 10,
      opponentLevel: 12,
      opponentLevelDelta: 2,
      outcomeMultiplier: 1.5,
    },
  );
  const formulaRow = formula('formula-1', 'pvp_prestige_delta_context_formula');

  return {
    formulas: {
      targets: [targetRow],
      formulas: [formulaRow],
      assignments: [
        formulaAssignment('assignment-1', targetRow.id, formulaRow.id),
      ],
      entityAssignments: [],
      blocks: [],
    },
    metadataEntries: [
      metadataEntry(
        'future_prestige_context',
        'future Prestige context metadata',
        'DB future Prestige context copy.',
      ),
    ],
  };
}

function target(
  key: string,
  label: string,
  allowedVariables: string[],
  defaultTestContext: Record<string, number>,
): FormulaTarget {
  return {
    id: `${key}-id`,
    key,
    scopeKey: 'pvp',
    label,
    description: `${label} DB description.`,
    allowedVariables,
    defaultTestContext,
    sortOrder: 10,
    createdAt: '2026-05-07T00:00:00.000Z',
  };
}

function formula(id: string, key: string): BalanceFormula {
  return {
    id,
    key,
    scopeKey: 'pvp',
    label: 'Prestige context formula',
    expression: 'opponentLevelDelta * outcomeMultiplier',
    description: 'Formula DB description.',
    isEnabled: true,
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function formulaAssignment(
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
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: 'pvp_reward_section',
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
