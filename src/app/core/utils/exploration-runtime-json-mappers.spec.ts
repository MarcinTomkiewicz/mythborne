import { Json } from '../types/database.types';
import { Row } from '../types/supabase.types';
import {
  mapHeroExplorationDebugStateJson,
  mapHeroExplorationStateJson,
} from './exploration-runtime-json-mappers';
import { mapHeroExplorationChallengeAttempt } from './exploration-runtime-mappers';

describe('exploration runtime JSON mappers', () => {
  it('maps no-exploration player state from real RPC JSON', () => {
    const state = mapHeroExplorationStateJson({
      hasExploration: false,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 0,
    });

    expect(state.hasExploration).toBeFalse();
    expect(state.heroId).toBe('hero-1');
    expect(state.difficultyKey).toBe('easy');
    expect(state.remainingTrials).toBe(0);
    expect(state.exploration).toBeNull();
    expect(state.currentNode).toBeNull();
    expect(state.edges).toEqual([]);
    expect(state.activeStep).toBeNull();
    expect(state.activeChallenge).toBeNull();
    expect(state.activeEffect).toBeNull();
  });

  it('maps active player state from real RPC JSON', () => {
    const state = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      exploration: explorationJson(),
      currentNode: nodeJson(),
      edges: [edgeJson()],
      activeStep: stepJson({ id: 'step-1', status: 'started' }),
      activeChallenge: challengeJson(),
      activeEffect: effectJson(),
    });

    expect(state.hasExploration).toBeTrue();
    expect(state.exploration?.id).toBe('exploration-1');
    expect(state.currentNode?.id).toBe('node-1');
    expect(state.edges[0].directionKey).toBe('north');
    expect(state.activeStep?.id).toBe('step-1');
    expect(state.activeChallenge?.id).toBe('challenge-1');
    expect(state.activeEffect?.id).toBe('effect-1');
  });

  it('preserves Luck-aware exploration RNG sequence without treating nothing as a roll', () => {
    const state = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      activeStep: stepJson({
        id: 'step-2',
        status: 'resolved',
        outcomeKind: 'nothing',
        trialOpportunityChance: 35,
        trialOpportunityRoll: 70,
        encounterChance: 20,
        encounterRoll: 90,
        metadataJson: {
          rng: {
            trialOpportunity: {
              luckValue: 12,
              luckInfluence: 4,
              explanation: 'DB trial opportunity context.',
            },
            encounter: {
              luckValue: 12,
              luckInfluence: 4,
              explanation: 'DB encounter context.',
            },
          },
          luckContext: { luckValue: 12, luckInfluence: 4 },
          formulaContext: { trial: 'db_formula' },
          explanation: 'Trial opportunity failed, then encounter failed.',
          nothingFallbackReason: 'trial_and_encounter_failed',
        },
      }),
    });

    const rng = state.activeStep?.rng;

    expect(rng?.trialOpportunity.chance).toBe(35);
    expect(rng?.trialOpportunity.roll).toBe(70);
    expect(rng?.trialOpportunity.luckInfluence).toBe(4);
    expect(rng?.encounter.chance).toBe(20);
    expect(rng?.encounter.roll).toBe(90);
    expect(rng?.encounter.luckValue).toBe(12);
    expect(rng?.nothingFallback.isFallback).toBeTrue();
    expect(rng?.nothingFallback.reason).toBe('trial_and_encounter_failed');
    expect(rng?.finalOutcomeKind).toBe('nothing');
    expect(rng?.explanation).toBe('Trial opportunity failed, then encounter failed.');
  });

  it('preserves Luck-aware trial manifestation separately from trial opportunity RNG', () => {
    const state = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      activeStep: stepJson({
        id: 'step-2',
        status: 'resolved',
        outcomeKind: 'trial',
        trialOpportunityChance: 35,
        trialOpportunityRoll: 12,
        metadataJson: {
          rng: {
            trialOpportunity: {
              luckValue: 8,
              luckInfluence: 2,
              explanation: 'DB trial opportunity context.',
            },
          },
        },
      }),
      activeChallenge: challengeJson({
        manifestationChance: 60,
        manifestationRoll: 45,
        metadataJson: {
          trialManifestation: {
            luckValue: 18,
            luckInfluence: 6,
            trialPower: 46,
            configIssueKey: 'missing_manifestation_cap',
            configIssueMessage: 'Manifestation cap profile is missing.',
            formulaContext: { formulaKey: 'trial_manifestation_chance' },
            explanation: 'DB manifestation context.',
          },
        },
      }),
    });

    const stepRng = state.activeStep?.rng;
    const manifestation = state.activeChallenge?.manifestation;
    const formulaContext = manifestation?.formulaContextJson as
      | Record<string, unknown>
      | undefined;

    expect(stepRng?.trialOpportunity.chance).toBe(35);
    expect(stepRng?.trialOpportunity.luckInfluence).toBe(2);
    expect(manifestation?.chance).toBe(60);
    expect(manifestation?.roll).toBe(45);
    expect(manifestation?.status).toBe('manifested');
    expect(manifestation?.luckValue).toBe(18);
    expect(manifestation?.luckInfluence).toBe(6);
    expect(manifestation?.trialPower).toBe(46);
    expect(manifestation?.configIssueKey).toBe('missing_manifestation_cap');
    expect(manifestation?.configIssueMessage).toBe(
      'Manifestation cap profile is missing.',
    );
    expect(manifestation?.explanation).toBe('DB manifestation context.');
    expect(formulaContext?.['formulaKey']).toBe('trial_manifestation_chance');
  });

  it('maps row challenge manifestation metadata through the runtime row mapper', () => {
    const challenge = mapHeroExplorationChallengeAttempt(challengeRow({
      manifestation_chance: 65,
      manifestation_roll: 61,
      metadata_json: {
        trial_manifestation: {
          luck_value: 21,
          luck_influence: 7,
          trial_power: 47,
          config_issue_key: 'no_manifestation_candidate',
          config_issue_message: 'No eligible trial manifestation candidate.',
          explanation: 'DB row manifestation context.',
        },
      },
    }));

    expect(challenge.manifestation.chance).toBe(65);
    expect(challenge.manifestation.roll).toBe(61);
    expect(challenge.manifestation.luckValue).toBe(21);
    expect(challenge.manifestation.luckInfluence).toBe(7);
    expect(challenge.manifestation.trialPower).toBe(47);
    expect(challenge.manifestation.configIssueKey).toBe(
      'no_manifestation_candidate',
    );
    expect(challenge.manifestation.configIssueMessage).toBe(
      'No eligible trial manifestation candidate.',
    );
    expect(challenge.manifestation.explanation).toBe(
      'DB row manifestation context.',
    );
  });

  it('does not treat legacy empty/none outcomes as canonical nothing fallback', () => {
    const emptyState = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      activeStep: stepJson({
        id: 'step-empty',
        status: 'resolved',
        outcomeKind: 'empty',
      }),
    });
    const noneState = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      activeStep: stepJson({
        id: 'step-none',
        status: 'resolved',
        outcomeKind: 'none',
      }),
    });

    expect(emptyState.activeStep?.rng?.nothingFallback.isFallback).toBeFalse();
    expect(noneState.activeStep?.rng?.nothingFallback.isFallback).toBeFalse();
  });

  it('guards malformed player state arrays and objects', () => {
    const state = mapHeroExplorationStateJson({
      hasExploration: true,
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationDate: '2026-05-01',
      remainingTrials: 2,
      exploration: 'bad-object',
      currentNode: ['bad-object'],
      edges: [edgeJson(), 'bad-row'],
    });

    expect(state.exploration).toBeNull();
    expect(state.currentNode).toBeNull();
    expect(state.edges.length).toBe(1);
    expect(state.activeStep).toBeNull();
  });

  it('maps debug state as a separate aggregate shape', () => {
    const debug = mapHeroExplorationDebugStateJson({
      serverId: 'server-1',
      heroId: 'hero-1',
      explorationDate: '2026-05-01',
      counters: [
        {
          id: 'counter-1',
          serverId: 'server-1',
          heroId: 'hero-1',
          actionKind: 'trial',
          actionDate: '2026-05-01',
          remainingCount: 2,
          metadataJson: {},
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T11:00:00.000Z',
        },
      ],
      explorations: [
        {
          exploration: explorationJson(),
          remainingTrials: 2,
          currentNode: null,
          edges: [],
          activeStep: null,
          activeChallenge: null,
          activeEffect: null,
          recentSteps: [stepJson({ id: 'step-1', status: 'resolved' })],
          recentChallenges: [],
          testOverrides: [],
        },
      ],
    });

    expect(debug.counters[0].remainingCount).toBe(2);
    expect(debug.explorations[0].exploration.id).toBe('exploration-1');
    expect(debug.explorations[0].recentSteps[0].id).toBe('step-1');
  });
});

