import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
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
    backend.getAll.and.callFake(((options: { table: string }) => {
      switch (options.table) {
        case TABLES.hero_exploration_challenge_attempts:
          return of([challengeRow()]);
        case TABLES.reward_grants:
          return of([grantRow()]);
        case TABLES.reward_grant_entries:
          return of([experienceEntryRow(), itemEntryRow()]);
        case TABLES.items:
          return of([itemRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        HeroExplorationRewards,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroExplorationRewards);
  });

  it('loads latest completed challenge reward from persisted DB rows', async () => {
    const result = await firstValueFrom(
      service.getLatestChallengeReward({
        heroId: 'hero-1',
        explorationId: 'exploration-1',
      }),
    );

    expect(result?.rewardGrantId).toBe('reward-1');
    expect(result?.entries.length).toBe(2);
    expect(result?.items[0].name).toBe('Reward blade');
    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.hero_exploration_challenge_attempts,
        filters: {
          heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
          explorationId: { operator: FilterOperator.EQ, value: 'exploration-1' },
        },
        camelCase: false,
      }),
    );
    expect(backend.rpc).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('returns a no-reward result when the completed challenge has no reward grant', async () => {
    backend.getAll.and.callFake(((options: { table: string }) => {
      if (options.table === TABLES.hero_exploration_challenge_attempts) {
        return of([challengeRow({ success: false, reward_grant_id: null })]);
      }

      return of([]);
    }) as Backend['getAll']);

    const result = await firstValueFrom(
      service.getLatestChallengeReward({
        heroId: 'hero-1',
        explorationId: 'exploration-1',
      }),
    );

    expect(result?.success).toBeFalse();
    expect(result?.rewardGrant).toBeNull();
    expect(result?.entries).toEqual([]);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });
});

function challengeRow(
  patch: Partial<Row<'hero_exploration_challenge_attempts'>> = {},
): Row<'hero_exploration_challenge_attempts'> {
  return {
    id: 'challenge-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    exploration_id: 'exploration-1',
    step_id: 'step-1',
    challenge_kind: 'trial',
    status: 'completed',
    difficulty_key: 'easy',
    district_code: 'district-a',
    trial_definition_id: 'trial-1',
    encounter_definition_id: null,
    minigame_key: 'timing',
    tested_stat_key: 'dexterity',
    manifestation_status: 'manifested',
    manifestation_chance: 40,
    manifestation_roll: 12,
    manual_deadline_at: '2026-05-01T10:10:00.000Z',
    completion_mode: 'manual',
    performance_rating: 'good',
    score: 90,
    success: true,
    reward_grant_id: 'reward-1',
    auto_resolve_chance: 35,
    auto_resolve_roll: null,
    details_json: {},
    metadata_json: {},
    started_at: '2026-05-01T10:05:00.000Z',
    completed_at: '2026-05-01T10:20:00.000Z',
    created_at: '2026-05-01T10:05:00.000Z',
    updated_at: '2026-05-01T10:20:00.000Z',
    ...patch,
  };
}

function grantRow(): Row<'reward_grants'> {
  return {
    id: 'reward-1',
    server_id: 'server-1',
    recipient_hero_id: 'hero-1',
    reward_profile_id: 'profile-1',
    source_kind: 'challenge_attempt',
    source_id: 'challenge-1',
    status: 'granted',
    reason: null,
    request_id: null,
    metadata_json: {},
    granted_at: '2026-05-01T10:20:00.000Z',
    created_at: '2026-05-01T10:20:00.000Z',
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

function itemEntryRow(): Row<'reward_grant_entries'> {
  return {
    ...experienceEntryRow(),
    id: 'entry-2',
    reward_profile_entry_id: 'profile-entry-2',
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
