import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { ExplorationLabPreviews } from './exploration-lab-previews';

describe('ExplorationLabPreviews', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ExplorationLabPreviews;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.callFake(<T>(rpcName: string): any => {
      switch (rpcName) {
        case RPC.preview_trial_opportunity_curve:
          return of([trialOpportunityRow()]);
        case RPC.preview_trial_manifestation_chance:
          return of([manifestationRow()]);
        case RPC.preview_challenge_auto_resolve_success_chance:
          return of([autoResolveRow()]);
        case RPC.preview_reward_generated_item_luck:
          return of([generatedItemLuckRow()]);
        case RPC.preview_reward_profile_luck:
          return of([rewardProfileRow()]);
        case RPC.simulate_trial_opportunity_runs:
          return of([simulationRow()]);
        default:
          return of([]);
      }
    });

    TestBed.configureTestingModule({
      providers: [
        ExplorationLabPreviews,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(ExplorationLabPreviews);
  });

  it('calls all exploration lab preview RPCs without table writes', () => {
    service.previewTrialOpportunityCurve({
      difficultyKey: 'easy',
      startingDryStepCount: 1,
      stepsToPreview: 3,
    }).subscribe((rows) => expect(rows[0].difficultyKey).toBe('easy'));
    service.previewTrialManifestationChance({
      difficultyKey: 'easy',
      trialDefinitionId: 'trial-1',
      testedStatValue: 10,
      spiritualityValue: 2,
      luckValue: 1,
    }).subscribe((rows) => {
      expect(rows[0].trialDefinitionId).toBe('trial-1');
      expect(rows[0].luckInfluence).toBe(3);
      expect(rows[0].trialPower).toBe(13);
      expect(rows[0].formulaKey).toBe('trial_manifestation_chance');
    });
    service.previewChallengeAutoResolveSuccessChance({
      difficultyKey: 'easy',
      testedStatKey: 'spirituality',
      testedStatValue: 10,
    }).subscribe((rows) => {
      expect(rows[0].testedStatKey).toBe('spirituality');
      expect(rows[0].luckInfluence).toBe(3);
      expect(rows[0].trialPower).toBe(13);
      expect(rows[0].formulaKey).toBe('challenge_auto_resolve_success_chance');
    });
    service.previewRewardGeneratedItem({
      bucketProfileId: 'bucket-1',
      maxQualityKey: 'rare',
      previewCount: 2,
      luckValue: 12,
    }).subscribe((rows) => expect(rows[0].generatedName).toBe('Generated item'));
    service.previewRewardProfile({
      rewardProfileId: 'profile-1',
      previewCount: 2,
      spiritualityValue: 7,
      luckValue: 12,
    }).subscribe((rows) => expect(rows[0].rewardProfileId).toBe('profile-1'));
    service.simulateTrialOpportunityRuns({
      difficultyKey: 'easy',
      runCount: 2,
      includeRollHistory: true,
    }).subscribe((rows) => expect(rows[0].runIndex).toBe(1));

    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_trial_opportunity_curve, {
      p_difficulty_key: 'easy',
      p_starting_dry_step_count: 1,
      p_steps_to_preview: 3,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_trial_manifestation_chance, {
      p_difficulty_key: 'easy',
      p_trial_definition_id: 'trial-1',
      p_tested_stat_value: 10,
      p_spirituality_value: 2,
      p_luck_value: 1,
    });
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.preview_challenge_auto_resolve_success_chance,
      {
        p_difficulty_key: 'easy',
        p_tested_stat_key: 'spirituality',
        p_tested_stat_value: 10,
      },
    );
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_reward_generated_item_luck, {
      p_bucket_profile_id: 'bucket-1',
      p_max_quality_key: 'rare',
      p_preview_count: 2,
      p_luck_value: 12,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_reward_profile_luck, {
      p_reward_profile_id: 'profile-1',
      p_preview_count: 2,
      p_spirituality_value: 7,
      p_luck_value: 12,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.simulate_trial_opportunity_runs, {
      p_difficulty_key: 'easy',
      p_run_count: 2,
      p_include_roll_history: true,
    });
  });
});

function trialOpportunityRow() {
  return {
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    projected_step_number: 1,
    dry_step_count: 0,
    spirituality_value: 2,
    luck_value: 1,
    luck_influence: 3,
    trial_opportunity_chance: 10,
    trial_opportunity_step_cap: 5,
    formula_key: 'trial_opportunity_chance',
    formula_expression: 'base + luck_influence',
    is_guaranteed_by_step_cap: false,
    explanation: 'Preview only.',
  } as never;
}

