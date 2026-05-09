import {
  toPreviewRewardGeneratedItemLuckRpcArgs,
  toSimulateTrialOpportunityRunsRpcArgs,
} from './exploration-preview-rpc';

describe('exploration preview RPC args mappers', () => {
  it('maps Luck-aware generated item preview args with shared optional integer helpers', () => {
    expect(toPreviewRewardGeneratedItemLuckRpcArgs({
      bucketProfileId: ' bucket-1 ',
      maxQualityKey: ' rare ',
      previewCount: 2.9,
      luckValue: 12.8,
    })).toEqual({
      p_bucket_profile_id: 'bucket-1',
      p_max_quality_key: 'rare',
      p_preview_count: 2,
      p_luck_value: 12,
    });
  });

  it('omits invalid optional integer values instead of fallbacking locally', () => {
    expect(toSimulateTrialOpportunityRunsRpcArgs({
      difficultyKey: 'easy',
      startingDryStepCount: -1,
      maxStepsPerRun: 0,
      runCount: Number.NaN,
      includeRollHistory: false,
    })).toEqual({
      p_difficulty_key: 'easy',
      p_include_roll_history: false,
    });
  });
});
