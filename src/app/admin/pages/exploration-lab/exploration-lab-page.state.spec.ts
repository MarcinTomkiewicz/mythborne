import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ExplorationDefinitions } from '../../../core/services/exploration/exploration-definitions';
import { ExplorationLabPreviews } from '../../../core/services/exploration/exploration-lab-previews';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationLabPageState } from './exploration-lab-page.state';

describe('ExplorationLabPageState', () => {
  let previews: jasmine.SpyObj<ExplorationLabPreviews>;
  let definitions: jasmine.SpyObj<ExplorationDefinitions>;
  let state: ExplorationLabPageState;

  beforeEach(() => {
    previews = jasmine.createSpyObj<ExplorationLabPreviews>('ExplorationLabPreviews', [
      'previewTrialOpportunityCurve',
      'previewTrialManifestationChance',
      'previewChallengeAutoResolveSuccessChance',
      'previewRewardGeneratedItem',
      'previewRewardProfile',
      'simulateTrialOpportunityRuns',
    ]);
    previews.previewTrialOpportunityCurve.and.returnValue(of([opportunity()]));
    previews.previewTrialManifestationChance.and.returnValue(of([]));
    previews.previewChallengeAutoResolveSuccessChance.and.returnValue(of([]));
    previews.previewRewardGeneratedItem.and.returnValue(of([]));
    previews.previewRewardProfile.and.returnValue(of([]));
    previews.simulateTrialOpportunityRuns.and.returnValue(of([]));
    definitions = jasmine.createSpyObj<ExplorationDefinitions>(
      'ExplorationDefinitions',
      [
        'getActiveDifficultyTiers',
        'getActiveRewardProfiles',
        'getActiveTrialDefinitions',
        'getActiveEncounterDefinitions',
        'getActiveItemBucketProfiles',
        'getEnabledItemQualities',
        'getDistrictOptions',
        'getStatOptions',
      ],
    );
    definitions.getActiveDifficultyTiers.and.returnValue(of([difficulty()]));
    definitions.getActiveRewardProfiles.and.returnValue(of([rewardProfile()]));
    definitions.getActiveTrialDefinitions.and.returnValue(of([trialDefinition()]));
    definitions.getActiveEncounterDefinitions.and.returnValue(of([]));
    definitions.getActiveItemBucketProfiles.and.returnValue(of([bucketProfile()]));
    definitions.getEnabledItemQualities.and.returnValue(of([quality()]));
    definitions.getDistrictOptions.and.returnValue(of([district()]));
    definitions.getStatOptions.and.returnValue(of([stat()]));

    TestBed.configureTestingModule({
      providers: [
        ExplorationDefinitionsState,
        ExplorationLabPageState,
        { provide: ExplorationLabPreviews, useValue: previews },
        { provide: ExplorationDefinitions, useValue: definitions },
      ],
    });
    state = TestBed.inject(ExplorationLabPageState);
  });

  it('loads DB-backed options and runs trial opportunity preview without mutation', () => {
    state.loadInitialData();
    state.opportunityForm.patchValue({
      difficultyKey: 'easy',
      startingDryStepCount: 2,
      stepsToPreview: 4,
    });

    state.runOpportunityCurve();

    expect(state.difficultyOptions()).toEqual([{ label: 'Easy (easy)', value: 'easy' }]);
    expect(previews.previewTrialOpportunityCurve).toHaveBeenCalledOnceWith({
      difficultyKey: 'easy',
      startingDryStepCount: 2,
      stepsToPreview: 4,
    });
    expect(state.opportunityRows()[0].trialOpportunityChance).toBe(10);
  });

  it('sets safe DB-backed defaults after loading definitions', () => {
    state.loadInitialData();

    expect(state.opportunityForm.controls.difficultyKey.value).toBe('easy');
    expect(state.manifestationForm.controls.districtCode.value).toBe('district-a');
    expect(state.autoResolveForm.controls.testedStatKey.value).toBe('spirituality');
    expect(state.generatedItemForm.controls.bucketProfileId.value).toBe('bucket-1');
    expect(state.itemQualityOptions()).toContain(
      jasmine.objectContaining({ label: 'Rare (rare)', value: 'rare' }),
    );
  });

  it('maps picker values to generated item preview RPC args', () => {
    state.loadInitialData();
    state.generatedItemForm.patchValue({
      bucketProfileId: 'bucket-1',
      maxQualityKey: 'rare',
      previewCount: 5,
      luckValue: 12,
    });

    state.runGeneratedItemPreview();

    expect(previews.previewRewardGeneratedItem).toHaveBeenCalledOnceWith({
      bucketProfileId: 'bucket-1',
      maxQualityKey: 'rare',
      previewCount: 5,
      luckValue: 12,
    });
  });

  it('maps selected trial object to manifestation RPC args as id only', () => {
    const trial = trialDefinition();
    state.loadInitialData();

    state.selectTrialDefinition(trial);
    state.runManifestationChance();

    expect(state.manifestationForm.controls.trialDefinition.value).toBe(trial);
    expect(state.manifestationForm.controls.trialDefinitionId.value).toBe('trial-1');
    expect(previews.previewTrialManifestationChance).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        trialDefinitionId: 'trial-1',
      }),
    );
    expect(previews.previewTrialManifestationChance).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        trialDefinition: trial,
      } as never),
    );
  });

  it('maps selected reward profile object to reward preview RPC args as id only', () => {
    const profile = rewardProfile();
    state.loadInitialData();

    state.selectRewardProfile(profile);
    state.rewardProfileForm.patchValue({
      previewCount: 4,
      spiritualityValue: 7,
      luckValue: 12,
    });
    state.runRewardProfilePreview();

    expect(state.rewardProfileForm.controls.rewardProfile.value).toBe(profile);
    expect(state.rewardProfileForm.controls.rewardProfileId.value).toBe('profile-1');
    expect(previews.previewRewardProfile).toHaveBeenCalledOnceWith({
      rewardProfileId: 'profile-1',
      previewCount: 4,
      spiritualityValue: 7,
      luckValue: 12,
    });
    expect(previews.previewRewardProfile).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        rewardProfile: profile,
      } as never),
    );
  });

  it('clears selected autocomplete ids with their object controls', () => {
    state.selectTrialDefinition(trialDefinition());
    state.selectRewardProfile(rewardProfile());

    state.clearTrialDefinition();
    state.clearRewardProfile();

    expect(state.manifestationForm.controls.trialDefinition.value).toBeNull();
    expect(state.manifestationForm.controls.trialDefinitionId.value).toBeNull();
    expect(state.rewardProfileForm.controls.rewardProfile.value).toBeNull();
    expect(state.rewardProfileForm.controls.rewardProfileId.value).toBeNull();
  });

  it('summarizes trial opportunity simulation distribution', () => {
    previews.simulateTrialOpportunityRuns.and.returnValue(
      of([
        simulation({ stepsTaken: 1, trialFound: true }),
        simulation({ stepsTaken: 2, trialFound: false }),
        simulation({ stepsTaken: 2, trialFound: true }),
      ]),
    );

    state.runTrialOpportunitySimulation();

    expect(state.simulationSummary()).toEqual({
      totalRuns: 3,
      foundCount: 2,
      notFoundCount: 1,
      foundRate: 2 / 3,
      averageSteps: 5 / 3,
    });
    expect(state.simulationStepDistribution()).toEqual([
      { stepsTaken: 1, runCount: 1, foundCount: 1, foundRate: 1 },
      { stepsTaken: 2, runCount: 2, foundCount: 1, foundRate: 0.5 },
    ]);
  });

  it('maps preview errors to inline error state without throwing', () => {
    previews.previewTrialOpportunityCurve.and.returnValue(
      throwError(() => new Error('RPC denied')),
    );

    state.runOpportunityCurve();

    expect(state.error()).toBe('RPC denied');
    expect(state.isRunning()).toBeFalse();
  });
});

