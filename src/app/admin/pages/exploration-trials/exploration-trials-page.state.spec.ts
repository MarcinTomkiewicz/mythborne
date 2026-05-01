import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { ExplorationTrialAdminData } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationTrialsActionsState } from './exploration-trials-actions.state';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

describe('ExplorationTrialsPageState', () => {
  let admin: jasmine.SpyObj<ExplorationTrialAdmin>;
  let toast: jasmine.SpyObj<ToastService>;
  let state: ExplorationTrialsPageState;
  let actions: ExplorationTrialsActionsState;

  beforeEach(() => {
    admin = jasmine.createSpyObj<ExplorationTrialAdmin>('ExplorationTrialAdmin', [
      'getAdminData',
      'upsertTrialDefinition',
      'upsertTrialCombatCandidate',
      'deactivateTrialCombatCandidate',
    ]);
    admin.getAdminData.and.returnValue(of(adminData()));
    admin.upsertTrialDefinition.and.returnValue(of(adminData().trials[0]));
    admin.upsertTrialCombatCandidate.and.returnValue(of(adminData().combatCandidates[0]));
    admin.deactivateTrialCombatCandidate.and.returnValue(of({
      ...adminData().combatCandidates[0],
      isActive: false,
    }));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        ExplorationTrialsPageState,
        ExplorationTrialsActionsState,
        { provide: ExplorationTrialAdmin, useValue: admin },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ExplorationTrialsPageState);
    actions = TestBed.inject(ExplorationTrialsActionsState);
  });

  it('loads trial definitions and selects the first trial for inspection', () => {
    state.loadInitialData();

    expect(state.trialOptions()[0].label).toBe('Combat trial (combat-trial)');
    expect(state.selectedTrial()?.testedStatLabel).toBe('Spirituality (spirituality)');
    expect(state.selectedTrial()?.minigameLabel).toBe('Combat (combat)');
    expect(state.combatCandidates()[0].targetLabel).toBe('Bandit (bandit)');
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
    expect(state.error()).toBe('Reason is required.');
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
    stats: [{ key: 'spirituality', label: 'Spirituality' }],
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
  };
}
