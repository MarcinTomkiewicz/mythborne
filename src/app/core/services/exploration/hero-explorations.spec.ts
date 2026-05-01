import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { HeroExplorations } from './hero-explorations';

describe('HeroExplorations', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: HeroExplorations;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'rpc',
      'create',
      'update',
      'delete',
    ]);
    backend.getAll.and.returnValue(of([difficultyRow()]));
    backend.rpc.and.callFake(((functionName: string) => {
      switch (functionName) {
        case RPC.get_hero_exploration_state:
          return of(playerStateJson());
        case RPC.start_or_get_hero_exploration:
          return of([startRow()]);
        case RPC.preview_trial_opportunity_curve:
          return of([trialOpportunityPreviewRow()]);
        default:
          return of(null);
      }
    }) as Backend['rpc']);

    TestBed.configureTestingModule({
      providers: [
        HeroExplorations,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroExplorations);
  });

  it('loads active difficulty tiers from DB dictionaries', async () => {
    const result = await firstValueFrom(service.getActiveDifficultyTiers());

    expect(result[0].key).toBe('easy');
    expect(result[0].helperText).toBe('Short steps.');
    expect(backend.getAll).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        table: TABLES.exploration_difficulty_tiers,
        camelCase: false,
      }),
    );
  });

  it('reads player exploration state through typed RPC and guarded JSON mapper', async () => {
    const result = await firstValueFrom(
      service.getHeroExplorationState({
        heroId: 'hero-1',
        difficultyKey: 'easy',
      }),
    );

    expect(result.hasExploration).toBeFalse();
    expect(result.remainingTrials).toBe(2);
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
  });

  it('starts exploration through RPC before refreshing the canonical state', async () => {
    await firstValueFrom(
      service.startOrGetHeroExploration({
        heroId: 'hero-1',
        difficultyKey: 'easy',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.start_or_get_hero_exploration, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('loads trial opportunity curve as read-only preview data', async () => {
    const result = await firstValueFrom(
      service.previewTrialOpportunityCurve({
        difficultyKey: 'easy',
        stepsToPreview: 3,
      }),
    );

    expect(result[0].explanation).toBe('Preview only.');
    expect(backend.rpc).toHaveBeenCalledWith(RPC.preview_trial_opportunity_curve, {
      p_difficulty_key: 'easy',
      p_steps_to_preview: 3,
    });
  });
});

function difficultyRow(): Row<'exploration_difficulty_tiers'> {
  return {
    key: 'easy',
    label: 'Easy',
    description: 'Low-risk exploration.',
    helper_text: 'Short steps.',
    admin_description: null,
    sort_order: 10,
    is_active: true,
    step_duration_multiplier: 1,
    trial_reward_multiplier: 1,
    encounter_reward_multiplier: 1,
    trial_opportunity_step_cap: 3,
    metadata_json: {},
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function playerStateJson() {
  return {
    hasExploration: false,
    heroId: 'hero-1',
    difficultyKey: 'easy',
    explorationDate: '2026-05-01',
    remainingTrials: 2,
  };
}

function startRow() {
  return {
    exploration_id: 'exploration-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    difficulty_key: 'easy',
    exploration_date: '2026-05-01',
    status: 'active',
    current_node_id: 'node-1',
    trial_dry_step_count: 0,
    remaining_trials: 2,
  };
}

function trialOpportunityPreviewRow() {
  return {
    difficulty_key: 'easy',
    difficulty_label: 'Easy',
    projected_step_number: 1,
    dry_step_count: 0,
    trial_opportunity_chance: 25,
    trial_opportunity_step_cap: 3,
    is_guaranteed_by_step_cap: false,
    explanation: 'Preview only.',
  };
}
