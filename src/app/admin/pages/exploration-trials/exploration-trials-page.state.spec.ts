import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { ExplorationTrialAdminData } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationTrialsActionsState } from './exploration-trials-actions.state';
import { ExplorationCombatCandidatesSection } from './exploration-combat-candidates-section';
import { ExplorationTrialEditSection } from './exploration-trial-edit-section';
import { ExplorationTrialRewardActionsState } from './exploration-trial-reward-actions.state';
import { ExplorationTrialRewardSection } from './exploration-trial-reward-section';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

describe('ExplorationTrialsPageState', () => {
  let admin: jasmine.SpyObj<ExplorationTrialAdmin>;
  let toast: jasmine.SpyObj<ToastService>;
  let state: ExplorationTrialsPageState;
  let actions: ExplorationTrialsActionsState;
  let rewardActions: ExplorationTrialRewardActionsState;

  beforeEach(() => {
    admin = jasmine.createSpyObj<ExplorationTrialAdmin>('ExplorationTrialAdmin', [
      'getAdminData',
      'upsertTrialDefinition',
      'upsertTrialCombatCandidate',
      'deactivateTrialCombatCandidate',
      'upsertRewardProfileAssignment',
      'deactivateRewardProfileAssignment',
    ]);
    admin.getAdminData.and.returnValue(of(adminData()));
    admin.upsertTrialDefinition.and.returnValue(of(adminData().trials[0]));
    admin.upsertTrialCombatCandidate.and.returnValue(of(adminData().combatCandidates[0]));
    admin.deactivateTrialCombatCandidate.and.returnValue(of({
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
      imports: [
        ExplorationTrialEditSection,
        ExplorationTrialRewardSection,
        ExplorationCombatCandidatesSection,
      ],
      providers: [
        ExplorationTrialsPageState,
        ExplorationTrialsActionsState,
        ExplorationTrialRewardActionsState,
        { provide: ExplorationTrialAdmin, useValue: admin },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ExplorationTrialsPageState);
    actions = TestBed.inject(ExplorationTrialsActionsState);
    rewardActions = TestBed.inject(ExplorationTrialRewardActionsState);
  });

  it('loads trial definitions and selects the first trial for inspection', () => {
    state.loadInitialData();

    expect(state.trialOptions()[0].label).toBe('Combat trial (combat-trial)');
    expect(state.selectedTrial()?.testedStatLabel).toBe('Spirituality (spirituality)');
    expect(state.selectedTrial()?.minigameLabel).toBe('Combat (combat)');
    expect(state.combatCandidates()[0].targetLabel).toBe('Bandit (bandit)');
    expect(state.rewardAssignments()[0].summaryLabel).toContain('use Trial reward');
  });

  it('reports missing UI metadata as exact namespace/key gaps', () => {
    const data = adminData();
    admin.getAdminData.and.returnValue(of({
      ...data,
      uiMetadataEntries: data.uiMetadataEntries.filter(
        (entry) => !(entry.namespace === 'trial_configurator_field' && entry.key === 'reward_profile'),
      ),
    }));

    state.loadInitialData();

    expect(state.missingUiMetadataGaps()).toContain('trial_configurator_field/reward_profile');
  });

  it('saves trial definitions through the admin RPC service with a reason', () => {
    state.loadInitialData();
    actions.trialForm.patchValue({
      trialDefinitionId: 'trial-1',
      key: 'combat-trial',
      label: 'Updated trial',
      description: 'Fight a foe.',
      testedStatKey: 'spirituality',
      minigameKey: 'combat',
      reason: 'Tune trial label.',
    });

    actions.saveTrial();

    expect(admin.upsertTrialDefinition).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        trialDefinitionId: 'trial-1',
        label: 'Updated trial',
        testedStatKey: 'spirituality',
        minigameKey: 'combat',
        reason: 'Tune trial label.',
      }),
    );
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Exploration trials',
      'Trial definition saved.',
    );
  });

  it('generates keys from labels for new trials', () => {
    state.loadInitialData();

    actions.startNewTrial();
    actions.trialForm.controls.label.setValue('Próba Żelaznej Woli!');

    expect(actions.trialForm.controls.key.value).toBe('proba-zelaznej-woli');
  });

  it('keeps existing stable keys when label changes without advanced override', () => {
    state.loadInitialData();
    TestBed.flushEffects();

    actions.trialForm.controls.label.setValue('Renamed Combat Trial');

    expect(actions.trialForm.controls.key.value).toBe('combat-trial');
  });

  it('saves and deactivates combat candidates only for combat trials', () => {
    state.loadInitialData();
    actions.selectCandidate('candidate-1');
    actions.candidateForm.patchValue({
      reason: 'Tune combat candidate.',
      weight: 2,
    });

    actions.saveCandidate();

    expect(admin.upsertTrialCombatCandidate).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        candidateId: 'candidate-1',
        trialDefinitionId: 'trial-1',
        candidateKind: 'opponent',
        opponentDefinitionId: 'opponent-1',
        reason: 'Tune combat candidate.',
        weight: 2,
      }),
    );

    actions.candidateForm.patchValue({ reason: 'Deactivate candidate.' });
    actions.deactivateCandidate();

    expect(admin.deactivateTrialCombatCandidate).toHaveBeenCalledOnceWith(
      'candidate-1',
      'Deactivate candidate.',
    );
  });

  it('blocks combat candidate edits for non-combat trials', () => {
    admin.getAdminData.and.returnValue(of(adminData('trial-1', 'logic')));

    state.loadInitialData();
    actions.candidateForm.patchValue({ reason: 'Should not save.' });
    actions.saveCandidate();

    expect(admin.upsertTrialCombatCandidate).not.toHaveBeenCalled();
    expect(state.error()).toBe('Combat candidates can be edited only for combat trials.');
  });

  it('ignores stale trial save success after selected trial changes', () => {
    const save = new Subject<ExplorationTrialAdminData['trials'][number]>();
    admin.upsertTrialDefinition.and.returnValue(save.asObservable());
    state.loadInitialData();
    actions.trialForm.patchValue({
      trialDefinitionId: 'trial-1',
      key: 'combat-trial',
      label: 'Updated trial',
      description: 'Fight a foe.',
      testedStatKey: 'spirituality',
      minigameKey: 'combat',
      reason: 'Tune trial label.',
    });

    actions.saveTrial();
    state.selectTrial(null);
    save.next(adminData('trial-2').trials[0]);
    save.complete();

    expect(toast.show).not.toHaveBeenCalled();
    expect(state.selectedTrialId()).toBeNull();
  });

  it('ignores stale candidate save and deactivate responses after selection changes', () => {
    const save = new Subject<ExplorationTrialAdminData['combatCandidates'][number]>();
    const deactivate = new Subject<ExplorationTrialAdminData['combatCandidates'][number]>();
    admin.upsertTrialCombatCandidate.and.returnValue(save.asObservable());
    admin.deactivateTrialCombatCandidate.and.returnValue(deactivate.asObservable());
    state.loadInitialData();
    actions.selectCandidate('candidate-1');
    actions.candidateForm.patchValue({ reason: 'Tune candidate.' });

    actions.saveCandidate();
    actions.selectCandidate(null);
    save.next(adminData().combatCandidates[0]);
    save.complete();

    expect(toast.show).not.toHaveBeenCalled();

    actions.selectCandidate('candidate-1');
    actions.candidateForm.patchValue({ reason: 'Deactivate candidate.' });
    actions.deactivateCandidate();
    state.selectTrial(null);
    deactivate.error(new Error('stale deactivate error'));

    expect(state.error()).toBeNull();
  });

  it('does not call trial RPC for invalid metadata JSON', () => {
    state.loadInitialData();
    actions.trialForm.patchValue({
      metadataJsonText: '[',
      reason: 'Invalid metadata.',
    });

    actions.saveTrial();

    expect(admin.upsertTrialDefinition).not.toHaveBeenCalled();
    expect(state.error()).toBe('Metadata must be a valid JSON object.');
  });

  it('does not call trial RPC without a reason', () => {
    state.loadInitialData();
    actions.trialForm.patchValue({
      key: 'combat-trial',
      label: 'Combat trial',
      description: 'Fight a foe.',
      testedStatKey: 'spirituality',
      minigameKey: 'combat',
      reason: '',
    });

    actions.saveTrial();

    expect(admin.upsertTrialDefinition).not.toHaveBeenCalled();
    expect(state.error()).toBeNull();
    expect(actions.trialReasonError()).toBe('Reason is required for this admin mutation.');
  });

  it('updates and saves trial definition controls through rendered p-selects', () => {
    state.loadInitialData();
    const fixture = TestBed.createComponent(ExplorationTrialEditSection);
    fixture.detectChanges();

    selectPrimeOption(fixture, 'p-select[formcontrolname="testedStatKey"]', 'cunning');
    selectPrimeOption(fixture, 'p-select[formcontrolname="minigameKey"]', 'logic');
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(actions.trialForm.controls.testedStatKey.value).toBe('cunning');
    expect(actions.trialForm.controls.minigameKey.value).toBe('logic');

    actions.trialForm.controls.reason.setValue('Tune trial selects.');
    actions.saveTrial();

    expect(admin.upsertTrialDefinition).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        testedStatKey: 'cunning',
        minigameKey: 'logic',
        reason: 'Tune trial selects.',
      }),
    );
  });

  it('updates and saves reward assignment selected through rendered p-selects', () => {
    state.loadInitialData();
    rewardActions.startNewAssignment();
    const fixture = TestBed.createComponent(ExplorationTrialRewardSection);
    fixture.detectChanges();

    selectPrimeOption(fixture, 'p-select[formcontrolname="rewardProfileId"]', 'reward-1');
    selectPrimeOption(fixture, 'p-select[formcontrolname="difficultyMatchKind"]', 'range');
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(rewardActions.form.controls.rewardProfileId.value).toBe('reward-1');
    expect(rewardActions.form.controls.difficultyMatchKind.value).toBe('range');

    rewardActions.form.patchValue({
      outcomeKind: 'success',
      difficultyKey: 'medium',
      maxDifficultyKey: 'hard',
      reason: 'Tune trial reward.',
    });
    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        trialDefinitionId: 'trial-1',
        rewardProfileId: 'reward-1',
        difficultyMatchKind: 'range',
        difficultyKey: 'medium',
        maxDifficultyKey: 'hard',
        reason: 'Tune trial reward.',
      }),
    );
  });

  it('cleans hidden reward assignment match values and blocks invalid ranges', () => {
    state.loadInitialData();
    rewardActions.startNewAssignment();
    rewardActions.form.patchValue({
      rewardProfileId: 'reward-1',
      outcomeKind: 'success',
      difficultyMatchKind: 'any',
      difficultyKey: 'hard',
      maxDifficultyKey: 'medium',
      districtMatchKind: 'exact',
      districtCode: 'harbor',
      maxDistrictCode: 'market',
      reason: 'Tune cleanup.',
    });

    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        difficultyMatchKind: 'any',
        difficultyKey: null,
        maxDifficultyKey: null,
        districtMatchKind: 'exact',
        districtCode: 'harbor',
        maxDistrictCode: null,
      }),
    );

    admin.upsertRewardProfileAssignment.calls.reset();
    rewardActions.form.patchValue({
      difficultyMatchKind: 'range',
      difficultyKey: 'hard',
      maxDifficultyKey: 'easy',
      districtMatchKind: 'range',
      districtCode: 'market',
      maxDistrictCode: 'old-town',
      reason: 'Invalid range.',
    });

    rewardActions.saveAssignment();

    expect(admin.upsertRewardProfileAssignment).not.toHaveBeenCalled();
    expect(rewardActions.difficultyRangeError()).toBe(
      'Maximum difficulty cannot be lower than minimum difficulty.',
    );
    expect(rewardActions.districtRangeError()).toBe(
      'Maximum district cannot be lower than minimum district.',
    );
  });

  it('uses draft minigame for combat candidate section visibility until definition is saved', () => {
    state.loadInitialData();
    const fixture = TestBed.createComponent(ExplorationCombatCandidatesSection);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Candidate kind');

    actions.trialForm.controls.minigameKey.setValue('logic');
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(actions.hasUnsavedMinigameChange()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Save the trial definition');
    expect(fixture.nativeElement.textContent).toContain('does not use combat candidates');
    expect(fixture.nativeElement.textContent).not.toContain('Candidate kind');

    actions.candidateForm.patchValue({ reason: 'Should block.' });
    actions.saveCandidate();

    expect(admin.upsertTrialCombatCandidate).not.toHaveBeenCalled();
  });

  it('ignores stale load errors after a newer load succeeds', () => {
    const first = new Subject<ExplorationTrialAdminData>();
    admin.getAdminData.and.returnValues(
      first.asObservable(),
      of(adminData('trial-2')),
    );

    state.loadInitialData();
    state.loadInitialData();
    first.error(new Error('stale error'));

    expect(state.error()).toBeNull();
    expect(state.selectedTrialId()).toBe('trial-2');
    expect(state.isLoading()).toBeFalse();
  });

  it('shows load errors for the current request', () => {
    admin.getAdminData.and.returnValue(throwError(() => new Error('load failed')));

    state.loadInitialData();

    expect(state.error()).toBe('load failed');
    expect(state.isLoading()).toBeFalse();
  });
});

