import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationEncounterCandidateActionsState } from './exploration-encounter-candidate-actions.state';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterRewardActionsState } from './exploration-encounter-reward-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

describe('ExplorationEncountersPageState', () => {
  let admin: jasmine.SpyObj<ExplorationEncounterAdmin>;
  let toast: jasmine.SpyObj<ToastService>;
  let state: ExplorationEncountersPageState;
  let definitionActions: ExplorationEncounterDefinitionActionsState;
  let candidateActions: ExplorationEncounterCandidateActionsState;
  let rewardActions: ExplorationEncounterRewardActionsState;

  beforeEach(() => {
    admin = jasmine.createSpyObj<ExplorationEncounterAdmin>('ExplorationEncounterAdmin', [
      'getAdminData',
      'upsertEncounterDefinition',
      'deactivateEncounterDefinition',
      'upsertEncounterCombatCandidate',
      'deactivateEncounterCombatCandidate',
      'upsertRewardProfileAssignment',
      'deactivateRewardProfileAssignment',
    ]);
    admin.getAdminData.and.returnValue(of(adminData()));
    admin.upsertEncounterDefinition.and.returnValue(of(adminData().encounters[0]));
    admin.deactivateEncounterDefinition.and.returnValue(of({
      ...adminData().encounters[0],
      isActive: false,
    }));
    admin.upsertEncounterCombatCandidate.and.returnValue(of(adminData().combatCandidates[0]));
    admin.deactivateEncounterCombatCandidate.and.returnValue(of({
      ...adminData().combatCandidates[0],
      isActive: false,
    }));
    admin.upsertRewardProfileAssignment.and.returnValue(of(adminData().rewardAssignments[0]));
    admin.deactivateRewardProfileAssignment.and.returnValue(of({
      ...adminData().rewardAssignments[0],
      isActive: false,
    }));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        ExplorationEncountersPageState,
        ExplorationEncounterDefinitionActionsState,
        ExplorationEncounterCandidateActionsState,
        ExplorationEncounterRewardActionsState,
        { provide: ExplorationEncounterAdmin, useValue: admin },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ExplorationEncountersPageState);
    definitionActions = TestBed.inject(ExplorationEncounterDefinitionActionsState);
    candidateActions = TestBed.inject(ExplorationEncounterCandidateActionsState);
    rewardActions = TestBed.inject(ExplorationEncounterRewardActionsState);
  });

  it('loads encounter definitions and readable DB-backed labels', () => {
    state.loadInitialData();

    expect(state.encounterOptions()[0].label).toBe('Bandit ambush (bandit-ambush)');
    expect(state.selectedEncounter()?.minigameLabel).toBe('Combat (combat)');
    expect(state.selectedEncounter()?.difficultyRangeLabel).toBe('Easy+');
    expect(state.combatCandidates()[0].targetLabel).toBe('Bandit (bandit)');
    expect(state.rewardAssignments()[0].rewardProfileLabel).toBe('Encounter reward (encounter-reward)');
  });

  it('generates keys from labels for new encounters and keeps existing keys stable', () => {
    state.loadInitialData();

    definitionActions.startNewEncounter();
    definitionActions.encounterForm.controls.label.setValue('Zasadzka w Starym Miescie!');

    expect(definitionActions.encounterForm.controls.key.value).toBe('zasadzka-w-starym-miescie');

    state.selectEncounter('encounter-1');
    TestBed.flushEffects();
    definitionActions.encounterForm.controls.label.setValue('Renamed ambush');

    expect(definitionActions.encounterForm.controls.key.value).toBe('bandit-ambush');
  });

  it('saves encounter definitions through the admin RPC service with a reason', () => {
    state.loadInitialData();
    definitionActions.encounterForm.patchValue({
      encounterDefinitionId: 'encounter-1',
      key: 'bandit-ambush',
      label: 'Updated ambush',
      description: 'Updated.',
      encounterKind: 'combat',
      minigameKey: 'combat',
      reason: 'Tune encounter.',
    });

    definitionActions.saveEncounter();

    expect(admin.upsertEncounterDefinition).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        encounterDefinitionId: 'encounter-1',
        label: 'Updated ambush',
        encounterKind: 'combat',
        minigameKey: 'combat',
        reason: 'Tune encounter.',
      }),
    );
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Exploration encounters',
      'Encounter definition saved.',
    );
  });

  it('blocks combat candidates for non-combat encounters', () => {
    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'resource', null)));

    state.loadInitialData();
    candidateActions.candidateForm.patchValue({ reason: 'Should not save.' });
    candidateActions.saveCandidate();

    expect(admin.upsertEncounterCombatCandidate).not.toHaveBeenCalled();
    expect(state.error()).toBe('Combat candidates can be edited only for combat encounters.');
  });

  it('saves reward assignments through source_kind encounter', () => {
    state.loadInitialData();
    rewardActions.assignmentForm.patchValue({
      rewardProfileId: 'reward-1',
      outcomeKind: 'success',
      difficultyKey: 'easy',
      reason: 'Tune reward.',
    });

    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        encounterDefinitionId: 'encounter-1',
        rewardProfileId: 'reward-1',
        outcomeKind: 'success',
        difficultyKey: 'easy',
        reason: 'Tune reward.',
      }),
    );
  });

  it('ignores stale encounter and candidate save responses after selection changes', () => {
    const encounterSave = new Subject<ExplorationEncounterAdminData['encounters'][number]>();
    const candidateSave = new Subject<ExplorationEncounterAdminData['combatCandidates'][number]>();
    admin.upsertEncounterDefinition.and.returnValue(encounterSave.asObservable());
    admin.upsertEncounterCombatCandidate.and.returnValue(candidateSave.asObservable());
    state.loadInitialData();
    definitionActions.encounterForm.patchValue({
      reason: 'Tune encounter.',
      label: 'Updated ambush',
      description: 'Updated.',
    });

    definitionActions.saveEncounter();
    state.selectEncounter(null);
    encounterSave.next(adminData('encounter-2').encounters[0]);
    encounterSave.complete();

    expect(toast.show).not.toHaveBeenCalled();
    expect(state.selectedEncounterId()).toBeNull();

    state.selectEncounter('encounter-1');
    candidateActions.selectCandidate('candidate-1');
    candidateActions.candidateForm.patchValue({ reason: 'Tune candidate.' });
    candidateActions.saveCandidate();
    candidateActions.selectCandidate(null);
    candidateSave.error(new Error('stale candidate error'));

    expect(state.error()).toBeNull();
  });

  it('does not call encounter RPC for invalid metadata JSON or missing reason', () => {
    state.loadInitialData();
    definitionActions.encounterForm.patchValue({
      metadataJsonText: '[',
      reason: 'Invalid metadata.',
    });

    definitionActions.saveEncounter();

    expect(admin.upsertEncounterDefinition).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');

    definitionActions.encounterForm.patchValue({
      metadataJsonText: '{}',
      reason: '',
    });
    definitionActions.saveEncounter();

    expect(admin.upsertEncounterDefinition).not.toHaveBeenCalled();
    expect(state.error()).toBe('Reason is required.');
  });
});

