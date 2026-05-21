import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Row } from '../../types/supabase.types';
import {
  mapResolveHeroExplorationStepResult,
  toStartOrGetHeroExplorationAndStartInitialStepRpcArgs,
  toStartHeroExplorationStepRpcArgs,
} from '../../utils/exploration-runtime-rpc';
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
        case RPC.get_hero_pending_combat_effect_state:
          return of([pendingCombatEffectRow()]);
        case RPC.start_or_get_hero_exploration:
          return of([startRow()]);
        case RPC.start_or_get_hero_exploration_and_start_initial_step:
          return of(playerStateJson({
            hasExploration: true,
            exploration: {
              id: 'exploration-1',
              difficultyKey: 'easy',
              status: 'active',
              currentNodeId: 'node-1',
              trialDryStepCount: 0,
            },
            activeStep: {
              id: 'step-1',
              stepKind: 'movement',
              status: 'pending',
              startedAt: '2026-05-01T10:00:00.000Z',
              resolvesAt: '2026-05-01T10:05:00.000Z',
            },
          }));
        case RPC.start_hero_exploration_step:
          return of([startStepRow()]);
        case RPC.resolve_hero_exploration_step:
          return of([resolveStepRow()]);
        case RPC.complete_hero_exploration_challenge_attempt:
          return of([completeChallengeRow()]);
        case RPC.auto_resolve_hero_exploration_challenge_attempt:
          return of([autoResolveChallengeRow()]);
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

  it('reads active combat effect state without requiring exploration difficulty', async () => {
    const result = await firstValueFrom(
      service.getHeroPendingCombatEffectState('hero-1'),
    );

    expect(result[0]).toEqual(jasmine.objectContaining({
      effectId: 'effect-1',
      effectKind: 'buff',
      playerSummary: 'Blessing: +10% defense',
    }));
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_pending_combat_effect_state,
      { p_hero_id: 'hero-1' },
    );
  });

  it('reads latest trial counter from daily action counters without exploration difficulty', async () => {
    backend.getAll.and.returnValue(of([dailyActionCounterRow()]));

    const result = await firstValueFrom(
      service.getHeroTrialCounter({
        heroId: 'hero-1',
        serverId: 'server-1',
      }),
    );

    expect(result?.remainingCount).toBe(3);
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.hero_daily_action_counters,
      filters: jasmine.objectContaining({
        heroId: jasmine.objectContaining({ value: 'hero-1' }),
        serverId: jasmine.objectContaining({ value: 'server-1' }),
        actionKind: jasmine.objectContaining({ value: 'trial' }),
      }),
      orderBy: [
        { column: 'actionDate', ascending: false },
        { column: 'updatedAt', ascending: false },
      ],
      range: { from: 0, to: 0 },
      camelCase: false,
    }));
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

  it('starts movement steps through RPC before refreshing the canonical state', async () => {
    await firstValueFrom(
      service.startHeroExplorationStep({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        explorationId: 'exploration-1',
        edgeId: 'edge-1',
        stepKind: 'edge',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.start_hero_exploration_step, {
      p_exploration_id: 'exploration-1',
      p_edge_id: 'edge-1',
      p_step_kind: 'edge',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('resolves ready movement steps through RPC before refreshing the canonical state', async () => {
    const workflow = await firstValueFrom(
      service.resolveHeroExplorationStep({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        stepId: 'step-1',
      }),
    );

    expect(workflow.result).toEqual(
      jasmine.objectContaining({
        stepId: 'step-1',
        outcomeKind: 'nothing',
        remainingTrials: 1,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(RPC.resolve_hero_exploration_step, {
      p_step_id: 'step-1',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('starts or gets exploration and initial step through the canonical initial workflow RPC', async () => {
    const result = await firstValueFrom(
      service.startOrGetHeroExplorationAndStartInitialStep({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        requestId: 'request-1',
      }),
    );

    expect(result.activeStep?.id).toBe('step-1');
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.start_or_get_hero_exploration_and_start_initial_step,
      {
        p_hero_id: 'hero-1',
        p_difficulty_key: 'easy',
        p_request_id: 'request-1',
      },
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.start_hero_exploration_step,
      jasmine.anything(),
    );
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('starts backtrack steps through RPC before refreshing the canonical state', async () => {
    await firstValueFrom(
      service.startHeroExplorationStep({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        explorationId: 'exploration-1',
        edgeId: null,
        stepKind: 'backtrack',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.start_hero_exploration_step, {
      p_exploration_id: 'exploration-1',
      p_edge_id: null,
      p_step_kind: 'backtrack',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('requires step kind when building directed movement step RPC args', () => {
    expect(() =>
      toStartHeroExplorationStepRpcArgs({
        explorationId: 'exploration-1',
        edgeId: 'edge-1',
        stepKind: '',
      }),
    ).toThrowError(/stepKind/);
  });

  it('requires request id when building initial start workflow RPC args', () => {
    expect(() =>
      toStartOrGetHeroExplorationAndStartInitialStepRpcArgs({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        requestId: '',
      }),
    ).toThrowError(/requestId/);
  });

  it('builds the initial start workflow RPC args without direction payload', () => {
    expect(toStartOrGetHeroExplorationAndStartInitialStepRpcArgs({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      requestId: 'request-1',
    })).toEqual({
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
      p_request_id: 'request-1',
    });
  });

  it('maps step resolution to canonical outcomes and preserves selection diagnostics', () => {
    const result = mapResolveHeroExplorationStepResult({
      ...resolveStepRow(),
      outcome_kind: 'encounter',
      encounter_definition_id: 'encounter-1',
      metadata_json: {
        selection_diagnostic: {
          outcome_kind: 'encounter',
          encounter_definition_id: 'encounter-1',
          encounter_definition_key: 'minor_resource_find',
          encounter_definition_ready: true,
          encounter_kind: 'resource',
          encounter_readiness_reasons_json: [],
          selected_at: '2026-05-01T10:10:00.000Z',
        },
      },
    });

    expect(result.outcomeKind).toBe('encounter');
    expect(result.rawOutcomeKind).toBe('encounter');
    expect(result.selectedDefinition).toEqual(jasmine.objectContaining({
      definitionKind: 'encounter',
      definitionId: 'encounter-1',
      definitionKey: 'minor_resource_find',
      encounterKind: 'resource',
    }));
    expect(result.selectionDiagnostic?.selectedAt).toBe('2026-05-01T10:10:00.000Z');
  });

  it('normalizes legacy non-Trial/Encounter step outcomes to Nothing fallback', () => {
    const result = mapResolveHeroExplorationStepResult({
      ...resolveStepRow(),
      outcome_kind: 'known_path',
    });

    expect(result.outcomeKind).toBe('nothing');
    expect(result.rawOutcomeKind).toBe('known_path');
  });

  it('completes challenge attempts through RPC before refreshing the canonical state', async () => {
    const workflow = await firstValueFrom(
      service.completeHeroExplorationChallengeAttempt({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        challengeAttemptId: 'challenge-1',
        completionMode: 'manual',
        success: true,
      }),
    );

    expect(workflow.result).toEqual(
      jasmine.objectContaining({
        challengeAttemptId: 'challenge-1',
        completionMode: 'manual',
        success: true,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.complete_hero_exploration_challenge_attempt,
      {
        p_challenge_attempt_id: 'challenge-1',
        p_completion_mode: 'manual',
        p_success: true,
      },
    );
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('auto-resolves challenge attempts through RPC before refreshing the canonical state', async () => {
    const workflow = await firstValueFrom(
      service.autoResolveHeroExplorationChallengeAttempt({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        challengeAttemptId: 'challenge-1',
      }),
    );

    expect(workflow.result).toEqual(
      jasmine.objectContaining({
        challengeAttemptId: 'challenge-1',
        completionMode: 'auto',
        autoResolveChance: 45,
        autoResolveRoll: 32,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.auto_resolve_hero_exploration_challenge_attempt,
      {
        p_challenge_attempt_id: 'challenge-1',
      },
    );
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

function playerStateJson(patch: Record<string, unknown> = {}) {
  return {
    hasExploration: false,
    heroId: 'hero-1',
    difficultyKey: 'easy',
    explorationDate: '2026-05-01',
    remainingTrials: 2,
    ...patch,
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

function startStepRow() {
  return {
    step_id: 'step-1',
    exploration_id: 'exploration-1',
    edge_id: 'edge-1',
    from_node_id: 'node-1',
    to_node_id: 'node-2',
    direction_key: 'north',
    step_kind: 'movement',
    status: 'pending',
    outcome_kind: 'none',
    started_at: '2026-05-01T10:00:00.000Z',
    resolves_at: '2026-05-01T10:05:00.000Z',
  };
}

function resolveStepRow() {
  return {
    step_id: 'step-1',
    exploration_id: 'exploration-1',
    current_node_id: 'node-2',
    to_node_id: 'node-2',
    status: 'resolved',
    outcome_kind: 'nothing',
    trial_definition_id: '',
    encounter_definition_id: '',
    challenge_attempt_id: '',
    remaining_trials: 1,
    trial_dry_step_count: 1,
    metadata_json: {},
  };
}

function completeChallengeRow() {
  return {
    challenge_attempt_id: 'challenge-1',
    completion_mode: 'manual',
    exploration_status: 'active',
    remaining_trials: 1,
    reward_grant_id: 'reward-1',
    status: 'completed',
    success: true,
  };
}

function autoResolveChallengeRow() {
  return {
    auto_resolve_chance: 45,
    auto_resolve_roll: 32,
    challenge_attempt_id: 'challenge-1',
    completion_mode: 'auto',
    reward_grant_id: 'reward-1',
    status: 'completed',
    success: true,
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

function pendingCombatEffectRow() {
  return {
    applied_at: '2026-05-13T10:00:00.000Z',
    bonus_template_key: 'defense_percent',
    bonus_template_label: 'Defense percent',
    consumed_at: null,
    consumed_by_id: null,
    consumed_by_kind: null,
    effect_definition_id: 'effect-definition-1',
    effect_description: 'Defensive blessing.',
    effect_helper_text: 'Improves defense in combat.',
    effect_id: 'effect-1',
    effect_key: 'blessing',
    effect_kind: 'buff',
    effect_kind_label: 'Buff',
    effect_label: 'Blessing',
    effect_target_key: 'defense',
    effect_target_label: 'Defense',
    exploration_id: 'exploration-1',
    hero_id: 'hero-1',
    is_active: true,
    metadata_json: {},
    player_summary: 'Blessing: +10% defense',
    runtime_included: true,
    server_id: 'server-1',
    status: 'pending',
    value_display: '+10%',
  };
}

function dailyActionCounterRow(): Row<'hero_daily_action_counters'> {
  return {
    id: 'counter-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    action_kind: 'trial',
    action_date: '2026-05-13',
    remaining_count: 3,
    metadata_json: {},
    created_at: '2026-05-13T00:00:00.000Z',
    updated_at: '2026-05-13T10:00:00.000Z',
  };
}
