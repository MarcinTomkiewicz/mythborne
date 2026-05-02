import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationEncounterCandidateActionsState } from './exploration-encounter-candidate-actions.state';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterEffectDefinitionActionsState } from './exploration-encounter-effect-definition-actions.state';
import { ExplorationEncounterEffectPayloadActionsState } from './exploration-encounter-effect-payload-actions.state';
import { ExplorationEncounterResourcePayloadActionsState } from './exploration-encounter-resource-payload-actions.state';
import { ExplorationEncounterRewardActionsState } from './exploration-encounter-reward-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

describe('ExplorationEncountersPageState', () => {
  let admin: jasmine.SpyObj<ExplorationEncounterAdmin>;
  let toast: jasmine.SpyObj<ToastService>;
  let state: ExplorationEncountersPageState;
  let definitionActions: ExplorationEncounterDefinitionActionsState;
  let candidateActions: ExplorationEncounterCandidateActionsState;
  let rewardActions: ExplorationEncounterRewardActionsState;
  let resourcePayloadActions: ExplorationEncounterResourcePayloadActionsState;
  let effectDefinitionActions: ExplorationEncounterEffectDefinitionActionsState;
  let effectPayloadActions: ExplorationEncounterEffectPayloadActionsState;

  beforeEach(() => {
    admin = jasmine.createSpyObj<ExplorationEncounterAdmin>('ExplorationEncounterAdmin', [
      'getAdminData',
      'upsertEncounterDefinition',
      'deactivateEncounterDefinition',
      'upsertEncounterCombatCandidate',
      'deactivateEncounterCombatCandidate',
      'upsertEncounterResourcePayload',
      'deactivateEncounterResourcePayload',
      'upsertExplorationEffectDefinition',
      'deactivateExplorationEffectDefinition',
      'upsertEncounterEffectPayload',
      'deactivateEncounterEffectPayload',
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
    admin.upsertEncounterResourcePayload.and.returnValue(of(adminData().resourcePayloads[0]));
    admin.deactivateEncounterResourcePayload.and.returnValue(of({
      ...adminData().resourcePayloads[0],
      isActive: false,
    }));
    admin.upsertExplorationEffectDefinition.and.returnValue(of(adminData().effectDefinitions[0]));
    admin.deactivateExplorationEffectDefinition.and.returnValue(of({
      ...adminData().effectDefinitions[0],
      isActive: false,
    }));
    admin.upsertEncounterEffectPayload.and.returnValue(of(adminData().effectPayloads[0]));
    admin.deactivateEncounterEffectPayload.and.returnValue(of({
      ...adminData().effectPayloads[0],
      isActive: false,
    }));
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
        ExplorationEncounterResourcePayloadActionsState,
        ExplorationEncounterEffectDefinitionActionsState,
        ExplorationEncounterEffectPayloadActionsState,
        { provide: ExplorationEncounterAdmin, useValue: admin },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ExplorationEncountersPageState);
    definitionActions = TestBed.inject(ExplorationEncounterDefinitionActionsState);
    candidateActions = TestBed.inject(ExplorationEncounterCandidateActionsState);
    rewardActions = TestBed.inject(ExplorationEncounterRewardActionsState);
    resourcePayloadActions = TestBed.inject(ExplorationEncounterResourcePayloadActionsState);
    effectDefinitionActions = TestBed.inject(ExplorationEncounterEffectDefinitionActionsState);
    effectPayloadActions = TestBed.inject(ExplorationEncounterEffectPayloadActionsState);
  });

  it('loads encounter definitions and readable DB-backed labels', () => {
    state.loadInitialData();

    expect(state.encounterOptions()[0].label).toBe('Bandit ambush (bandit-ambush)');
    expect(state.selectedEncounter()?.minigameLabel).toBe('Combat (combat)');
    expect(state.selectedEncounter()?.difficultyRangeLabel).toBe('Easy+');
    expect(state.combatCandidates()[0].targetLabel).toBe('Bandit (bandit)');
    expect(state.rewardAssignments()[0].rewardProfileLabel).toBe('Encounter reward (encounter-reward)');
    expect(state.resourcePayloads()[0].amountLabel).toBe('5');
    expect(state.effectDefinitions()[0].bonusTemplateLabel).toBe(
      'Olive blessing template (olive-blessing-template)',
    );
    expect(state.effectPayloads()[0].effectLabel).toBe('Olive blessing (olive-blessing)');
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

  it('blocks empty encounter and effect keys even when advanced override is enabled', () => {
    state.loadInitialData();
    definitionActions.encounterForm.patchValue({
      allowKeyOverride: true,
      key: '',
      label: 'Updated ambush',
      description: 'Updated.',
      reason: 'Tune encounter.',
    });

    definitionActions.saveEncounter();

    expect(admin.upsertEncounterDefinition).not.toHaveBeenCalled();
    expect(definitionActions.encounterForm.controls.key.touched).toBeTrue();
    expect(definitionActions.encounterForm.controls.key.invalid).toBeTrue();

    effectDefinitionActions.form.patchValue({
      allowKeyOverride: true,
      key: '',
      label: 'Olive blessing',
      description: 'A temporary buff.',
      effectKind: 'buff',
      reason: 'Tune effect.',
    });

    effectDefinitionActions.saveEffectDefinition();

    expect(admin.upsertExplorationEffectDefinition).not.toHaveBeenCalled();
    expect(effectDefinitionActions.form.controls.key.touched).toBeTrue();
    expect(effectDefinitionActions.form.controls.key.invalid).toBeTrue();
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

  it('blocks reward assignment save when no reward profiles exist', () => {
    const data = adminData();
    admin.getAdminData.and.returnValue(of({ ...data, rewardProfiles: [] }));
    state.loadInitialData();
    rewardActions.assignmentForm.patchValue({
      rewardProfileId: null,
      outcomeKind: 'success',
      reason: 'Tune reward.',
    });

    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).not.toHaveBeenCalled();
    expect(state.error()).toBeNull();
  });

  it('saves resource payloads only for resource encounters', () => {
    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'resource', null)));
    state.loadInitialData();
    resourcePayloadActions.form.patchValue({
      resourceType: 'drachma',
      amountMode: 'fixed',
      minAmount: 5,
      maxAmount: 5,
      chancePercent: 100,
      reason: 'Tune resource.',
    });

    resourcePayloadActions.savePayload();

    expect(admin.upsertEncounterResourcePayload).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        encounterDefinitionId: 'encounter-1',
        resourceType: 'drachma',
        amountMode: 'fixed',
        reason: 'Tune resource.',
      }),
    );
  });

  it('saves effect definitions and payloads for buff encounters', () => {
    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'buff', null)));
    state.loadInitialData();
    effectDefinitionActions.form.patchValue({
      key: 'olive-blessing',
      label: 'Olive blessing',
      description: 'A temporary buff.',
      effectKind: 'buff',
      bonusTemplateId: 'bonus-1',
      reason: 'Tune effect.',
    });

    effectDefinitionActions.saveEffectDefinition((effectId, effectKind) =>
      effectPayloadActions.prefillEffectDefinition(effectId, effectKind),
    );

    expect(admin.upsertExplorationEffectDefinition).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        key: 'olive-blessing',
        effectKind: 'buff',
        bonusTemplateId: 'bonus-1',
        reason: 'Tune effect.',
      }),
    );

    expect(effectPayloadActions.form.controls.effectDefinitionId.value).toBe('effect-1');
    expect(state.effectDefinitionOptions().some((option) => option.value === 'effect-1')).toBeTrue();

    effectPayloadActions.form.patchValue({
      chancePercent: 75,
      reason: 'Tune payload.',
    });

    effectPayloadActions.savePayload();

    expect(admin.upsertEncounterEffectPayload).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        encounterDefinitionId: 'encounter-1',
        effectDefinitionId: 'effect-1',
        chancePercent: 75,
        reason: 'Tune payload.',
      }),
    );
  });

  it('blocks resource and effect payloads for incompatible encounter kinds', () => {
    state.loadInitialData();
    resourcePayloadActions.form.patchValue({
      resourceType: 'drachma',
      reason: 'Wrong kind.',
    });
    resourcePayloadActions.savePayload();

    expect(admin.upsertEncounterResourcePayload).not.toHaveBeenCalled();
    expect(state.error()).toBe('Resource payloads can be edited only for resource encounters.');

    effectPayloadActions.form.patchValue({
      effectDefinitionId: 'effect-1',
      reason: 'Wrong kind.',
    });
    effectPayloadActions.savePayload();

    expect(admin.upsertEncounterEffectPayload).not.toHaveBeenCalled();
    expect(state.error()).toBe('Effect payloads can be edited only for buff or debuff encounters.');
  });

  it('marks reason invalid and does not call payload RPCs without a reason', () => {
    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'resource', null)));
    state.loadInitialData();
    resourcePayloadActions.form.patchValue({
      resourceType: 'drachma',
      amountMode: 'fixed',
      reason: '',
    });

    resourcePayloadActions.savePayload();

    expect(admin.upsertEncounterResourcePayload).not.toHaveBeenCalled();
    expect(resourcePayloadActions.form.controls.reason.touched).toBeTrue();
    expect(resourcePayloadActions.reasonError()).toBe('Reason is required for this admin mutation.');
  });

  it('generates next sort order for new assignment and payload forms', () => {
    state.loadInitialData();

    rewardActions.startNewAssignment();
    resourcePayloadActions.startNewPayload();
    effectDefinitionActions.startNewEffectDefinition();
    effectPayloadActions.startNewPayload();

    expect(rewardActions.assignmentForm.controls.sortOrder.value).toBe(20);
    expect(resourcePayloadActions.form.controls.sortOrder.value).toBe(20);
    expect(effectDefinitionActions.form.controls.sortOrder.value).toBe(20);
    expect(effectPayloadActions.form.controls.sortOrder.value).toBe(20);
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
    expect(state.error()).toBeNull();
    expect(definitionActions.reasonError()).toBe('Reason is required for this admin mutation.');
  });

  it('keeps invalid metadata errors visible and does not call payload RPCs', () => {
    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'resource', null)));
    state.loadInitialData();
    resourcePayloadActions.form.patchValue({
      resourceType: 'drachma',
      amountMode: 'fixed',
      metadataJsonText: '[',
      reason: 'Tune resource.',
    });

    resourcePayloadActions.savePayload();

    expect(admin.upsertEncounterResourcePayload).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');

    admin.getAdminData.and.returnValue(of(adminData()));
    state.loadInitialData();
    rewardActions.assignmentForm.patchValue({
      rewardProfileId: 'reward-1',
      outcomeKind: 'success',
      metadataJsonText: '[',
      reason: 'Tune reward.',
    });

    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');

    admin.getAdminData.and.returnValue(of(adminData('encounter-1', 'buff', null)));
    state.loadInitialData();
    effectDefinitionActions.form.patchValue({
      key: 'olive-blessing',
      label: 'Olive blessing',
      description: 'A temporary buff.',
      effectKind: 'buff',
      metadataJsonText: '[',
      reason: 'Tune effect.',
    });

    effectDefinitionActions.saveEffectDefinition();

    expect(admin.upsertExplorationEffectDefinition).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');

    effectPayloadActions.form.patchValue({
      effectDefinitionId: 'effect-1',
      metadataJsonText: '[',
      reason: 'Tune payload.',
    });

    effectPayloadActions.savePayload();

    expect(admin.upsertEncounterEffectPayload).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');
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
    resourcePayloads: [
      {
        id: 'resource-payload-1',
        encounterDefinitionId: encounterId,
        resourceType: 'drachma',
        amountMode: 'fixed',
        minAmount: 5,
        maxAmount: 5,
        formulaId: null,
        chancePercent: 100,
        description: null,
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    effectPayloads: [
      {
        id: 'effect-payload-1',
        encounterDefinitionId: encounterId,
        effectDefinitionId: 'effect-1',
        chancePercent: 75,
        description: null,
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    effectDefinitions: [
      {
        id: 'effect-1',
        key: 'olive-blessing',
        label: 'Olive blessing',
        description: 'A temporary buff.',
        helperText: null,
        adminDescription: null,
        effectKind: 'buff',
        bonusTemplateId: 'bonus-1',
        defaultValue: 2,
        defaultDurationSteps: 1,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    bonusTemplates: [
      {
        id: 'bonus-1',
        key: 'olive-blessing-template',
        label: 'Olive blessing template',
        description: null,
        typeKey: 'flat_stat_bonus',
        targetKey: 'strength',
        scopeKey: 'exploration',
        levelInterval: null,
        formulaId: null,
        formulaTargetId: null,
        scalingStatKey: null,
        paramsJson: {},
        sortOrder: 10,
        isActive: true,
      },
    ],
  };
}
