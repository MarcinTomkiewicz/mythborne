import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { SubmitExplorationChallengeCombatResolutionRpcRow } from '../../types/exploration-runtime-rpc.types';
import { Row } from '../../types/supabase.types';
import { mapSubmitExplorationChallengeCombatResolutionResult } from '../../utils/exploration-runtime-rpc';
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
        case RPC.start_hero_exploration_step:
          return of([startStepRow()]);
        case RPC.resolve_hero_exploration_step:
          return of([resolveStepRow()]);
        case RPC.complete_hero_exploration_challenge_attempt:
          return of([completeChallengeRow()]);
        case RPC.auto_resolve_hero_exploration_challenge_attempt:
          return of([autoResolveChallengeRow()]);
        case RPC.submit_exploration_challenge_combat_resolution:
          return of([combatResolutionRow()]);
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

  it('starts movement steps through RPC before refreshing the canonical state', async () => {
    await firstValueFrom(
      service.startHeroExplorationStep({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        explorationId: 'exploration-1',
        edgeId: 'edge-1',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.start_hero_exploration_step, {
      p_exploration_id: 'exploration-1',
      p_edge_id: 'edge-1',
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

  it('submits exploration combat resolution through the DB-owned resolver only with timing input', async () => {
    const workflow = await firstValueFrom(
      service.submitExplorationChallengeCombatResolution({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        challengeAttemptId: 'challenge-1',
        timingHitsJson: [{ indicatorPosition: 50 }],
        requestId: 'request-1',
      }),
    );

    expect(workflow.result).toEqual(
      jasmine.objectContaining({
        challengeAttemptId: 'challenge-1',
        combatResultId: 'combat-result-1',
        combatOutcome: 'initiator_victory',
        success: true,
        remainingTrials: 1,
        turnsCompleted: 3,
        participantsCreated: 2,
        attacksCreated: 6,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.submit_exploration_challenge_combat_resolution,
      {
        p_challenge_attempt_id: 'challenge-1',
        p_timing_hits_json: [{ indicatorPosition: 50 }],
        p_request_id: 'request-1',
      },
    );
    const combatRpcArgs = backend.rpc.calls.all()
      .find((call) =>
        call.args[0] === RPC.submit_exploration_challenge_combat_resolution,
      )?.args[1];

    expect(JSON.stringify(combatRpcArgs)).not.toContain('damage');
    expect(JSON.stringify(combatRpcArgs)).not.toContain('equipment');
    expect(JSON.stringify(combatRpcArgs)).not.toContain('opponent');
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_state, {
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
    });
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('maps DB draw combat resolution as failed PvE challenge completion', () => {
    const result = mapSubmitExplorationChallengeCombatResolutionResult(
      combatResolutionRow({ outcome: 'draw', success: true }),
    );

    expect(result.combatOutcome).toBe('draw');
    expect(result.success).toBeFalse();
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
    trial_definition_id: null,
    encounter_definition_id: null,
    challenge_attempt_id: null,
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

function combatResolutionRow(
  patch: Partial<SubmitExplorationChallengeCombatResolutionRpcRow> = {},
): SubmitExplorationChallengeCombatResolutionRpcRow {
  return {
    attacks_created: 6,
    challenge_attempt_id: 'challenge-1',
    combat_result_id: 'combat-result-1',
    completion_mode: 'combat',
    exploration_status: 'active',
    metadata_json: {},
    outcome: 'initiator_victory',
    participant_stats_created: 2,
    participants_created: 2,
    remaining_trials: 1,
    reward_grant_id: 'reward-1',
    status: 'completed',
    success: true,
    turns_completed: 3,
    ...patch,
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
