import { ExplorationTrialAdminData } from '../domain/exploration/exploration-trial-admin.model';
import {
  toTrialCombatCandidateAdminViews,
  toTrialDefinitionAdminView,
} from './exploration-trial-admin-mappers';

describe('exploration trial admin mappers', () => {
  it('resolves trial stat and minigame labels from DB-backed dictionaries', () => {
    const view = toTrialDefinitionAdminView(adminData(), 'trial-1');

    expect(view?.testedStatLabel).toBe('Spirituality (spirituality)');
    expect(view?.minigameLabel).toBe('Combat challenge (combat)');
    expect(view?.isCombatTrial).toBeTrue();
  });

  it('resolves combat candidate opponent, family and formula labels', () => {
    const views = toTrialCombatCandidateAdminViews(adminData(), 'trial-1');

    expect(views[0].targetLabel).toBe('Bandit Captain (bandit-captain)');
    expect(views[0].formulaLabel).toBe('Enemy scaling (enemy-scaling)');
    expect(views[0].levelRangeLabel).toBe('3-10');
    expect(views[1].targetLabel).toBe('Bandits (bandits)');
    expect(views[1].formulaLabel).toBe('Default combat scaling');
    expect(views[1].levelRangeLabel).toBe('Any hero level');
  });
});

function adminData(): ExplorationTrialAdminData {
  return {
    trials: [
      {
        id: 'trial-1',
        key: 'trial-combat',
        label: 'Combat trial',
        description: 'Fight a foe.',
        helperText: null,
        adminDescription: null,
        testedStatKey: 'spirituality',
        minigameKey: 'combat',
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    minigames: [
      {
        key: 'combat',
        label: 'Combat challenge',
        description: 'Uses combat.',
        helperText: null,
        adminDescription: null,
        implementationKey: 'combat',
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    stats: [{ key: 'spirituality', label: 'Spirituality' }],
    combatCandidates: [
      {
        id: 'candidate-1',
        trialDefinitionId: 'trial-1',
        candidateKind: 'opponent',
        opponentDefinitionId: 'opponent-1',
        familyKey: null,
        scalingFormulaId: 'formula-1',
        difficultyMultiplier: 1.2,
        weight: 2,
        minHeroLevel: 3,
        maxHeroLevel: 10,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 'candidate-2',
        trialDefinitionId: 'trial-1',
        candidateKind: 'family',
        opponentDefinitionId: null,
        familyKey: 'bandits',
        scalingFormulaId: null,
        difficultyMultiplier: 1,
        weight: 1,
        minHeroLevel: null,
        maxHeroLevel: null,
        sortOrder: 20,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    opponents: [
      {
        id: 'opponent-1',
        key: 'bandit-captain',
        label: 'Bandit Captain',
        description: 'Concrete enemy.',
        helperText: null,
        adminDescription: null,
        familyKey: 'bandits',
        equipmentMode: 'generated',
        defaultScalingFormulaId: null,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    families: [
      {
        key: 'bandits',
        label: 'Bandits',
        description: 'Family of enemies.',
        helperText: null,
        adminDescription: null,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    formulas: [
      {
        id: 'formula-1',
        key: 'enemy-scaling',
        scopeKey: 'combat',
        label: 'Enemy scaling',
        expression: 'hero_level',
        description: null,
        isEnabled: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
  };
}
