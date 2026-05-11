import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { HeroExplorationRewards } from './hero-exploration-rewards';

describe('HeroExplorationRewards', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: HeroExplorationRewards;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'rpc',
      'create',
      'update',
      'delete',
    ]);
    backend.rpc.and.callFake(((functionName: string) => {
      if (functionName === RPC.get_exploration_challenge_reward_read_model) {
        return of([challengeRewardRow()]);
      }

      return of([]);
    }) as Backend['rpc']);

    TestBed.configureTestingModule({
      providers: [
        HeroExplorationRewards,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroExplorationRewards);
  });

  it('loads exact challenge reward through the canonical challenge reward RPC', async () => {
    const result = await firstValueFrom(
      service.getChallengeReward({ challengeAttemptId: 'challenge-1' }),
    );

    expect(result?.challengeAttemptId).toBe('challenge-1');
    expect(result?.rewardGrantId).toBe('reward-1');
    expect(result?.entries.map((entry) => entry.entryKind)).toEqual([
      'experience',
      'character_points',
      'generated_item',
    ]);
    expect(result?.items[0].name).toBe('Reward blade');
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_exploration_challenge_reward_read_model,
      { p_challenge_attempt_id: 'challenge-1' },
    );
  });

  it('requires an explicit challenge attempt id for challenge reward reads', () => {
    expect(() => service.getChallengeReward({ challengeAttemptId: '' }))
      .toThrowError('challengeAttemptId is required for exploration reward read model.');
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('returns null when the exact challenge reward RPC returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    const result = await firstValueFrom(
      service.getChallengeReward({ challengeAttemptId: 'challenge-empty' }),
    );

    expect(result).toBeNull();
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_exploration_challenge_reward_read_model,
      { p_challenge_attempt_id: 'challenge-empty' },
    );
  });

  it('loads direct step reward through the canonical step reward RPC', async () => {
    backend.rpc.and.callFake(((functionName: string, args: { p_step_id?: string }) => {
      if (functionName === RPC.get_exploration_step_reward_read_model) {
        return of([stepRewardRow({ step_id: args.p_step_id })]);
      }

      return of([]);
    }) as Backend['rpc']);

    const result = await firstValueFrom(
      service.getStepReward({ stepId: 'step-1' }),
    );

    expect(result?.stepId).toBe('step-1');
    expect(result?.outcomeKind).toBe('encounter');
    expect(result?.rewardSourceKind).toBe('exploration_step');
    expect(result?.entries.map((entry) => entry.entryKind)).toEqual([
      'experience',
      'character_points',
      'generated_item',
    ]);
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_exploration_step_reward_read_model,
      { p_step_id: 'step-1' },
    );
  });

  it('maps live-shaped canonical reward JSON payload with item_generation entries and generated item refs', async () => {
    backend.rpc.and.returnValue(of([challengeRewardRow({
      reward_entry_count: 3,
      generated_item_count: 1,
      reward_entries_json: JSON.stringify([
        {
          entry_id: 'entry-xp',
          entryKind: 'experience',
          amount: 70,
          target_hero_id: 'hero-1',
          created_at: '2026-05-01T10:20:00.000Z',
        },
        {
          entry_id: 'entry-cp',
          entryKind: 'character_points',
          amount: 70,
          target_hero_id: 'hero-1',
          created_at: '2026-05-01T10:20:00.000Z',
        },
        {
          entry_id: 'entry-item',
          entryKind: 'item_generation',
          amount: 1,
          itemId: 'item-1',
          target_hero_id: 'hero-1',
          created_at: '2026-05-01T10:20:00.000Z',
        },
      ]),
      generated_items_json: {
        rows: [
          {
            itemId: 'item-1',
            server_id: 'server-1',
            hero_id: 'hero-1',
            name: 'Reward blade',
            qualityKey: 'fine',
            qualityLabel: 'Fine',
            baseKey: 'iron_blade',
            baseName: 'Iron blade',
            prefixKey: 'sharp',
            prefixName: 'Sharp',
            suffixKey: 'focus',
            suffixName: 'of Focus',
            drachma_value: 120,
            rewardEntryIds: ['entry-item'],
            generated_at: '2026-05-01T10:20:00.000Z',
            updated_at: '2026-05-01T10:20:00.000Z',
          },
        ],
      },
    })]));

    const result = await firstValueFrom(
      service.getChallengeReward({ challengeAttemptId: 'challenge-1' }),
    );

    expect(result?.rewardEntryCount).toBe(3);
    expect(result?.entries.map((entry) => entry.entryKind)).toEqual([
      'experience',
      'character_points',
      'item_generation',
    ]);
    expect(result?.entries.find((entry) => entry.entryKind === 'item_generation')?.itemId)
      .toBe('item-1');
    expect(result?.generatedItemCount).toBe(1);
    const metadata = result?.items[0].metadataJson as Record<string, unknown> | undefined;

    expect(metadata).toEqual(jasmine.objectContaining({
      qualityLabel: 'Fine',
      baseName: 'Iron blade',
      rewardEntryIds: ['entry-item'],
    }));
  });

  it('returns DB no-reward reason from the canonical challenge reward read model', async () => {
    backend.rpc.and.returnValue(of([challengeRewardRow({
      success: false,
      reward_grant_id: null,
      reward_grant_status: null,
      reward_status_key: 'not_granted',
      reward_status_label: 'Nagroda nieprzyznana',
      reward_entries_json: [],
      reward_entry_count: 0,
      generated_items_json: [],
      generated_item_count: 0,
      no_reward_reason_key: 'challenge_failed',
      no_reward_reason_label: 'Challenge zakończony porażką',
      no_reward_reason_helper_text: 'DB nie przyznaje nagrody przy porażce.',
    })]));

    const result = await firstValueFrom(
      service.getChallengeReward({ challengeAttemptId: 'challenge-1' }),
    );

    expect(result?.success).toBeFalse();
    expect(result?.rewardGrant).toBeNull();
    expect(result?.entries).toEqual([]);
    expect(result?.noRewardReasonKey).toBe('challenge_failed');
    expect(result?.noRewardReasonLabel).toBe('Challenge zakończony porażką');
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_exploration_challenge_reward_read_model,
      { p_challenge_attempt_id: 'challenge-1' },
    );
  });
});