function adminData(
  encounterId = 'encounter-1',
  encounterKind = 'combat',
  minigameKey: string | null = 'combat',
): ExplorationEncounterAdminData {
  return {
    encounters: [
      {
        id: encounterId,
        key: 'bandit-ambush',
        label: 'Bandit ambush',
        description: 'Ambush.',
        helperText: null,
        adminDescription: null,
        encounterKind,
        minigameKey,
        rewardProfileId: null,
        minDifficultyKey: 'easy',
        maxDifficultyKey: null,
        minDistrictCode: null,
        maxDistrictCode: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    minigames: [
      {
        key: 'combat',
        label: 'Combat',
        description: 'Combat minigame.',
        helperText: null,
        adminDescription: null,
        implementationKey: 'combat',
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    difficulties: [
      {
        key: 'easy',
        label: 'Easy',
        description: 'Easy.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        stepDurationMultiplier: 1,
        trialRewardMultiplier: 1,
        encounterRewardMultiplier: 1,
        trialOpportunityStepCap: 3,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    districts: [{ code: 'old-town', name: 'Old Town', description: 'Old district.', rank: 1 }],
    rewardProfiles: [
      {
        id: 'reward-1',
        key: 'encounter-reward',
        label: 'Encounter reward',
        category: 'encounter',
        description: 'Reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    rewardAssignments: [
      {
        id: 'assignment-1',
        sourceKind: 'encounter',
        trialDefinitionId: null,
        encounterDefinitionId: encounterId,
        rewardProfileId: 'reward-1',
        outcomeKind: 'success',
        difficultyKey: 'easy',
        districtCode: null,
        description: null,
        helperText: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    combatCandidates: [
      {
        id: 'candidate-1',
        encounterDefinitionId: encounterId,
        candidateKind: 'opponent',
        opponentDefinitionId: 'opponent-1',
        familyKey: null,
        scalingFormulaId: null,
        difficultyMultiplier: 1,
        weight: 1,
        minHeroLevel: null,
        maxHeroLevel: null,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    opponents: [
      {
        id: 'opponent-1',
        key: 'bandit',
        label: 'Bandit',
        description: null,
        helperText: null,
        adminDescription: null,
        familyKey: 'bandits',
        equipmentMode: 'generated',
        defaultScalingFormulaId: null,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    families: [],
    formulas: [],
  };
}
