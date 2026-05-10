import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LuckChancePreview } from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabComparisonState } from './luck-lab-comparison.state';
import { LuckLabEncounterComparisonState } from './luck-lab-encounter-comparison.state';
import { LuckLabPageState } from './luck-lab-page.state';

describe('LuckLabPageState', () => {
  let lab: jasmine.SpyObj<LuckLabState>;
  let previews: jasmine.SpyObj<LuckLabPreviews>;
  let definitions: Partial<ExplorationDefinitionsState>;
  let state: LuckLabPageState;

  beforeEach(() => {
    lab = jasmine.createSpyObj<LuckLabState>('LuckLabState', [
      'reloadNow',
      'setLuckValue',
      'setTestedStatValue',
      'setSpiritualityValue',
      'setDifficultyKey',
      'setDistrictCode',
      'setTestedStatKey',
      'setTrialDefinitionId',
      'setBucketProfileId',
      'setMaxQualityKey',
    ]);
    Object.assign(lab, {
      isLoading: signal(false),
      error: signal(null),
      loadingBySection: signal({ trialPower: false, chancePreviews: false }),
      errorsBySection: signal({ trialPower: null, chancePreviews: null }),
      input: signal(DEFAULT_LUCK_LAB_INPUT),
      result: signal({
        trialPower: {
          heroId: null,
          testedStatKey: 'wisdom',
          testedStatLabel: 'Wisdom',
          testedStatValue: 42,
          luckValue: 18,
          luckInfluence: 6,
          trialPower: 48,
          luckInfluenceFormula: {
            formulaKey: 'luck_influence',
            formulaExpression: 'DB luck expression',
          },
          trialPowerFormula: {
            formulaKey: 'trial_power',
            formulaExpression: 'DB trial expression',
          },
          explanation: 'DB Trial Power preview.',
        },
        luckInfluence: {
          luckInfluence: 6,
        },
        chancePreviews: [
          chancePreview('trial_opportunity', 10, null, {
            projectedStepNumber: 1,
            trialOpportunityStepCap: 8,
          }),
          chancePreview('trial_manifestation', 24, 48),
          chancePreview('challenge_auto_resolve', 18, 48, {
            capPercent: 80,
            difficultyMultiplier: 1,
            manualChanceReference: 30,
            rawAutoResolveSuccessChance: 28,
          }),
          chancePreview('non_trial_encounter', 14, null, {
            baseChance: 8,
            capPercent: 80,
            rawEncounterChance: 14,
            spiritualityValue: 0,
          }),
        ],
      }),
    });
    previews = jasmine.createSpyObj<LuckLabPreviews>('LuckLabPreviews', [
      'previewTrialPower',
      'previewTrialOpportunity',
      'previewTrialManifestation',
      'previewChallengeAutoResolve',
      'previewNonTrialEncounter',
    ]);
    previews.previewTrialPower.and.callFake((input) =>
      of([
        {
          heroId: null,
          testedStatKey: input.testedStatKey,
          testedStatLabel: input.testedStatKey,
          testedStatValue: input.testedStatValue,
          luckValue: input.luckValue,
          luckInfluence: input.luckValue === 0 ? 0 : 6,
          trialPower: input.testedStatValue + (input.luckValue === 0 ? 0 : 6),
          luckInfluenceFormula: {
            formulaKey: 'luck_influence',
            formulaExpression: 'DB luck expression',
          },
          trialPowerFormula: {
            formulaKey: 'trial_power',
            formulaExpression: 'DB trial expression',
          },
          explanation: 'DB Trial Power preview.',
        },
      ]),
    );
    previews.previewTrialOpportunity.and.callFake((input) =>
      of([
        chancePreview(
          'trial_opportunity',
          input.luckValue === 0 ? 10 : input.luckValue >= 50 ? 35 : 20,
          null,
          {
            projectedStepNumber: 1,
            trialOpportunityStepCap: 8,
          },
          input.luckValue,
          input.testedStatValue,
        ),
      ]),
    );
    previews.previewTrialManifestation.and.callFake((input) =>
      of([
        chancePreview(
          'trial_manifestation',
          input.luckValue === 0 ? 15 : input.luckValue >= 50 ? 55 : 30,
          input.testedStatValue + (input.luckValue === 0 ? 0 : 6),
          {},
          input.luckValue,
        ),
      ]),
    );
    previews.previewChallengeAutoResolve.and.callFake((input) =>
      of([
        chancePreview(
          'challenge_auto_resolve',
          input.luckValue === 0 ? 12 : input.luckValue >= 50 ? 44 : 24,
          input.testedStatValue + (input.luckValue === 0 ? 0 : 6),
          {
            capPercent: 80,
            difficultyMultiplier: 1,
            manualChanceReference: 35,
            rawAutoResolveSuccessChance:
              input.luckValue === 0 ? 18 : input.luckValue >= 50 ? 52 : 34,
          },
          input.luckValue,
          input.testedStatValue,
        ),
      ]),
    );
    previews.previewNonTrialEncounter.and.callFake((input) =>
      of([
        chancePreview(
          'non_trial_encounter',
          input.luckValue === 0 ? 9 : input.luckValue >= 50 ? 31 : 17,
          null,
          {
            baseChance: 8,
            capPercent: 80,
            rawEncounterChance:
              input.luckValue === 0 ? 9 : input.luckValue >= 50 ? 31 : 17,
            spiritualityValue: input.spiritualityValue,
          },
          input.luckValue,
        ),
      ]),
    );
    definitions = {
      loadDefinitions: jasmine.createSpy('loadDefinitions'),
      isLoadingDefinitions: signal(false),
      error: signal(null),
      difficultyOptions: signal([{ label: 'Easy (easy)', value: 'easy' }]),
      districtOptions: signal([{ label: 'District A (district-a)', value: 'district-a' }]),
      statOptions: signal([{ label: 'Wisdom (wisdom)', value: 'wisdom' }]),
      itemBucketOptions: signal([
        { label: 'Default drops (default-drops)', value: 'bucket-1' },
      ]),
      itemQualityOptions: signal([{ label: 'Rare (rare)', value: 'rare' }]),
      trialDefinitions: signal([
        {
          id: 'trial-1',
          key: 'maze',
          label: 'Maze',
        },
      ]),
    } as unknown as Partial<ExplorationDefinitionsState>;

    TestBed.configureTestingModule({
      providers: [
        LuckLabPageState,
        LuckLabComparisonState,
        LuckLabEncounterComparisonState,
        { provide: LuckLabState, useValue: lab },
        { provide: LuckLabPreviews, useValue: previews },
        { provide: ExplorationDefinitionsState, useValue: definitions },
      ],
    });
    state = TestBed.inject(LuckLabPageState);
  });

  it('loads definitions and starts the initial DB-owned preview', () => {
    state.load();

    expect(definitions.loadDefinitions).toHaveBeenCalled();
    expect(lab.reloadNow).toHaveBeenCalled();
  });

  it('keeps preview section errors out of the global page error', () => {
    Object.assign(lab, {
      error: signal('Reward preview failed.'),
      errorsBySection: signal({
        rewardProfile: 'Reward preview failed.',
        generatedItem: null,
        trialPower: null,
        chancePreviews: null,
      }),
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LuckLabPageState,
        LuckLabComparisonState,
        LuckLabEncounterComparisonState,
        { provide: LuckLabState, useValue: lab },
        { provide: LuckLabPreviews, useValue: previews },
        { provide: ExplorationDefinitionsState, useValue: definitions },
      ],
    });

    const pageState = TestBed.inject(LuckLabPageState);

    expect(pageState.error()).toBeNull();
    expect(lab.errorsBySection().generatedItem).toBeNull();
  });

  it('initializes shared controls from the Luck Lab default input contract', () => {
    expect(state.form.controls.luckValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.luckValue,
    );
    expect(state.form.controls.testedStatValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.testedStatValue,
    );
    expect(state.form.controls.spiritualityValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.spiritualityValue,
    );
    expect(state.form.controls.bucketProfileId.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.bucketProfileId,
    );
    expect(state.form.controls.maxQualityKey.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.maxQualityKey,
    );
  });

  it('wires shared controls to Luck Lab state inputs', () => {
    state.load();

    state.form.controls.luckValue.setValue(18);
    state.form.controls.testedStatValue.setValue(42);
    state.form.controls.spiritualityValue.setValue(7);
    state.form.controls.difficultyKey.setValue('easy');
    state.form.controls.districtCode.setValue('district-a');
    state.form.controls.testedStatKey.setValue('wisdom');
    state.form.controls.trialDefinitionId.setValue('trial-1');
    state.form.controls.bucketProfileId.setValue('bucket-1');
    state.form.controls.maxQualityKey.setValue('rare');

    expect(lab.setLuckValue).toHaveBeenCalledWith(18);
    expect(lab.setTestedStatValue).toHaveBeenCalledWith(42);
    expect(lab.setSpiritualityValue).toHaveBeenCalledWith(7);
    expect(lab.setDifficultyKey).toHaveBeenCalledWith('easy');
    expect(lab.setDistrictCode).toHaveBeenCalledWith('district-a');
    expect(lab.setTestedStatKey).toHaveBeenCalledWith('wisdom');
    expect(lab.setTrialDefinitionId).toHaveBeenCalledWith('trial-1');
    expect(lab.setBucketProfileId).toHaveBeenCalledWith('bucket-1');
    expect(lab.setMaxQualityKey).toHaveBeenCalledWith('rare');
  });

  it('exposes DB Trial Power values for the panel without difficulty or district ingredients', () => {
    state.load();

    expect(state.trialPowerEquation()).toBe('42 + 6 = 48');
    expect(state.trialPowerComparisonRows()).toEqual([
      {
        label: 'Luck 0',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
      },
      {
        label: 'Low Luck 10',
        testedStatValue: 0,
        luckValue: 10,
        luckInfluence: 6,
        trialPower: 6,
      },
      {
        label: 'Medium Luck 25',
        testedStatValue: 0,
        luckValue: 25,
        luckInfluence: 6,
        trialPower: 6,
      },
      {
        label: 'High Luck 50',
        testedStatValue: 0,
        luckValue: 50,
        luckInfluence: 6,
        trialPower: 6,
      },
      {
        label: 'Current Luck',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
      },
    ]);
  });

  it('exposes DB trial opportunity and manifestation comparison rows', () => {
    state.load();

    expect(state.trialOpportunityPreview()?.chancePercent).toBe(10);
    expect(state.trialManifestationPreview()?.chancePercent).toBe(24);
    expect(state.trialChanceComparisonRows()).toEqual([
      {
        label: 'Luck 0',
        luckValue: 0,
        luckInfluence: 0,
        opportunityChance: 10,
        opportunityStep: 1,
        opportunityStepCap: 8,
        manifestationChance: 15,
        trialPower: 0,
      },
      {
        label: 'Low Luck 10',
        luckValue: 10,
        luckInfluence: 6,
        opportunityChance: 20,
        opportunityStep: 1,
        opportunityStepCap: 8,
        manifestationChance: 30,
        trialPower: 6,
      },
      {
        label: 'Medium Luck 25',
        luckValue: 25,
        luckInfluence: 6,
        opportunityChance: 20,
        opportunityStep: 1,
        opportunityStepCap: 8,
        manifestationChance: 30,
        trialPower: 6,
      },
      {
        label: 'High Luck 50',
        luckValue: 50,
        luckInfluence: 6,
        opportunityChance: 35,
        opportunityStep: 1,
        opportunityStepCap: 8,
        manifestationChance: 55,
        trialPower: 6,
      },
      {
        label: 'Current Luck',
        luckValue: 0,
        luckInfluence: 0,
        opportunityChance: 10,
        opportunityStep: 1,
        opportunityStepCap: 8,
        manifestationChance: 15,
        trialPower: 0,
      },
    ]);
  });

  it('exposes DB challenge auto-resolve values and comparison rows', () => {
    state.load();

    expect(state.autoResolvePreview()?.chancePercent).toBe(18);
    expect(state.autoResolveContext()).toEqual({
      capPercent: 80,
      difficultyMultiplier: 1,
      manualChanceReference: 30,
      rawChance: 28,
    });
    expect(state.autoResolveComparisonRows()).toEqual([
      {
        label: 'Luck 0',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
        finalChance: 12,
        capPercent: 80,
        rawChance: 18,
        manualChanceReference: 35,
      },
      {
        label: 'Low Luck 10',
        testedStatValue: 0,
        luckValue: 10,
        luckInfluence: 6,
        trialPower: 6,
        finalChance: 24,
        capPercent: 80,
        rawChance: 34,
        manualChanceReference: 35,
      },
      {
        label: 'Medium Luck 25',
        testedStatValue: 0,
        luckValue: 25,
        luckInfluence: 6,
        trialPower: 6,
        finalChance: 24,
        capPercent: 80,
        rawChance: 34,
        manualChanceReference: 35,
      },
      {
        label: 'High Luck 50',
        testedStatValue: 0,
        luckValue: 50,
        luckInfluence: 6,
        trialPower: 6,
        finalChance: 44,
        capPercent: 80,
        rawChance: 52,
        manualChanceReference: 35,
      },
      {
        label: 'Current Luck',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
        finalChance: 12,
        capPercent: 80,
        rawChance: 18,
        manualChanceReference: 35,
      },
    ]);
  });

  it('exposes DB encounter fallback values and comparison rows', () => {
    state.load();

    expect(state.encounterPreview()?.chancePercent).toBe(14);
    expect(state.encounterContext()).toEqual({
      baseChance: 8,
      capPercent: 80,
      rawChance: 14,
      spiritualityValue: 0,
    });
    expect(state.encounterComparisonRows()).toEqual([
      {
        label: 'Luck 0',
        luckValue: 0,
        luckInfluence: 0,
        baseChance: 8,
        rawChance: 9,
        finalChance: 9,
        capPercent: 80,
      },
      {
        label: 'Low Luck 10',
        luckValue: 10,
        luckInfluence: 6,
        baseChance: 8,
        rawChance: 17,
        finalChance: 17,
        capPercent: 80,
      },
      {
        label: 'Medium Luck 25',
        luckValue: 25,
        luckInfluence: 6,
        baseChance: 8,
        rawChance: 17,
        finalChance: 17,
        capPercent: 80,
      },
      {
        label: 'High Luck 50',
        luckValue: 50,
        luckInfluence: 6,
        baseChance: 8,
        rawChance: 31,
        finalChance: 31,
        capPercent: 80,
      },
      {
        label: 'Current Luck',
        luckValue: 0,
        luckInfluence: 0,
        baseChance: 8,
        rawChance: 9,
        finalChance: 9,
        capPercent: 80,
      },
    ]);
  });

});

function chancePreview(
  surfaceKey: string,
  chancePercent: number,
  trialPower: number | null,
  contextJson: Record<string, unknown> = {},
  luckValue = 18,
  testedStatValue = 42,
): LuckChancePreview {
  return {
    surfaceKey,
    categoryKey: surfaceKey === 'trial_manifestation' ? 'trial' : 'exploration',
    testedStatKey: trialStatSurface(surfaceKey) ? 'wisdom' : null,
    testedStatValue: trialStatSurface(surfaceKey) ? testedStatValue : null,
    luckValue,
    luckInfluence: luckValue === 0 ? 0 : 6,
    trialPower,
    chancePercent,
    roll: null,
    resultKey: null,
    formula: {
      formulaKey: `${surfaceKey}_formula`,
      formulaExpression: 'DB expression',
    },
    explanation: `DB ${surfaceKey} preview.`,
    contextJson: contextJson as never,
  };
}

function trialStatSurface(surfaceKey: string): boolean {
  return surfaceKey === 'trial_manifestation' || surfaceKey === 'challenge_auto_resolve';
}