function challengeRewardRow(
  patch: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    challenge_attempt_id: 'challenge-1',
    challenge_kind: 'trial',
    challenge_status: 'completed',
    completed_at: '2026-05-01T10:20:00.000Z',
    completion_mode: 'manual',
    difficulty_key: 'easy',
    district_code: 'district-a',
    encounter_definition_id: null,
    encounter_key: null,
    encounter_kind: null,
    encounter_label: null,
    explanation: null,
    exploration_id: 'exploration-1',
    generated_item_count: 1,
    generated_items_json: [itemRow()],
    hero_id: 'hero-1',
    minigame_key: 'timing',
    no_reward_reason_helper_text: null,
    no_reward_reason_key: null,
    no_reward_reason_label: null,
    reward_entries_json: [
      experienceEntryRow(),
      characterPointEntryRow(),
      itemEntryRow(),
    ],
    reward_entry_count: 3,
    reward_grant_id: 'reward-1',
    reward_grant_status: 'granted',
    reward_granted_at: '2026-05-01T10:20:00.000Z',
    reward_profile_id: 'profile-1',
    reward_profile_key: 'trial_reward',
    reward_profile_label: 'Trial reward',
    reward_status_key: 'granted',
    reward_status_label: 'Nagroda przyznana',
    server_id: 'server-1',
    started_at: '2026-05-01T10:05:00.000Z',
    step_id: 'step-1',
    success: true,
    tested_stat_key: 'dexterity',
    trial_definition_id: 'trial-1',
    trial_key: 'agility_trial',
    trial_label: 'Agility Trial',
    ...patch,
  };
}

function stepRewardRow(
  patch: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    challenge_attempt_id: null,
    challenge_completion_mode: null,
    challenge_kind: null,
    challenge_status: null,
    challenge_success: null,
    difficulty_key: 'easy',
    district_code: 'district-a',
    encounter_definition_id: 'encounter-1',
    encounter_key: 'minor_resource_find',
    encounter_kind: 'resource',
    encounter_label: 'Minor resource find',
    explanation: null,
    exploration_id: 'exploration-1',
    generated_item_count: 1,
    generated_items_json: [itemRow()],
    hero_id: 'hero-1',
    no_reward_reason_helper_text: null,
    no_reward_reason_key: null,
    no_reward_reason_label: null,
    outcome_kind: 'encounter',
    resolved_at: '2026-05-01T10:20:00.000Z',
    reward_entries_json: [
      experienceEntryRow(),
      characterPointEntryRow(),
      itemEntryRow(),
    ],
    reward_entry_count: 3,
    reward_grant_id: 'reward-1',
    reward_grant_status: 'granted',
    reward_granted_at: '2026-05-01T10:20:00.000Z',
    reward_profile_id: 'profile-1',
    reward_profile_key: 'encounter_reward',
    reward_profile_label: 'Encounter reward',
    reward_source_id: 'step-1',
    reward_source_kind: 'exploration_step',
    reward_source_label: 'Resource Encounter reward',
    reward_status_key: 'granted',
    reward_status_label: 'Nagroda przyznana',
    server_id: 'server-1',
    started_at: '2026-05-01T10:05:00.000Z',
    step_id: 'step-1',
    step_kind: 'movement',
    step_status: 'resolved',
    trial_definition_id: null,
    trial_key: null,
    trial_label: null,
    ...patch,
  };
}

function experienceEntryRow(): Row<'reward_grant_entries'> {
  return {
    id: 'entry-1',
    reward_grant_id: 'reward-1',
    reward_profile_entry_id: 'profile-entry-1',
    entry_kind: 'experience',
    amount: 20,
    resource_type: null,
    item_id: null,
    effect_definition_id: null,
    source_hero_id: null,
    target_hero_id: 'hero-1',
    old_value_json: null,
    new_value_json: null,
    metadata_json: {},
    created_at: '2026-05-01T10:20:00.000Z',
  };
}

function characterPointEntryRow(): Row<'reward_grant_entries'> {
  return {
    ...experienceEntryRow(),
    id: 'entry-2',
    reward_profile_entry_id: 'profile-entry-2',
    entry_kind: 'character_points',
    amount: 70,
  };
}

function itemEntryRow(): Row<'reward_grant_entries'> {
  return {
    ...experienceEntryRow(),
    id: 'entry-3',
    reward_profile_entry_id: 'profile-entry-3',
    entry_kind: 'generated_item',
    amount: 1,
    item_id: 'item-1',
  };
}

function itemRow(): Row<'items'> {
  return {
    id: 'item-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    name: 'Reward blade',
    description: null,
    status: 'active',
    generation_base_id: 'base-1',
    generation_quality_key: 'fine',
    prefix_affix_id: 'prefix-1',
    suffix_affix_id: null,
    armory_shelf_position: 0,
    drachma_value: 120,
    metadata_json: {},
    generated_at: '2026-05-01T10:20:00.000Z',
    scrapped_at: null,
    recoverable_until: null,
    created_at: '2026-05-01T10:20:00.000Z',
    updated_at: '2026-05-01T10:20:00.000Z',
  };
}
