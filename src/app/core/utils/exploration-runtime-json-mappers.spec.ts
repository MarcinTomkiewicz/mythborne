import { Json } from '../types/database.types';
import {
  mapHeroExplorationDebugStateJson,
  mapHeroExplorationStateJson,
} from './exploration-runtime-json-mappers';

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

function stepJson(input: { id: string; status: string }): Json {
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
    outcomeKind: 'pending',
    difficultyKey: 'easy',
    districtCode: 'old_town',
    trialDefinitionId: null,
    encounterDefinitionId: null,
    trialOpportunityChance: null,
    trialOpportunityRoll: null,
    encounterChance: null,
    encounterRoll: null,
    metadataJson: {},
    startedAt: '2026-05-01T10:05:00.000Z',
    resolvesAt: '2026-05-01T10:06:00.000Z',
    resolvedAt: input.status === 'resolved' ? '2026-05-01T10:06:00.000Z' : null,
    createdAt: '2026-05-01T10:05:00.000Z',
    updatedAt: '2026-05-01T10:05:00.000Z',
  };
}

function challengeJson(): Json {
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
    manifestationChance: 70,
    manifestationRoll: 20,
    manualDeadlineAt: '2026-05-01T10:15:00.000Z',
    completionMode: null,
    performanceRating: null,
    score: null,
    success: null,
    rewardGrantId: null,
    autoResolveChance: 40,
    autoResolveRoll: null,
    detailsJson: {},
    metadataJson: {},
    startedAt: '2026-05-01T10:06:00.000Z',
    completedAt: null,
    createdAt: '2026-05-01T10:06:00.000Z',
    updatedAt: '2026-05-01T10:06:00.000Z',
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
