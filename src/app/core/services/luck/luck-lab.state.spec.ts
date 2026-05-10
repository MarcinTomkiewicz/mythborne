import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import {
  CombatLuckPreview,
  LuckChancePreview,
  LuckGeneratedItemPreview,
  LuckRngSurface,
  LuckRewardRangePreview,
  TrialPowerRead,
} from '../../domain/luck/luck.model';
import {
  DEFAULT_LUCK_LAB_INPUT,
  createUnsupportedDropDistributionSummary,
} from '../../utils/luck-lab-mappers';
import { LuckLabPreviews } from './luck-lab-previews';
import { LuckLabState } from './luck-lab.state';

describe('LuckLabState', () => {
  let previews: jasmine.SpyObj<LuckLabPreviews>;
  let state: LuckLabState;

  beforeEach(() => {
    previews = jasmine.createSpyObj<LuckLabPreviews>('LuckLabPreviews', [
      'getSurfaces',
      'previewTrialPower',
      'previewTrialOpportunity',
      'previewTrialManifestation',
      'previewChallengeAutoResolve',
      'previewNonTrialEncounter',
      'previewExplorationRngChain',
      'previewCombat',
      'previewRewardProfile',
      'previewGeneratedItem',
      'previewDropDistribution',
    ]);
    setSuccessfulPreviewDefaults();

    TestBed.configureTestingModule({
      providers: [
        LuckLabState,
        { provide: LuckLabPreviews, useValue: previews },
      ],
    });
    state = TestBed.inject(LuckLabState);
  });

  it('keeps signal input state ready for future Luck Lab UI controls', () => {
    state.setDifficultyKey('hard');
    state.setDistrictCode('district-a');
    state.setTestedStatKey('wisdom');
    state.setTrialDefinitionId('trial-1');
    state.setSelectedCombatProfileKey('default-combat');
    state.setRewardProfileId('reward-1');
    state.setBucketProfileId('bucket-1');
    state.setMaxQualityKey('rare');
    state.setPreviewCount(4);
    state.setDryStepCount(2);
    state.setStepsToPreview(6);

    expect(state.input()).toEqual({
      ...DEFAULT_LUCK_LAB_INPUT,
      difficultyKey: 'hard',
      districtCode: 'district-a',
      testedStatKey: 'wisdom',
      trialDefinitionId: 'trial-1',
      selectedCombatProfileKey: 'default-combat',
      rewardProfileId: 'reward-1',
      bucketProfileId: 'bucket-1',
      maxQualityKey: 'rare',
      previewCount: 4,
      dryStepCount: 2,
      stepsToPreview: 6,
    });
    state.reloadNow();
  });

  it('debounces slider-style input changes before reloading previews', async () => {
    state.setLuckValue(10);
    state.setLuckValue(20);
    state.schedulePreviewReload(20);

    await delay(15);
    expect(previews.getSurfaces).not.toHaveBeenCalled();

    await delay(10);

    expect(previews.previewTrialPower).toHaveBeenCalledOnceWith({
      ...DEFAULT_LUCK_LAB_INPUT,
      luckValue: 20,
    });
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale section responses', () => {
    const firstTrialPower = new Subject<TrialPowerRead[]>();
    const secondTrialPower = new Subject<TrialPowerRead[]>();
    previews.previewTrialPower.and.returnValues(firstTrialPower, secondTrialPower);

    state.reloadNow();
    state.setLuckValue(12);
    state.reloadNow();

    firstTrialPower.next([trialPowerRow(1)]);
    firstTrialPower.complete();
    expect(state.result().trialPower).toBeNull();

    secondTrialPower.next([trialPowerRow(12)]);
    secondTrialPower.complete();
    expect(state.result().trialPower?.luckValue).toBe(12);
  });

  it('keeps partial failures section-specific', () => {
    previews.previewCombat.and.returnValue(
      throwError(() => new Error('Combat preview failed.')),
    );
    previews.previewRewardProfile.and.returnValue(
      throwError(() => new Error('Reward preview failed.')),
    );

    state.reloadNow();

    expect(state.errorsBySection().combat).toBe('Combat preview failed.');
    expect(state.errorsBySection().rewards).toBe('Reward preview failed.');
    expect(state.errorsBySection().surfaces).toBeNull();
    expect(state.errorsBySection().trialPower).toBeNull();
    expect(state.errorsBySection().dropDistribution).toBeNull();
    expect(state.result().surfaces[0].contractKey).toBe('preview_trial_opportunity_curve');
    expect(state.result().trialPower?.trialPower).toBe(34);
    expect(state.result().dropDistribution.status).toBe('unsupported');
    expect(state.result().combatPreview).toBeNull();
    expect(state.result().rewardRangePreviews).toEqual([]);
  });

  function setSuccessfulPreviewDefaults(): void {
    previews.getSurfaces.and.returnValue(of([surfaceRow()]));
    previews.previewTrialPower.and.returnValue(of([trialPowerRow(0)]));
    previews.previewTrialOpportunity.and.returnValue(of([chanceRow('trial_opportunity')]));
    previews.previewTrialManifestation.and.returnValue(of([chanceRow('trial_manifestation')]));
    previews.previewChallengeAutoResolve.and.returnValue(of([chanceRow('challenge_auto_resolve')]));
    previews.previewNonTrialEncounter.and.returnValue(of([chanceRow('non_trial_encounter')]));
    previews.previewExplorationRngChain.and.returnValue(of([chanceRow('exploration_rng_chain')]));
    previews.previewCombat.and.returnValue(of([combatRow()]));
    previews.previewRewardProfile.and.returnValue(of([rewardRow()]));
    previews.previewGeneratedItem.and.returnValue(of([generatedItemRow()]));
    previews.previewDropDistribution.and.returnValue(
      of(createUnsupportedDropDistributionSummary()),
    );
  }
});

