import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { LuckRngSurface, TrialPowerRead } from '../../domain/luck/luck.model';
import { DEFAULT_LUCK_LAB_INPUT } from '../../utils/luck-lab-mappers';
import { Backend } from '../backend/backend';
import { LuckRngSurfaces } from './luck-rng-surfaces';
import { LuckTrialPower } from './luck-trial-power';
import { LuckLabPreviews } from './luck-lab-previews';

describe('LuckLabPreviews', () => {
  let backend: jasmine.SpyObj<Backend>;
  let surfaces: jasmine.SpyObj<LuckRngSurfaces>;
  let trialPower: jasmine.SpyObj<LuckTrialPower>;
  let service: LuckLabPreviews;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    surfaces = jasmine.createSpyObj<LuckRngSurfaces>('LuckRngSurfaces', ['getSurfaces']);
    trialPower = jasmine.createSpyObj<LuckTrialPower>('LuckTrialPower', [
      'previewTrialPower',
    ]);

    backend.rpc.and.callFake((rpcName: string): any => {
      switch (rpcName) {
        case RPC.preview_trial_opportunity_curve:
          return of([trialOpportunityRow()]);
        case RPC.preview_trial_manifestation_chance:
          return of([manifestationRow()]);
        case RPC.preview_challenge_auto_resolve_success_chance:
          return of([autoResolveRow()]);
        case RPC.preview_non_trial_encounter_chance:
          return of([encounterRow()]);
        case RPC.preview_exploration_luck_rng_chain:
          return of([rngChainRow()]);
        case RPC.preview_combat_luck_formula_context:
          return of([combatRow()]);
        case RPC.preview_reward_profile_luck:
          return of([rewardProfileRow()]);
        case RPC.preview_reward_generated_item_luck:
          return of([generatedItemRow()]);
        default:
          return of([]);
      }
    });
    surfaces.getSurfaces.and.returnValue(of([surfaceRow()]));
    trialPower.previewTrialPower.and.returnValue(of([trialPowerRow()]));

    TestBed.configureTestingModule({
      providers: [
        LuckLabPreviews,
        { provide: Backend, useValue: backend },
        { provide: LuckRngSurfaces, useValue: surfaces },
        { provide: LuckTrialPower, useValue: trialPower },
      ],
    });
    service = TestBed.inject(LuckLabPreviews);
  });

  it('runs available Luck Lab previews through DB-owned contracts', async () => {
    const result = await firstValueFrom(
      service.previewAll({
        ...DEFAULT_LUCK_LAB_INPUT,
        difficultyKey: 'easy',
        districtCode: 'district-a',
        testedStatKey: 'wisdom',
        trialDefinitionId: 'trial-1',
        rewardProfileId: 'reward-1',
        bucketProfileId: 'bucket-1',
        maxQualityKey: 'rare',
        luckValue: 12,
        testedStatValue: 30,
        spiritualityValue: 4,
        previewCount: 2,
      }),
    );

    expect(surfaces.getSurfaces).toHaveBeenCalled();
    expect(trialPower.previewTrialPower).toHaveBeenCalled();
    expect(trialPower.previewTrialPower).toHaveBeenCalledTimes(1);
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_trial_opportunity_curve, {
      p_difficulty_key: 'easy',
      p_starting_dry_step_count: 0,
      p_steps_to_preview: 8,
      p_spirituality_value: 4,
      p_luck_value: 12,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_non_trial_encounter_chance, {
      p_difficulty_key: 'easy',
      p_district_code: 'district-a',
      p_spirituality_value: 4,
      p_luck_value: 12,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_combat_luck_formula_context, {
      p_attacker_luck: 12,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_reward_generated_item_luck, {
      p_bucket_profile_id: 'bucket-1',
      p_max_quality_key: 'rare',
      p_preview_count: 1,
      p_luck_value: 12,
    });
    expect(result.surfaces.length).toBe(1);
    expect(result.luckInfluence?.luckInfluence).toBe(4);
    expect(result.trialPower?.trialPower).toBe(34);
    expect(result.chancePreviews.map((preview) => preview.surfaceKey)).toContain(
      'non_trial_encounter',
    );
    expect(result.combatPreview?.hitGreenZone).toBe(62);
    expect(result.combatPreview?.attackerDexterity).toBe(10);
    expect(result.combatPreview?.defenderAgility).toBe(10);
    expect(result.combatPreview?.initiativeScore).toBe(10);
    expect(result.combatPreview?.rolledDamage).toBe(20);
    expect(result.generatedItemPreviews[0].prefixAffix?.key).toBe('sharp');
    expect(result.dropDistribution.status).toBe('unsupported');
  });
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

function trialPowerRow(): TrialPowerRead {
  return {
    heroId: null,
    testedStatKey: 'wisdom',
    testedStatLabel: 'Wisdom',
    testedStatValue: 30,
    luckValue: 12,
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

function trialOpportunityRow() {
  return {
    base_chance: 5,
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    difficulty_multiplier: 1,
    dry_step_count: 0,
    explanation: 'DB preview.',
    formula_expression: 'DB expression',
    formula_key: 'trial_opportunity_chance',
    is_guaranteed_by_step_cap: false,
    luck_influence: 4,
    luck_value: 12,
    per_dry_step_chance: 5,
    projected_step_number: 1,
    spirituality_value: 4,
    trial_opportunity_chance: 10,
    trial_opportunity_step_cap: 8,
  } as never;
}

function manifestationRow() {
  return {
    difficulty_key: 'easy',
    difficulty_multiplier: 1,
    district_code: 'district-a',
    district_modifier: 0,
    explanation: 'DB preview.',
    final_manifestation_chance: 40,
    formula_expression: 'DB expression',
    formula_key: 'trial_manifestation_chance',
    luck_influence: 4,
    luck_value: 12,
    max_manifestation_chance_percent: 80,
    raw_manifestation_chance: 40,
    spirituality_value: 4,
    tested_stat_key: 'wisdom',
    tested_stat_value: 30,
    trial_definition_id: 'trial-1',
    trial_key: 'maze',
    trial_label: 'Maze',
    trial_power: 34,
  } as never;
}

function autoResolveRow() {
  return {
    auto_resolve_penalty: 10,
    cap_percent: 80,
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    difficulty_multiplier: 1,
    explanation: 'DB preview.',
    final_auto_resolve_success_chance: 24,
    formula_expression: 'DB expression',
    formula_key: 'challenge_auto_resolve_success_chance',
    luck_influence: 4,
    luck_value: 12,
    manual_chance_reference: 40,
    raw_auto_resolve_success_chance: 34,
    spirituality_value: 4,
    tested_stat_key: 'wisdom',
    tested_stat_value: 30,
    trial_power: 34,
  } as never;
}

function encounterRow() {
  return {
    base_chance: 5,
    cap_percent: 80,
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    difficulty_multiplier: 1,
    district_code: 'district-a',
    district_modifier: 0,
    explanation: 'DB preview.',
    final_encounter_chance: 12,
    formula_expression: 'DB expression',
    formula_key: 'non_trial_encounter_chance',
    luck_influence: 4,
    luck_value: 12,
    raw_encounter_chance: 12,
    spirituality_value: 4,
  } as never;
}

function rngChainRow() {
  return {
    absolute_encounter_probability: 8,
    absolute_manifested_trial_probability: 20,
    absolute_unmanifested_trial_opportunity_probability: 10,
    difficulty_key: 'easy',
    district_code: 'district-a',
    dry_step_count: 0,
    encounter_chance_if_no_trial: 12,
    explanation: 'DB preview.',
    formulas_json: {},
    luck_influence: 4,
    luck_value: 12,
    non_trial_probability: 60,
    nothing_probability: 52,
    spirituality_value: 4,
    tested_stat_value: 30,
    trial_manifestation_chance_if_opportunity: 40,
    trial_opportunity_chance: 30,
    trial_power: 34,
  } as never;
}

function combatRow() {
  return {
    attack_count: 1,
    attack_index: 1,
    attacker_cunning: 10,
    attacker_dexterity: 10,
    attacker_luck: 12,
    attacker_luck_influence: 4,
    combatant_agility: 10,
    combatant_intelligence: 10,
    crit_bonus_from_items: 0,
    crit_multiplier: 1.5,
    critical_chance: 11,
    defender_agility: 10,
    defender_defense: 2,
    defender_luck: 0,
    defender_luck_influence: 0,
    evasion_bonus_from_items: 0,
    evasion_chance: 7,
    explanation: 'DB preview.',
    final_damage: 20,
    formulas_json: {},
    hit_bonus_from_items: 0,
    hit_green_zone: 62,
    initiative_score: 10,
    rolled_damage: 20,
  } as never;
}

function rewardProfileRow() {
  return {
    amount_mode: 'range',
    bucket_profile_id: 'bucket-1',
    chance_percent: 100,
    chance_roll: 1,
    effect_definition_id: '',
    entry_description: 'Coins.',
    entry_id: 'entry-1',
    entry_kind: 'resource',
    entry_label: 'Drachma',
    explanation: 'DB preview.',
    formula_context_json: {},
    generated_items_preview_json: [],
    is_included: true,
    luck_influence: 4,
    luck_policy_json: {},
    luck_value: 12,
    max_item_count: 0,
    max_quality_key: 'rare',
    min_item_count: 0,
    preview_amount: 10,
    preview_item_count: 0,
    preview_run_index: 1,
    resource_type: 'drachma',
    reward_profile_description: 'Reward.',
    reward_profile_id: 'reward-1',
    reward_profile_key: 'reward',
    reward_profile_label: 'Reward',
    spirituality_value: 4,
  } as never;
}

function generatedItemRow() {
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
    explanation: 'DB preview.',
    formula_context_json: {},
    generated_name: 'Sharp Blade',
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
    suffix_affix_id: '',
    suffix_chance: 0,
    suffix_gold_value: 0,
    suffix_key: '',
    suffix_name: '',
    suffix_roll: 0,
  } as never;
}