function adminData(trialId = 'trial-1', minigameKey = 'combat'): ExplorationTrialAdminData {
  return {
    trials: [
      {
        id: trialId,
        key: 'combat-trial',
        label: 'Combat trial',
        description: 'Fight a foe.',
        helperText: null,
        adminDescription: null,
        testedStatKey: 'spirituality',
        minigameKey,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    minigames: [
      {
        key: 'logic',
        label: 'Logic',
        description: 'Logic minigame.',
        helperText: null,
        adminDescription: null,
        implementationKey: 'logic',
        sortOrder: 20,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
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
    stats: [
      {
        key: 'spirituality',
        label: 'Spirituality',
        description: 'Spiritual stat.',
        helperText: null,
        adminDescription: null,
      },
      {
        key: 'cunning',
        label: 'Cunning',
        description: 'Cunning stat.',
        helperText: null,
        adminDescription: null,
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
      {
        key: 'medium',
        label: 'Medium',
        description: 'Medium.',
        helperText: null,
        adminDescription: null,
        sortOrder: 20,
        isActive: true,
        stepDurationMultiplier: 1,
        trialRewardMultiplier: 1,
        encounterRewardMultiplier: 1,
        trialOpportunityStepCap: 3,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'hard',
        label: 'Hard',
        description: 'Hard.',
        helperText: null,
        adminDescription: null,
        sortOrder: 30,
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
    districts: [
      { code: 'old-town', name: 'Old Town', description: 'Old district.', rank: 1 },
      { code: 'harbor', name: 'Harbor', description: 'Harbor district.', rank: 2 },
      { code: 'market', name: 'Market', description: 'Market district.', rank: 3 },
    ],
    rewardProfiles: [
      {
        id: 'reward-1',
        key: 'trial-reward',
        label: 'Trial reward',
        category: 'trial',
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
    rewardProfileEntries: [
      {
        id: 'entry-1',
        rewardProfileId: 'reward-1',
        entryKind: 'experience',
        label: 'Experience reward',
        description: 'XP.',
        helperText: null,
        adminDescription: null,
        amountMode: 'fixed',
        minAmount: 10,
        maxAmount: 10,
        resourceType: null,
        formulaId: null,
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
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    rewardOutcomeKinds: [
      {
        sourceKind: 'trial',
        key: 'success',
        label: 'Success',
        description: 'Trial success.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    resourceTypes: [],
    rewardAssignmentMatchKinds: [
      {
        key: 'any',
        label: 'Any',
        description: 'Wildcard match.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'exact',
        label: 'Exact',
        description: 'Exact match.',
        helperText: null,
        adminDescription: null,
        sortOrder: 20,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'range',
        label: 'Range',
        description: 'Range match.',
        helperText: null,
        adminDescription: null,
        sortOrder: 30,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    rewardSourceKinds: [
      {
        key: 'trial',
        label: 'Trial',
        description: 'Trial reward routing source.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    rewardEntryKinds: [
      {
        key: 'experience',
        label: 'Experience',
        description: 'Numeric experience reward.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    rewardEntryAmountModes: [
      {
        key: 'fixed',
        label: 'Fixed',
        description: 'Fixed numeric amount.',
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
        rewardProfileId: 'reward-1',
        sourceKind: 'trial',
        outcomeKind: 'success',
        trialDefinitionId: trialId,
        encounterDefinitionId: null,
        difficultyKey: null,
        difficultyMatchKind: 'any',
        maxDifficultyKey: null,
        districtCode: null,
        districtMatchKind: 'any',
        maxDistrictCode: null,
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
        trialDefinitionId: trialId,
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
    uiMetadataEntries: uiMetadataEntries(),
  };
}

function uiMetadataEntries() {
  return [
    ...[
      'page_header',
      'trial_meaning',
      'trial_definition',
      'reward_assignments',
      'combat_candidates',
    ].map((key, index) => uiMetadataEntry('trial_configurator_section', key, index)),
    ...[
      'trial_key',
      'tested_stat',
      'minigame',
      'definition_reason',
      'reward_profile',
      'outcome_kind',
      'difficulty_match_kind',
      'district_match_kind',
      'assignment_helper_text',
      'assignment_reason',
      'candidate_kind',
      'scaling_formula',
      'difficulty_multiplier',
      'weight',
      'candidate_reason',
    ].map((key, index) => uiMetadataEntry('trial_configurator_field', key, index)),
  ];
}

function uiMetadataEntry(namespace: string, key: string, index: number) {
  return {
    id: `${namespace}-${key}`,
    namespace,
    key,
    label: key.replace(/_/g, ' '),
    description: `${namespace}/${key} description.`,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: 'trial-configurator',
    uiGroupLabel: 'Exploration trials',
    sortOrder: index + 1,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function selectPrimeOption(
  fixture: ComponentFixture<unknown>,
  selector: string,
  optionValue: string,
): void {
  const select = fixture.debugElement.query(By.css(selector)).componentInstance;
  const option = select.options.find((entry: { value: string }) => entry.value === optionValue);

  select.onOptionSelect(new Event('click'), option);
}