function opportunity() {
  return {
    difficultyKey: 'easy',
    difficultyLabel: 'Easy',
    projectedStepNumber: 1,
    dryStepCount: 0,
    trialOpportunityChance: 10,
    trialOpportunityStepCap: 5,
    isGuaranteedByStepCap: false,
    explanation: 'Preview only.',
  };
}

function difficulty() {
  return {
    key: 'easy',
    label: 'Easy',
  } as never;
}

function rewardProfile() {
  return {
    id: 'profile-1',
    key: 'starter',
    label: 'Starter reward',
    category: 'trial',
  } as ReturnType<ExplorationDefinitions['getActiveRewardProfiles']> extends import('rxjs').Observable<
    (infer T)[]
  >
    ? T
    : never;
}

function trialDefinition() {
  return {
    id: 'trial-1',
    key: 'trial_spirit',
    label: 'Spirit trial',
    testedStatKey: 'spirituality',
  } as ReturnType<ExplorationDefinitions['getActiveTrialDefinitions']> extends import('rxjs').Observable<
    (infer T)[]
  >
    ? T
    : never;
}

function bucketProfile() {
  return {
    id: 'bucket-1',
    key: 'starter_bucket',
    name: 'Starter bucket',
  } as never;
}

function quality() {
  return {
    key: 'rare',
    label: 'Rare',
  } as never;
}

function district() {
  return {
    code: 'district-a',
    name: 'District A',
  } as never;
}

function stat() {
  return {
    key: 'spirituality',
    label: 'Spirituality',
  } as never;
}

function simulation(
  patch: Partial<{
    stepsTaken: number;
    trialFound: boolean;
  }>,
) {
  return {
    runIndex: 1,
    stepsTaken: 1,
    trialFound: false,
    ...patch,
  } as never;
}
