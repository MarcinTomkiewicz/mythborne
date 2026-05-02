import { CombatOpponentAdminData } from '../domain/combat/combat-opponent.model';
import { BalanceFormula } from '../domain/formula/formula.model';
import { EncounterDefinitionReadModel } from '../domain/exploration/exploration-definition.model';
import { TrialDefinitionReadModel } from '../domain/exploration/exploration-definition.model';
import { EncounterCombatCandidateReadModel } from '../domain/exploration/exploration-encounter-admin.model';
import { TrialCombatCandidateReadModel } from '../domain/exploration/exploration-trial-admin.model';
import { toCombatAdminBalanceData } from './combat-admin-balance-mappers';

describe('toCombatAdminBalanceData', () => {
  it('enriches encounter and trial candidates with DB-backed dictionary labels', () => {
    const data = toCombatAdminBalanceData({
      opponents: opponentData(),
      trials: [trial()],
      trialCandidates: [trialCandidate()],
      encounters: [encounter()],
      encounterCandidates: [encounterCandidate()],
      formulas: [formula()],
    });

    expect(data.encounterCandidates[0]).toEqual(jasmine.objectContaining({
      sourceKind: 'encounter',
      sourceLabel: 'Road ambush (road-ambush)',
      candidateKindLabel: 'Opponent family',
      targetLabel: 'Bandits (bandits)',
      formulaLabel: 'Elite scaling (elite-scaling)',
      levelRangeLabel: '2-10',
    }));
    expect(data.trialCandidates[0]).toEqual(jasmine.objectContaining({
      sourceKind: 'trial',
      sourceLabel: 'Arena trial (arena-trial)',
      candidateKindLabel: 'Specific opponent',
      targetLabel: 'Bandit scout (bandit-scout)',
      formulaLabel: 'Default combat scaling',
      levelRangeLabel: 'Any hero level',
    }));
  });
});

function opponentData(): CombatOpponentAdminData {
  return {
    families: [{
      key: 'bandits',
      label: 'Bandits',
      description: 'Bandit family.',
      helperText: null,
      adminDescription: null,
      sortOrder: 1,
      isActive: true,
      createdAt: 'now',
      updatedAt: 'now',
    }],
    opponents: [{
      id: 'opponent-1',
      key: 'bandit-scout',
      label: 'Bandit scout',
      description: 'A light opponent.',
      helperText: null,
      adminDescription: null,
      familyKey: 'bandits',
      equipmentMode: 'none',
      defaultScalingFormulaId: null,
      sortOrder: 1,
      isActive: true,
      createdAt: 'now',
      updatedAt: 'now',
    }],
    statValues: [],
    attackSources: [],
    equipmentEntries: [],
    equipmentModes: [],
    equipmentSlots: [],
    stats: [],
    dictionaries: {
      sourceTypes: [],
      sides: [],
      outcomes: [],
      participantKinds: [],
      attackSourceKinds: [],
      candidateKinds: [
        dictionary('opponent', 'Specific opponent'),
        dictionary('family', 'Opponent family'),
      ],
    },
    opponentViews: [],
    emptyState: null,
  };
}

function dictionary(key: string, label: string) {
  return {
    key,
    label,
    description: `${label} description.`,
    helperText: null,
    adminDescription: null,
    sortOrder: 1,
    isActive: true,
    metadataJson: {},
    createdAt: 'now',
    updatedAt: 'now',
  };
}

function trial(): TrialDefinitionReadModel {
  return {
    id: 'trial-1',
    key: 'arena-trial',
    label: 'Arena trial',
    description: 'Trial.',
    helperText: null,
    adminDescription: null,
    testedStatKey: 'strength',
    minigameKey: 'combat',
    sortOrder: 1,
    isActive: true,
    metadataJson: {},
    createdAt: 'now',
    updatedAt: 'now',
  };
}

function encounter(): EncounterDefinitionReadModel {
  return {
    id: 'encounter-1',
    key: 'road-ambush',
    label: 'Road ambush',
    description: 'Encounter.',
    helperText: null,
    adminDescription: null,
    encounterKind: 'combat',
    minigameKey: 'combat',
    rewardProfileId: null,
    minDifficultyKey: null,
    maxDifficultyKey: null,
    minDistrictCode: null,
    maxDistrictCode: null,
    sortOrder: 1,
    isActive: true,
    metadataJson: {},
    createdAt: 'now',
    updatedAt: 'now',
  };
}

function trialCandidate(): TrialCombatCandidateReadModel {
  return {
    id: 'trial-candidate-1',
    trialDefinitionId: 'trial-1',
    candidateKind: 'opponent',
    opponentDefinitionId: 'opponent-1',
    familyKey: null,
    scalingFormulaId: null,
    difficultyMultiplier: 1,
    weight: 1,
    minHeroLevel: null,
    maxHeroLevel: null,
    sortOrder: 1,
    isActive: true,
    createdAt: 'now',
    updatedAt: 'now',
  };
}

function encounterCandidate(): EncounterCombatCandidateReadModel {
  return {
    id: 'encounter-candidate-1',
    encounterDefinitionId: 'encounter-1',
    candidateKind: 'family',
    opponentDefinitionId: null,
    familyKey: 'bandits',
    scalingFormulaId: 'formula-1',
    difficultyMultiplier: 1.5,
    weight: 3,
    minHeroLevel: 2,
    maxHeroLevel: 10,
    sortOrder: 1,
    isActive: true,
    createdAt: 'now',
    updatedAt: 'now',
  };
}

function formula(): BalanceFormula {
  return {
    id: 'formula-1',
    key: 'elite-scaling',
    label: 'Elite scaling',
    description: null,
    expression: 'baseValue * 1.5',
    scopeKey: 'combat',
    isEnabled: true,
    createdAt: 'now',
    updatedAt: 'now',
  };
}