function surfaceRow(): LuckRngSurface {
  return {
    contractKey: 'preview_trial_opportunity_curve',
    categoryKey: 'exploration',
    label: 'Trial opportunity',
    description: 'DB preview.',
    helperText: 'Preview helper.',
    rpcName: 'preview_trial_opportunity_curve',
    rpcSignature: 'preview_trial_opportunity_curve(...)',
    resultType: 'rows',
    sortOrder: 1,
    status: {
      isAvailable: true,
      isLuckAware: true,
      isLuckExcluded: false,
      isFormulaOwned: true,
      isConfigOwned: true,
      isFallback: false,
      missingConfigKeys: [],
    },
    metadataJson: {},
  };
}

function trialPowerRow(luckValue: number): TrialPowerRead {
  return {
    heroId: null,
    testedStatKey: 'wisdom',
    testedStatLabel: 'Wisdom',
    testedStatValue: 30,
    luckValue,
    luckInfluence: 4,
    trialPower: 34,
    luckInfluenceFormula: {
      formulaKey: 'luck_influence',
      formulaExpression: 'DB expression',
    },
    trialPowerFormula: {
      formulaKey: 'trial_power',
      formulaExpression: 'DB expression',
    },
    explanation: 'DB preview.',
  };
}

function chanceRow(surfaceKey: string): LuckChancePreview {
  return {
    surfaceKey,
    categoryKey: 'luck_lab',
    testedStatKey: 'wisdom',
    testedStatValue: 30,
    luckValue: 12,
    luckInfluence: 4,
    trialPower: 34,
    chancePercent: 40,
    roll: null,
    resultKey: null,
    formula: {
      formulaKey: surfaceKey,
      formulaExpression: 'DB expression',
    },
    explanation: 'DB preview.',
    contextJson: {},
  };
}

function combatRow(): CombatLuckPreview {
  return {
    attackerLuck: 12,
    attackerLuckInfluence: 4,
    defenderLuck: 0,
    defenderLuckInfluence: 0,
    hitGreenZone: 62,
    evasionChance: 7,
    criticalChance: 11,
    criticalMultiplier: 1.5,
    finalDamage: 20,
    formulasJson: {},
    explanation: 'DB preview.',
  };
}

function rewardRow(): LuckRewardRangePreview {
  return {
    previewRunIndex: 1,
    rewardProfileId: 'reward-1',
    rewardProfileKey: 'reward',
    rewardProfileLabel: 'Reward',
    rewardProfileDescription: 'Reward.',
    entryId: 'entry-1',
    entryKind: 'resource',
    entryLabel: 'Drachma',
    entryDescription: 'Coins.',
    effectDefinitionId: '',
    amountMode: 'range',
    resourceType: 'drachma',
    spiritualityValue: 4,
    luckValue: 12,
    luckInfluence: 4,
    previewAmount: 10,
    previewItemCount: 0,
    minItemCount: 0,
    maxItemCount: 0,
    maxQualityKey: 'rare',
    bucketProfileId: 'bucket-1',
    chancePercent: 100,
    chanceRoll: 1,
    isIncluded: true,
    formulaContextJson: {},
    luckPolicyJson: {},
    generatedItemsPreviewJson: [],
    explanation: 'DB preview.',
  };
}

function generatedItemRow(): LuckGeneratedItemPreview {
  return {
    previewIndex: 1,
    bucketProfileId: 'bucket-1',
    bucketProfileKey: 'default',
    bucketProfileName: 'Default',
    bucketIndex: 1,
    rolledBudget: 100,
    luckValue: 12,
    luckInfluence: 4,
    baseId: 'base-1',
    baseKey: 'blade',
    baseName: 'Blade',
    baseTypeKey: 'weapon',
    baseValue: 20,
    qualityKey: 'rare',
    qualityLabel: 'Rare',
    qualityMultiplier: 1.2,
    qualityBaseWeight: 10,
    qualityAdjustedWeight: 18,
    qualityRollScore: 12,
    prefixAffix: null,
    suffixAffix: null,
    generatedName: 'Blade',
    drachmaValue: 30,
    budgetBeforeQualityMultiplier: 80,
    remainingBudgetAfterBase: 60,
    remainingBudgetAfterPrefix: 60,
    remainingBudgetAfterSuffix: 60,
    formulaContextJson: {},
    explanation: 'DB preview.',
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