function explorationJson(): Json {
  return {
    id: 'exploration-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    difficultyKey: 'easy',
    districtCode: 'old_town',
    explorationDate: '2026-05-01',
    status: 'active',
    currentNodeId: 'node-1',
    trialDryStepCount: 2,
    metadataJson: { source: 'rpc' },
    startedAt: '2026-05-01T10:00:00.000Z',
    completedAt: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T11:00:00.000Z',
  };
}

function nodeJson(): Json {
  return {
    id: 'node-1',
    serverId: 'server-1',
    explorationId: 'exploration-1',
    parentNodeId: null,
    descriptionId: 'description-1',
    label: 'Gate',
    createdSequence: 1,
    distanceFromRoot: 0,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T11:00:00.000Z',
  };
}

function edgeJson(): Json {
  return {
    id: 'edge-1',
    serverId: 'server-1',
    explorationId: 'exploration-1',
    fromNodeId: 'node-1',
    toNodeId: null,
    directionKey: 'north',
    label: 'North',
    sortOrder: 1,
    isAvailable: true,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T11:00:00.000Z',
  };
}

function stepJson(input: {
  id: string;
  status: string;
  outcomeKind?: string;
  trialOpportunityChance?: number | null;
  trialOpportunityRoll?: number | null;
  encounterChance?: number | null;
  encounterRoll?: number | null;
  metadataJson?: Json;
}): Json {
  return {
    id: input.id,
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    edgeId: 'edge-1',
    fromNodeId: 'node-1',
    toNodeId: null,
    directionKey: 'north',
    stepKind: 'discover',
    status: input.status,
    outcomeKind: input.outcomeKind ?? 'pending',
    difficultyKey: 'easy',
    districtCode: 'old_town',
    trialDefinitionId: null,
    encounterDefinitionId: null,
    trialOpportunityChance: input.trialOpportunityChance ?? null,
    trialOpportunityRoll: input.trialOpportunityRoll ?? null,
    encounterChance: input.encounterChance ?? null,
    encounterRoll: input.encounterRoll ?? null,
    metadataJson: input.metadataJson ?? {},
    startedAt: '2026-05-01T10:05:00.000Z',
    resolvesAt: '2026-05-01T10:06:00.000Z',
    resolvedAt: input.status === 'resolved' ? '2026-05-01T10:06:00.000Z' : null,
    createdAt: '2026-05-01T10:05:00.000Z',
    updatedAt: '2026-05-01T10:05:00.000Z',
  };
}

