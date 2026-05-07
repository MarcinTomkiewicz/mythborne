import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  RewardDictionaryReadModel,
  RewardOutcomeKindReadModel,
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
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
  PvpRewardRoutingAdmin,
  PvpRewardRoutingAdminData,
} from '../../../core/services/pvp/pvp-reward-routing-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { PvpRewardRoutingPage } from './pvp-reward-routing-page';

describe('PvpRewardRoutingPage', () => {
  let fixture: ComponentFixture<PvpRewardRoutingPage>;
  let rewardRouting: jasmine.SpyObj<PvpRewardRoutingAdmin>;

  beforeEach(() => {
    rewardRouting = jasmine.createSpyObj<PvpRewardRoutingAdmin>(
      'PvpRewardRoutingAdmin',
      ['getData'],
    );
    rewardRouting.getData.and.returnValue(of(rewardRoutingData()));

    TestBed.configureTestingModule({
      imports: [PvpRewardRoutingPage],
      providers: [
        provideRouter([]),
        { provide: PvpRewardRoutingAdmin, useValue: rewardRouting },
        { provide: ActiveServer, useValue: activeServerStub() },
      ],
    });

    fixture = TestBed.createComponent(PvpRewardRoutingPage);
  });

  it('renders PvP XP reward formula target from formula read data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(rewardRouting.getData).toHaveBeenCalled();
    expect(text).toContain('PvP XP reward');
    expect(text).toContain('pvp_xp_reward');
    expect(text).toContain('XP reward formula');
    expect(text).toContain('base_xp * level_delta_multiplier');
    expect(text).toContain('level_delta_multiplier');
    expect(text).toContain('"base_xp": 50');
  });

  it('renders PvP outcome reward assignments and XP profile entries', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Attacker victory');
    expect(text).toContain('Defender victory');
    expect(text).toContain('Draw');
    expect(text).toContain('PvP XP profile');
    expect(text).toContain('XP entry - Experience (experience)');
    expect(text).toContain('Formula: formula XP reward formula (pvp_xp_reward_formula).');
  });

  it('renders DB PvP outcomes and assignments even when the key is not in the expected checklist', async () => {
    const data = rewardRoutingData();
    rewardRouting.getData.and.returnValue(of({
      ...data,
      outcomeKinds: [
        ...data.outcomeKinds,
        outcomeKind('attacker_won', 'Attacker won DB outcome'),
      ],
      assignments: [
        ...data.assignments,
        assignment('assignment-unexpected-key', 'attacker_won'),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('attacker_won');
    expect(text).toContain('Attacker won DB outcome');
    expect(text).toContain('outcome: attacker_won');
  });

  it('explains CP as derived from XP without presenting standalone PvP CP rewards', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Character Points derive from XP');
    expect(text).toContain('Character Points are not presented as a separate PvP reward route');
    expect(text).toContain('CP derivation metadata');
    expect(text).not.toContain('standalone PvP CP reward');
    expect(text).not.toContain('PvP CP reward profile');
  });

  it('flags standalone CP entries as configuration gaps', async () => {
    const data = rewardRoutingData();
    rewardRouting.getData.and.returnValue(of({
      ...data,
      entries: [
        ...data.entries,
        profileEntry('cp-entry', 'character_points', 'CP entry'),
      ],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('configuration gap: CP entry should not be standalone for PvP');
  });

  it('surfaces missing formula target, assignments and metadata as gaps', async () => {
    rewardRouting.getData.and.returnValue(of({
      ...rewardRoutingData(),
      formulas: emptyFormulaData(),
      assignments: [],
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp_xp_reward');
    expect(text).toContain('no reward assignment');
    expect(text).toContain('metadata gap: CP from XP');
  });

  it('surfaces loading errors without stale reward routing rows', async () => {
    rewardRouting.getData.and.returnValue(
      throwError(() => new Error('pvp reward routing unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('pvp reward routing unavailable');
    expect(text).not.toContain('XP entry - Experience');
  });
});

function textContent(fixture: ComponentFixture<PvpRewardRoutingPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function rewardRoutingData(): PvpRewardRoutingAdminData {
  return {
    formulas: formulaData(),
    outcomeKinds: [
      outcomeKind('attacker_victory', 'Attacker victory'),
      outcomeKind('defender_victory', 'Defender victory'),
      outcomeKind('draw', 'Draw'),
    ],
    profiles: [profile()],
    entries: [profileEntry('xp-entry', 'experience', 'XP entry')],
    assignments: [
      assignment('assignment-1', 'attacker_victory'),
      assignment('assignment-2', 'defender_victory'),
    ],
    entryKinds: [
      dictionary('experience', 'Experience'),
      dictionary('character_points', 'Character Points'),
    ],
    amountModes: [dictionary('formula', 'Formula')],
    resourceTypes: [],
    metadataEntries: [
      metadataEntry(
        'cp_from_xp',
        'CP derivation metadata',
        'DB CP derivation copy.',
      ),
    ],
  };
}

function formulaData(): FormulaAdminData {
  const targetRow = target('pvp_xp_reward', 'PvP XP reward');
  const formulaRow = formula('formula-1', 'pvp_xp_reward_formula');

  return {
    targets: [targetRow],
    formulas: [formulaRow],
    assignments: [formulaAssignment('assignment-formula-1', targetRow.id, formulaRow.id)],
    entityAssignments: [],
    blocks: [],
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
    allowedVariables: ['base_xp', 'level_delta_multiplier'],
    defaultTestContext: {
      base_xp: 50,
      level_delta_multiplier: 1.2,
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
    label: 'XP reward formula',
    expression: 'base_xp * level_delta_multiplier',
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

function outcomeKind(
  key: string,
  label: string,
): RewardOutcomeKindReadModel {
  return {
    sourceKind: 'pvp',
    key,
    label,
    description: `${label} DB description.`,
    helperText: null,
    adminDescription: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function profile(): RewardProfileReadModel {
  return {
    id: 'profile-1',
    key: 'pvp_xp_profile',
    label: 'PvP XP profile',
    category: 'pvp',
    description: 'PvP XP profile description.',
    helperText: null,
    adminDescription: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function profileEntry(
  id: string,
  entryKind: string,
  label: string,
): RewardProfileEntryReadModel {
  return {
    id,
    rewardProfileId: 'profile-1',
    entryKind,
    label,
    description: `${label} description.`,
    helperText: null,
    adminDescription: null,
    amountMode: 'formula',
    minAmount: null,
    maxAmount: null,
    resourceType: null,
    formulaId: 'formula-1',
    chancePercent: 100,
    minItemCount: null,
    maxItemCount: null,
    maxQualityKey: null,
    bucketProfileId: null,
    effectDefinitionId: null,
    transferSourceRole: null,
    transferRecipientRole: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function assignment(
  id: string,
  outcomeKind: string,
): RewardProfileAssignmentReadModel {
  return {
    id,
    rewardProfileId: 'profile-1',
    sourceKind: 'pvp',
    outcomeKind,
    trialDefinitionId: null,
    encounterDefinitionId: null,
    difficultyKey: null,
    difficultyMatchKind: 'any',
    maxDifficultyKey: null,
    districtCode: null,
    districtMatchKind: 'any',
    maxDistrictCode: null,
    levelMatchKind: 'any',
    levelValue: null,
    maxLevelValue: null,
    levelInterval: null,
    levelMatchLabel: 'Any level',
    description: null,
    helperText: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}

function dictionary(
  key: string,
  label: string,
): RewardDictionaryReadModel {
  return {
    key,
    label,
    description: `${label} description.`,
    helperText: null,
    adminDescription: null,
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
