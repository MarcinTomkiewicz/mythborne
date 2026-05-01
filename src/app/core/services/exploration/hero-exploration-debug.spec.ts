import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { HeroExplorationDebug } from './hero-exploration-debug';

describe('HeroExplorationDebug', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: HeroExplorationDebug;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'create',
      'update',
      'delete',
    ]);
    backend.rpc.and.callFake(((functionName: string) => {
      switch (functionName) {
        case RPC.get_hero_exploration_debug_state:
          return of(debugStateJson());
        case RPC.add_hero_remaining_actions:
          return of([remainingActionsRow()]);
        case RPC.reset_hero_exploration:
          return of(2);
        case RPC.skip_hero_exploration_step_timer:
          return of([stepResolutionRow()]);
        case RPC.test_grant_reward_profile_to_hero:
          return of([rewardGrantRow()]);
        case RPC.set_next_hero_exploration_outcome_override:
          return of([outcomeOverrideRow()]);
        case RPC.force_complete_hero_exploration_challenge_attempt:
          return of([challengeCompletionRow()]);
        default:
          return of(null);
      }
    }) as Backend['rpc']);

    TestBed.configureTestingModule({
      providers: [HeroExplorationDebug, { provide: Backend, useValue: backend }],
    });
    service = TestBed.inject(HeroExplorationDebug);
  });

  it('loads debug state through server-scoped RPC and guarded JSON mapper', async () => {
    const result = await firstValueFrom(
      service.getDebugState({
        serverId: 'server-1',
        heroId: 'hero-1',
        explorationDate: '2026-05-01',
      }),
    );

    expect(result.serverId).toBe('server-1');
    expect(result.explorations[0].activeStep?.id).toBe('step-1');
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_exploration_debug_state, {
      p_server_id: 'server-1',
      p_hero_id: 'hero-1',
      p_exploration_date: '2026-05-01',
    });
  });

  it('runs exploration sandbox helpers only through approved RPCs', async () => {
    await firstValueFrom(
      service.addRemainingActions({
        serverId: 'server-1',
        heroId: 'hero-1',
        actionKind: 'trial',
        amount: 2,
        actionDate: '2026-05-01',
        reason: 'Test extra trials.',
      }),
    );
    await firstValueFrom(
      service.resetExploration({
        serverId: 'server-1',
        heroId: 'hero-1',
        difficultyKey: 'easy',
        explorationDate: '2026-05-01',
        reason: 'Reset test run.',
      }),
    );
    await firstValueFrom(
      service.skipStepTimer({
        serverId: 'server-1',
        stepId: 'step-1',
        reason: 'Timer smoke.',
      }),
    );
    await firstValueFrom(
      service.testGrantRewardProfileToHero({
        serverId: 'server-1',
        heroId: 'hero-1',
        rewardProfileId: 'profile-1',
        reason: 'Reward smoke.',
      }),
    );
    await firstValueFrom(
      service.setNextOutcomeOverride({
        serverId: 'server-1',
        heroId: 'hero-1',
        difficultyKey: 'easy',
        forcedOutcomeKind: 'trial',
        trialDefinitionId: 'trial-1',
        forceManifestationStatus: 'manifested',
        expiresInMinutes: 30,
        reason: 'Force trial.',
      }),
    );
    await firstValueFrom(
      service.forceCompleteChallengeAttempt({
        serverId: 'server-1',
        challengeAttemptId: 'challenge-1',
        success: true,
        reason: 'Complete test challenge.',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.add_hero_remaining_actions, {
      p_server_id: 'server-1',
      p_hero_id: 'hero-1',
      p_action_kind: 'trial',
      p_amount: 2,
      p_action_date: '2026-05-01',
      p_reason: 'Test extra trials.',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.reset_hero_exploration, {
      p_server_id: 'server-1',
      p_hero_id: 'hero-1',
      p_difficulty_key: 'easy',
      p_exploration_date: '2026-05-01',
      p_reason: 'Reset test run.',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.skip_hero_exploration_step_timer, {
      p_server_id: 'server-1',
      p_step_id: 'step-1',
      p_reason: 'Timer smoke.',
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.test_grant_reward_profile_to_hero, {
      p_server_id: 'server-1',
      p_hero_id: 'hero-1',
      p_reward_profile_id: 'profile-1',
      p_reason: 'Reward smoke.',
    });
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.set_next_hero_exploration_outcome_override,
      {
        p_server_id: 'server-1',
        p_hero_id: 'hero-1',
        p_difficulty_key: 'easy',
        p_forced_outcome_kind: 'trial',
        p_trial_definition_id: 'trial-1',
        p_force_manifestation_status: 'manifested',
        p_expires_in_minutes: 30,
        p_reason: 'Force trial.',
      },
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.force_complete_hero_exploration_challenge_attempt,
      {
        p_server_id: 'server-1',
        p_challenge_attempt_id: 'challenge-1',
        p_success: true,
        p_reason: 'Complete test challenge.',
      },
    );
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });
});

function debugStateJson() {
  return {
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationDate: '2026-05-01',
    counters: [dailyCounterJson()],
    explorations: [
      {
        exploration: explorationJson(),
        remainingTrials: 2,
        currentNode: nodeJson(),
        edges: [],
        activeStep: stepJson(),
        activeChallenge: challengeJson(),
        activeEffect: null,
        recentSteps: [stepJson()],
        recentChallenges: [challengeJson()],
        testOverrides: [],
      },
    ],
  };
}

function dailyCounterJson() {
  return {
    id: 'counter-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    actionKind: 'trial',
    actionDate: '2026-05-01',
    remainingCount: 2,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function explorationJson() {
  return {
    id: 'exploration-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    difficultyKey: 'easy',
    districtCode: 'district-a',
    explorationDate: '2026-05-01',
    status: 'active',
    currentNodeId: 'node-1',
    trialDryStepCount: 0,
    metadataJson: {},
    startedAt: '2026-05-01T10:00:00.000Z',
    completedAt: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function nodeJson() {
  return {
    id: 'node-1',
    serverId: 'server-1',
    explorationId: 'exploration-1',
    parentNodeId: null,
    descriptionId: null,
    label: 'Crossroads',
    createdSequence: 1,
    distanceFromRoot: 0,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function stepJson() {
  return {
    id: 'step-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    edgeId: 'edge-1',
    fromNodeId: 'node-1',
    toNodeId: 'node-2',
    directionKey: 'north',
    stepKind: 'movement',
    status: 'pending',
    outcomeKind: 'known_path',
    difficultyKey: 'easy',
    districtCode: 'district-a',
    trialDefinitionId: null,
    encounterDefinitionId: null,
    trialOpportunityChance: null,
    trialOpportunityRoll: null,
    encounterChance: null,
    encounterRoll: null,
    metadataJson: {},
    startedAt: '2026-05-01T10:00:00.000Z',
    resolvesAt: '2026-05-01T10:05:00.000Z',
    resolvedAt: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function challengeJson() {
  return {
    id: 'challenge-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    stepId: 'step-1',
    challengeKind: 'trial',
    status: 'active',
    difficultyKey: 'easy',
    districtCode: 'district-a',
    trialDefinitionId: 'trial-1',
    encounterDefinitionId: null,
    minigameKey: null,
    testedStatKey: null,
    manifestationStatus: 'manifested',
    manifestationChance: null,
    manifestationRoll: null,
    manualDeadlineAt: null,
    completionMode: null,
    performanceRating: null,
    score: null,
    success: null,
    rewardGrantId: null,
    autoResolveChance: null,
    autoResolveRoll: null,
    detailsJson: {},
    metadataJson: {},
    startedAt: '2026-05-01T10:00:00.000Z',
    completedAt: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function remainingActionsRow() {
  return {
    server_id: 'server-1',
    hero_id: 'hero-1',
    action_kind: 'trial',
    action_date: '2026-05-01',
    remaining_count: 3,
    counter_id: 'counter-1',
  };
}

function stepResolutionRow() {
  return {
    step_id: 'step-1',
    exploration_id: 'exploration-1',
    current_node_id: 'node-2',
    to_node_id: 'node-2',
    status: 'resolved',
    outcome_kind: 'known_path',
    trial_definition_id: null,
    encounter_definition_id: null,
    challenge_attempt_id: null,
    remaining_trials: 1,
    trial_dry_step_count: 0,
    metadata_json: {},
  };
}

function rewardGrantRow() {
  return {
    reward_grant_id: 'grant-1',
    reward_profile_id: 'profile-1',
    recipient_hero_id: 'hero-1',
    status: 'granted',
    entries_json: [],
  };
}

function outcomeOverrideRow() {
  return {
    override_id: 'override-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    difficulty_key: 'easy',
    forced_outcome_kind: 'trial',
    trial_definition_id: 'trial-1',
    encounter_definition_id: null,
    force_manifestation_status: 'manifested',
    expires_at: '2026-05-01T10:30:00.000Z',
  };
}

function challengeCompletionRow() {
  return {
    challenge_attempt_id: 'challenge-1',
    completion_mode: 'force',
    exploration_status: 'active',
    remaining_trials: 1,
    reward_grant_id: 'reward-1',
    status: 'completed',
    success: true,
  };
}
