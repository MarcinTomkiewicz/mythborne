import { Row } from '../types/supabase.types';
import {
  mapExplorationDifficultyTier,
  mapTrialDefinition,
} from './exploration-definition-mappers';
import { mapTrialOpportunityCurvePreview } from './exploration-preview-mappers';
import { mapRewardGrantEntry, mapRewardProfileEntry } from './exploration-reward-mappers';

describe('exploration mappers', () => {
  it('maps DB-backed exploration definitions without dropping helper copy', () => {
    const difficulty = mapExplorationDifficultyTier(
      row({
        key: 'hard',
        label: 'Hard',
        description: 'Hard exploration.',
        helper_text: 'Higher rewards.',
        admin_description: 'Balance carefully.',
        sort_order: 30,
        is_active: true,
        step_duration_multiplier: 1.25,
        trial_reward_multiplier: 1.5,
        encounter_reward_multiplier: 1.2,
        trial_opportunity_step_cap: 6,
        metadata_json: { tone: 'danger' },
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T11:00:00.000Z',
      } as Row<'exploration_difficulty_tiers'>),
    );
    const trial = mapTrialDefinition(
      row({
        id: 'trial-1',
        key: 'strength_trial',
        label: 'Strength Trial',
        description: 'Lift the gate.',
        helper_text: 'Manual play can outperform auto-resolve.',
        admin_description: null,
        tested_stat_key: 'strength',
        minigame_key: 'combat',
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T11:00:00.000Z',
      } as Row<'trial_definitions'>),
    );

    expect(difficulty).toEqual(
      jasmine.objectContaining({
        key: 'hard',
        helperText: 'Higher rewards.',
        adminDescription: 'Balance carefully.',
        trialOpportunityStepCap: 6,
      }),
    );
    expect(trial).toEqual(
      jasmine.objectContaining({
        id: 'trial-1',
        testedStatKey: 'strength',
        minigameKey: 'combat',
      }),
    );
  });

  it('maps reward profile entries and grant entries from DB snapshots', () => {
    const entry = mapRewardProfileEntry(
      row({
        id: 'entry-1',
        reward_profile_id: 'profile-1',
        entry_kind: 'generated_item',
        label: 'Generated item',
        description: 'Grant an item.',
        helper_text: 'Preview is not runtime truth.',
        admin_description: null,
        amount_mode: 'range',
        min_amount: 1,
        max_amount: 3,
        resource_type: null,
        formula_id: null,
        chance_percent: 75,
        min_item_count: 1,
        max_item_count: 2,
        max_quality_key: 'outstanding',
        bucket_profile_id: 'bucket-1',
        effect_definition_id: null,
        transfer_source_role: null,
        transfer_recipient_role: null,
        sort_order: 20,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T11:00:00.000Z',
      } as Row<'reward_profile_entries'>),
    );
    const grantEntry = mapRewardGrantEntry(
      row({
        id: 'grant-entry-1',
        reward_grant_id: 'grant-1',
        reward_profile_entry_id: 'entry-1',
        entry_kind: 'generated_item',
        amount: null,
        resource_type: null,
        item_id: 'item-1',
        effect_definition_id: null,
        source_hero_id: null,
        target_hero_id: 'hero-1',
        old_value_json: null,
        new_value_json: { itemId: 'item-1' },
        metadata_json: { generated: true },
        created_at: '2026-05-01T10:00:00.000Z',
      } as Row<'reward_grant_entries'>),
    );

    expect(entry.maxQualityKey).toBe('outstanding');
    expect(entry.bucketProfileId).toBe('bucket-1');
    expect(grantEntry.itemId).toBe('item-1');
    expect(grantEntry.newValueJson as unknown).toEqual({ itemId: 'item-1' });
  });

  it('maps preview RPC rows as read-only explainability models', () => {
    const preview = mapTrialOpportunityCurvePreview({
      difficulty_key: 'easy',
      difficulty_label: 'Easy',
      projected_step_number: 3,
      dry_step_count: 2,
      trial_opportunity_chance: 35,
      trial_opportunity_step_cap: 8,
      is_guaranteed_by_step_cap: false,
      explanation: 'Chance rises with dry steps.',
    });

    expect(preview).toEqual({
      difficultyKey: 'easy',
      difficultyLabel: 'Easy',
      projectedStepNumber: 3,
      dryStepCount: 2,
      trialOpportunityChance: 35,
      trialOpportunityStepCap: 8,
      isGuaranteedByStepCap: false,
      explanation: 'Chance rises with dry steps.',
    });
  });
});

function row<T>(value: T): T {
  return value;
}