function challengeJson(input: {
  manifestationChance?: number | null;
  manifestationRoll?: number | null;
  metadataJson?: Json;
} = {}): Json {
  return {
    id: 'challenge-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    stepId: 'step-1',
    challengeKind: 'trial',
    status: 'awaiting_manual',
    difficultyKey: 'easy',
    districtCode: 'old_town',
    trialDefinitionId: 'trial-1',
    encounterDefinitionId: null,
    minigameKey: 'combat',
    testedStatKey: 'strength',
    manifestationStatus: 'manifested',
    manifestationChance: input.manifestationChance ?? 70,
    manifestationRoll: input.manifestationRoll ?? 20,
    manualDeadlineAt: '2026-05-01T10:15:00.000Z',
    completionMode: null,
    performanceRating: null,
    score: null,
    success: null,
    rewardGrantId: null,
    autoResolveChance: 40,
    autoResolveRoll: null,
    detailsJson: {},
    metadataJson: input.metadataJson ?? {},
    startedAt: '2026-05-01T10:06:00.000Z',
    completedAt: null,
    createdAt: '2026-05-01T10:06:00.000Z',
    updatedAt: '2026-05-01T10:06:00.000Z',
  };
}

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
    status: 'awaiting_manual',
    difficulty_key: 'easy',
    district_code: 'old_town',
    trial_definition_id: 'trial-1',
    encounter_definition_id: null,
    minigame_key: 'combat',
    tested_stat_key: 'strength',
    manifestation_status: 'manifested',
    manifestation_chance: 70,
    manifestation_roll: 20,
    manual_deadline_at: '2026-05-01T10:15:00.000Z',
    completion_mode: null,
    performance_rating: null,
    score: null,
    success: null,
    reward_grant_id: null,
    auto_resolve_chance: 40,
    auto_resolve_roll: null,
    details_json: {},
    metadata_json: {},
    started_at: '2026-05-01T10:06:00.000Z',
    completed_at: null,
    created_at: '2026-05-01T10:06:00.000Z',
    updated_at: '2026-05-01T10:06:00.000Z',
    ...patch,
  };
}

function effectJson(): Json {
  return {
    id: 'effect-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    effectDefinitionId: 'effect-definition-1',
    effectKind: 'buff',
    sourceKind: 'reward',
    sourceId: 'reward-1',
    isActive: true,
    appliedAt: '2026-05-01T10:00:00.000Z',
    consumedAt: null,
    consumedByKind: null,
    consumedById: null,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}