function manifestationRow() {
  return {
    trial_definition_id: 'trial-1',
    trial_key: 'trial_spirit',
    trial_label: 'Spirit trial',
    tested_stat_key: 'spirituality',
    tested_stat_value: 10,
    difficulty_key: 'easy',
    district_code: 'district-a',
    spirituality_value: 2,
    luck_value: 1,
    luck_influence: 3,
    trial_power: 13,
    raw_manifestation_chance: 20,
    max_manifestation_chance_percent: 80,
    final_manifestation_chance: 20,
    formula_key: 'trial_manifestation_chance',
    formula_expression: 'trial_power * 1.1',
    explanation: 'Preview only.',
  } as never;
}

function autoResolveRow() {
  return {
    tested_stat_key: 'spirituality',
    tested_stat_value: 10,
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    difficulty_multiplier: 1,
    spirituality_value: 2,
    luck_value: 1,
    luck_influence: 3,
    trial_power: 13,
    raw_auto_resolve_success_chance: 30,
    cap_percent: 80,
    final_auto_resolve_success_chance: 30,
    formula_key: 'challenge_auto_resolve_success_chance',
    formula_expression: 'trial_power - penalty',
    explanation: 'Preview only.',
  } as never;
}

function generatedItemLuckRow() {
  return {
    base_id: 'base-1',
    base_key: 'blade',
    base_name: 'Blade',
    base_type_key: 'weapon',
    base_value: 20,
    bucket_index: 1,
    bucket_profile_id: 'bucket-1',
    bucket_profile_key: 'default',
    bucket_profile_name: 'Default',
    budget_before_quality_multiplier: 80,
    drachma_value: 30,
    explanation: 'Luck-aware preview only.',
    formula_context_json: { qualityFormula: 'reward_item_quality_adjusted_weight' },
    generated_name: 'Generated item',
    luck_influence: 4,
    luck_value: 12,
    prefix_affix_id: 'prefix-1',
    prefix_chance: 25,
    prefix_gold_value: 5,
    prefix_key: 'sharp',
    prefix_name: 'Sharp',
    prefix_roll: 10,
    preview_index: 1,
    quality_adjusted_weight: 18,
    quality_base_weight: 10,
    quality_key: 'rare',
    quality_label: 'Rare',
    quality_multiplier: 1.2,
    quality_roll_score: 12,
    remaining_budget_after_base: 60,
    remaining_budget_after_prefix: 55,
    remaining_budget_after_suffix: 50,
    rolled_budget: 100,
    suffix_affix_id: 'suffix-1',
    suffix_chance: 10,
    suffix_gold_value: 5,
    suffix_key: 'dawn',
    suffix_name: 'Dawn',
    suffix_roll: 80,
  } as never;
}

function rewardProfileRow() {
  return {
    preview_run_index: 1,
    reward_profile_id: 'profile-1',
    reward_profile_key: 'starter',
    reward_profile_label: 'Starter',
    reward_profile_description: 'Starter reward.',
    entry_id: 'entry-1',
    entry_kind: 'resource',
    entry_label: 'Drachma',
    entry_description: 'Coins.',
    effect_definition_id: null,
    amount_mode: 'fixed',
    resource_type: 'drachma',
    chance_percent: 100,
    chance_roll: 1,
    is_included: true,
    luck_influence: 4,
    luck_policy_json: { amountRangeLuck: true },
    luck_value: 12,
    preview_amount: 10,
    min_item_count: null,
    max_item_count: null,
    preview_item_count: null,
    max_quality_key: null,
    bucket_profile_id: null,
    formula_context_json: { formulaKey: 'reward_amount_range' },
    generated_items_preview_json: [],
    explanation: 'Preview only.',
    spirituality_value: 7,
  } as never;
}

function simulationRow() {
  return {
    run_index: 1,
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    starting_dry_step_count: 0,
    max_steps_per_run: 8,
    steps_taken: 3,
    trial_found: true,
    trial_step_number: 3,
    dry_step_count_before_final_roll: 2,
    final_dry_step_count: 0,
    final_trial_opportunity_chance: 30,
    final_trial_opportunity_roll: 10,
    trial_opportunity_step_cap: 5,
    roll_history_json: [],
    explanation: 'Preview only.',
  } as never;
}
