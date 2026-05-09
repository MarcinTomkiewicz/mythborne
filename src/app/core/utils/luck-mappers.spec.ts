import {
  GetLuckLabPreviewContractsRpcRow,
  PreviewLuckInfluenceAndTrialPowerRpcRow,
  PreviewRewardGeneratedItemLuckRpcRow,
  PreviewTrialManifestationChanceLuckRpcRow,
} from '../types/luck-rpc.types';
import {
  mapLuckRngSurface,
  mapTrialPowerRead,
  withTrialPowerStatLabel,
} from './luck-mappers';
import {
  mapRewardGeneratedItemLuckPreview,
  mapTrialManifestationChancePreview,
} from './luck-preview-mappers';

describe('luck-mappers', () => {
  it('maps DB-owned Luck surface status without inventing local categories', () => {
    const row: GetLuckLabPreviewContractsRpcRow = {
      anon_execute: false,
      authenticated_execute: true,
      contract_key: 'preview_trial_manifestation_chance',
      description: 'Trial manifestation preview',
      helper_text: 'DB-owned helper',
      is_available: true,
      label: 'Trial manifestation',
      metadata_json: {
        isLuckAware: true,
        isFormulaOwned: true,
        isConfigOwned: false,
        missingConfigKeys: ['trial_manifestation_cap'],
      },
      panel_key: 'trial',
      result_type: 'rows',
      rpc_name: 'preview_trial_manifestation_chance',
      rpc_signature: 'preview_trial_manifestation_chance(...)',
      sort_order: 20,
    };

    const surface = mapLuckRngSurface(row);

    expect(surface.contractKey).toBe('preview_trial_manifestation_chance');
    expect(surface.categoryKey).toBe('trial');
    expect(surface.rpcName).toBe('preview_trial_manifestation_chance');
    expect(surface.status.isAvailable).toBeTrue();
    expect(surface.status.isLuckAware).toBeTrue();
    expect(surface.status.isLuckExcluded).toBeNull();
    expect(surface.status.isFormulaOwned).toBeTrue();
    expect(surface.status.isConfigOwned).toBeFalse();
    expect(surface.status.isFallback).toBeNull();
    expect(surface.status.missingConfigKeys).toEqual(['trial_manifestation_cap']);
  });

  it('keeps raw Luck, Luck influence and Trial Power as separate values', () => {
    const row: PreviewLuckInfluenceAndTrialPowerRpcRow = {
      explanation: 'Luck influence is formula-backed.',
      luck_influence: 7,
      luck_influence_expression: 'floor(luckValue / 3)',
      luck_influence_formula_key: 'luck_influence',
      luck_value: 21,
      tested_stat_value: 40,
      trial_power: 47,
      trial_power_expression: 'testedStatValue + luckInfluence',
      trial_power_formula_key: 'trial_power',
    };

    const trialPower = mapTrialPowerRead(row);

    expect(trialPower.heroId).toBeNull();
    expect(trialPower.testedStatKey).toBeNull();
    expect(trialPower.testedStatLabel).toBeNull();
    expect(trialPower.testedStatValue).toBe(40);
    expect(trialPower.luckValue).toBe(21);
    expect(trialPower.luckInfluence).toBe(7);
    expect(trialPower.trialPower).toBe(47);
    expect(trialPower.luckInfluenceFormula?.formulaKey).toBe('luck_influence');
    expect(trialPower.trialPowerFormula?.formulaKey).toBe('trial_power');
    expect(trialPower.explanation).toBe('Luck influence is formula-backed.');
  });

  it('adds DB-backed stat label without changing Trial Power values', () => {
    const row: PreviewLuckInfluenceAndTrialPowerRpcRow = {
      explanation: 'DB formula output.',
      luck_influence: 6,
      luck_influence_expression: 'DB expression',
      luck_influence_formula_key: 'luck_influence',
      luck_value: 18,
      tested_stat_value: 44,
      trial_power: 50,
      trial_power_expression: 'DB expression',
      trial_power_formula_key: 'trial_power',
    };

    const mapped = withTrialPowerStatLabel(
      mapTrialPowerRead(row),
      { wisdom: 'Wisdom' },
      'wisdom',
    );

    expect(mapped.testedStatKey).toBe('wisdom');
    expect(mapped.testedStatLabel).toBe('Wisdom');
    expect(mapped.testedStatValue).toBe(44);
    expect(mapped.luckInfluence).toBe(6);
    expect(mapped.trialPower).toBe(50);
  });

  it('maps Luck-aware chance previews from DB values only', () => {
    const row: PreviewTrialManifestationChanceLuckRpcRow = {
      difficulty_key: 'normal',
      difficulty_multiplier: 1,
      district_code: 'A',
      district_modifier: 0,
      explanation: 'Manifestation chance from DB.',
      final_manifestation_chance: 63,
      formula_expression: 'trial_power * 1.1',
      formula_key: 'trial_manifestation_chance',
      luck_influence: 8,
      luck_value: 24,
      max_manifestation_chance_percent: 80,
      raw_manifestation_chance: 63,
      spirituality_value: 12,
      tested_stat_key: 'wisdom',
      tested_stat_value: 55,
      trial_definition_id: 'trial-1',
      trial_key: 'maze',
      trial_label: 'Maze',
      trial_power: 63,
    };

    const preview = mapTrialManifestationChancePreview(row);

    expect(preview.surfaceKey).toBe('trial_manifestation');
    expect(preview.categoryKey).toBe('trial');
    expect(preview.testedStatKey).toBe('wisdom');
    expect(preview.testedStatValue).toBe(55);
    expect(preview.luckValue).toBe(24);
    expect(preview.luckInfluence).toBe(8);
    expect(preview.trialPower).toBe(63);
    expect(preview.chancePercent).toBe(63);
    expect(preview.roll).toBeNull();
    expect(preview.formula?.formulaKey).toBe('trial_manifestation_chance');
    expect(preview.formula?.formulaExpression).toBe('trial_power * 1.1');
    const context = preview.contextJson as Record<string, unknown>;
    expect(context['trialDefinitionId']).toBe('trial-1');
  });

  it('maps drop Luck preview without adding rarity flags', () => {
    const row: PreviewRewardGeneratedItemLuckRpcRow = {
      base_id: 'base-1',
      base_key: 'spear',
      base_name: 'Spear',
      base_type_key: 'weapon',
      base_value: 100,
      bucket_index: 3,
      bucket_profile_id: 'bucket-1',
      bucket_profile_key: 'standard',
      bucket_profile_name: 'Standard',
      budget_before_quality_multiplier: 150,
      drachma_value: 220,
      explanation: 'Luck affected opportunity rolls.',
      formula_context_json: { qualityFormula: 'reward_item_quality_adjusted_weight' },
      generated_name: 'Fine Spear',
      luck_influence: 4,
      luck_value: 12,
      prefix_affix_id: 'prefix-1',
      prefix_chance: 25,
      prefix_gold_value: 30,
      prefix_key: 'fine',
      prefix_name: 'Fine',
      prefix_roll: 20,
      preview_index: 1,
      quality_adjusted_weight: 18,
      quality_base_weight: 10,
      quality_key: 'rare',
      quality_label: 'Rare',
      quality_multiplier: 1.2,
      quality_roll_score: 16,
      remaining_budget_after_base: 50,
      remaining_budget_after_prefix: 20,
      remaining_budget_after_suffix: 20,
      rolled_budget: 150,
      suffix_affix_id: '',
      suffix_chance: 10,
      suffix_gold_value: 0,
      suffix_key: '',
      suffix_name: '',
      suffix_roll: 90,
    };

    const preview = mapRewardGeneratedItemLuckPreview(row);

    expect(preview.previewIndex).toBe(1);
    expect(preview.bucketProfileKey).toBe('standard');
    expect(preview.luckValue).toBe(12);
    expect(preview.luckInfluence).toBe(4);
    expect(preview.qualityKey).toBe('rare');
    expect(preview.qualityBaseWeight).toBe(10);
    expect(preview.qualityAdjustedWeight).toBe(18);
    expect(preview.prefixChance).toBe(25);
    expect(preview.suffixChance).toBe(10);
    expect(preview.generatedName).toBe('Fine Spear');
    const formulaContext = preview.formulaContextJson as Record<string, unknown>;
    expect(formulaContext['qualityFormula']).toBe(
      'reward_item_quality_adjusted_weight',
    );
  });
});
