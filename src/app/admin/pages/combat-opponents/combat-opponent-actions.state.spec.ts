import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { CombatOpponentAdminData } from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentEquipmentActionsState } from './combat-opponent-equipment-actions.state';
import { CombatOpponentStatActionsState } from './combat-opponent-stat-actions.state';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

describe('combat opponent action states', () => {
  let page: jasmine.SpyObj<CombatOpponentsPageState> & {
    data: ReturnType<typeof signal<CombatOpponentAdminData | null>>;
    selectedOpponentId: ReturnType<typeof signal<string | null>>;
  };
  let admin: jasmine.SpyObj<CombatOpponentAdmin>;

  beforeEach(() => {
    page = jasmine.createSpyObj<CombatOpponentsPageState>(
      'CombatOpponentsPageState',
      ['loadInitialData', 'setError'],
      {
        data: signal<CombatOpponentAdminData | null>(adminData()),
        selectedOpponentId: signal<string | null>('opponent-1'),
      },
    ) as typeof page;
    admin = jasmine.createSpyObj<CombatOpponentAdmin>(
      'CombatOpponentAdmin',
      ['saveStatValue', 'deleteStatValue', 'saveEquipmentEntry', 'deactivateEquipmentEntry'],
    );
    admin.saveStatValue.and.returnValue(of({
      id: 'stat-value',
      opponentDefinitionId: 'opponent-1',
      statKey: 'strength',
      baseValue: 1,
      sortOrder: 10,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }));
    admin.saveEquipmentEntry.and.returnValue(of({
      id: 'equipment-1',
      opponentDefinitionId: 'opponent-1',
      slotKey: 'main_hand',
      entryMode: 'manual',
      manualBaseId: null,
      manualQualityKey: null,
      manualPrefixAffixId: null,
      manualSuffixAffixId: null,
      generatedBucketProfileId: null,
      generatedMaxQualityKey: null,
      minOpponentLevel: null,
      maxOpponentLevel: null,
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }));

    TestBed.configureTestingModule({
      providers: [
        CombatOpponentStatActionsState,
        CombatOpponentEquipmentActionsState,
        { provide: CombatOpponentsPageState, useValue: page },
        { provide: CombatOpponentAdmin, useValue: admin },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj<ToastService>('ToastService', ['show']),
        },
      ],
    });
  });

  it('saves different stat grid rows without reusing another statValueId', () => {
    const actions = TestBed.inject(CombatOpponentStatActionsState);
    actions.reason.setValue('Balance update.');

    actions.save({
      statKey: 'dexterity',
      statLabel: 'Dexterity (dexterity)',
      statDescription: null,
      statValueId: null,
      baseValue: 0,
      sortOrder: 20,
      isConfigured: false,
    }, 8);
    actions.save({
      statKey: 'strength',
      statLabel: 'Strength (strength)',
      statDescription: null,
      statValueId: 'strength-row',
      baseValue: 12,
      sortOrder: 10,
      isConfigured: true,
    }, 12);

    expect(admin.saveStatValue.calls.allArgs().map(([input]) => input)).toEqual([
      jasmine.objectContaining({
        statValueId: null,
        statKey: 'dexterity',
        baseValue: 8,
      }),
      jasmine.objectContaining({
        statValueId: 'strength-row',
        statKey: 'strength',
        baseValue: 12,
      }),
    ]);
  });

  it('bulk saves existing and missing stat baselines with row-specific statValueIds', () => {
    const actions = TestBed.inject(CombatOpponentStatActionsState);
    const rows = [
      {
        statKey: 'strength',
        statLabel: 'Strength (strength)',
        statDescription: null,
        statValueId: 'strength-row',
        baseValue: 12,
        sortOrder: 10,
        isConfigured: true,
      },
      {
        statKey: 'dexterity',
        statLabel: 'Dexterity (dexterity)',
        statDescription: null,
        statValueId: null,
        baseValue: 0,
        sortOrder: 20,
        isConfigured: false,
      },
    ];

    actions.reason.setValue('Balance update.');
    actions.syncRows(rows);
    actions.setStatDraftValue('strength', '14');
    actions.setStatDraftValue('dexterity', '8');
    actions.saveAll(rows);

    expect(admin.saveStatValue.calls.allArgs().map(([input]) => input)).toEqual([
      jasmine.objectContaining({
        statValueId: 'strength-row',
        statKey: 'strength',
        baseValue: 14,
        reason: 'Balance update.',
      }),
      jasmine.objectContaining({
        statValueId: null,
        statKey: 'dexterity',
        baseValue: 8,
        reason: 'Balance update.',
      }),
    ]);
    expect(page.loadInitialData).toHaveBeenCalled();
  });

  it('blocks equipment save when active slot options are missing', () => {
    page.data.set({ ...adminData(), equipmentSlots: [] });
    const actions = TestBed.inject(CombatOpponentEquipmentActionsState);

    actions.form.controls.reason.setValue('Balance update.');
    actions.save();

    expect(admin.saveEquipmentEntry).not.toHaveBeenCalled();
    expect(page.setError).toHaveBeenCalledWith(actions.configurationGapMessage);
  });
});

function adminData(): CombatOpponentAdminData {
  return {
    families: [],
    opponents: [],
    statValues: [],
    attackSources: [],
    equipmentEntries: [],
    equipmentModes: [],
    equipmentSlots: [
      {
        key: 'main_hand',
        label: 'Main hand',
        description: 'Main weapon.',
        helperText: null,
        adminDescription: null,
        equipmentArea: 'weapon',
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    stats: [],
    dictionaries: {
      sourceTypes: [],
      sides: [],
      outcomes: [],
      participantKinds: [],
      attackSourceKinds: [],
      candidateKinds: [],
    },
    opponentViews: [],
    emptyState: null,
  };
}
