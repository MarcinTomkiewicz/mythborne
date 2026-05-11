import {
  EncounterDefinitionReadModel,
  TrialDefinitionReadModel,
} from '../domain/exploration/exploration-definition.model';
import {
  EncounterEffectPayloadReadModel,
  ExplorationEffectDefinitionReadModel,
} from '../domain/exploration/exploration-encounter-admin.model';
import {
  EncounterReadinessReadModel,
  TrialReadinessReadModel,
} from '../domain/exploration/exploration-readiness.model';
import {
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from '../domain/exploration/exploration-reward.model';
import { ExplorationSmokeReadinessData } from '../domain/exploration/exploration-smoke-readiness.model';
import { toExplorationSmokeReadinessItems } from './exploration-smoke-readiness';

describe('exploration smoke readiness', () => {
  it('marks the minimum smoke matrix ready from DB-owned readiness, reward and effect rows', () => {
    const items = toExplorationSmokeReadinessItems(readyData());

    expect(items.map((item) => [item.key, item.status])).toEqual([
      ['combat_trial', 'ready'],
      ['combat_encounter', 'ready'],
      ['resource_encounter', 'ready'],
      ['buff_encounter', 'ready'],
      ['debuff_encounter', 'ready'],
      ['trial_item_reward', 'ready'],
      ['combat_encounter_xp_reward', 'ready'],
      ['resource_reward', 'ready'],
      ['buff_effect', 'ready'],
      ['debuff_effect', 'ready'],
    ]);
    expect(items.find((item) => item.key === 'buff_effect')?.effect?.label).toBe('Blessing');
    expect(items.find((item) => item.key === 'buff_effect')?.effect?.summary).toBe(
      'Blessing summary',
    );
  });

  it('surfaces missing reward entries and missing effect labels without inventing fallbacks', () => {
    const data = readyData();
    data.rewardProfileEntries = data.rewardProfileEntries.filter(
      (entry) => entry.entryKind !== 'item_generation',
    );
    data.effectDefinitions = data.effectDefinitions.map((entry) =>
      entry.effectKind === 'buff' ? { ...entry, label: '', description: '' } : entry,
    );

    const items = toExplorationSmokeReadinessItems(data);

    const itemReward = items.find((item) => item.key === 'trial_item_reward');
    const buffEffect = items.find((item) => item.key === 'buff_effect');
    expect(itemReward?.status).toBe('incomplete');
    expect(itemReward?.issues).toContain('Reward profile is missing active item_generation entry.');
    expect(buffEffect?.status).toBe('incomplete');
    expect(buffEffect?.effect?.label).toBe('');
    expect(buffEffect?.issues).toContain('Effect definition label is missing.');
    expect(buffEffect?.issues).toContain('Effect definition summary is missing.');
  });

  it('marks absent smoke definitions as missing and keeps readiness reasons actionable', () => {
    const data = readyData();
    data.encounters = data.encounters.filter((entry) => entry.encounterKind !== 'resource');
    data.trialReadiness = [
      {
        ...data.trialReadiness[0],
        isReady: false,
        statusKey: 'incomplete',
        reasons: [{ key: 'missing_combat_candidate', label: 'Missing combat candidate' }],
      } as TrialReadinessReadModel,
    ];

    const items = toExplorationSmokeReadinessItems(data);

    expect(items.find((item) => item.key === 'resource_encounter')?.status).toBe('missing');
    expect(items.find((item) => item.key === 'combat_trial')?.issues).toContain(
      'Missing combat candidate',
    );
  });
});

function readyData(): ExplorationSmokeReadinessData {
  const trials = [trial('trial-combat', 'trial_combat', 'Combat Trial', 'combat')];
  const encounters = [
    encounter('enc-combat', 'enc_combat', 'Combat Encounter', 'combat'),
    encounter('enc-resource', 'enc_resource', 'Resource Encounter', 'resource'),
    encounter('enc-buff', 'enc_buff', 'Buff Encounter', 'buff'),
    encounter('enc-debuff', 'enc_debuff', 'Debuff Encounter', 'debuff'),
  ];

  return {
    trials,
    encounters,
    trialReadiness: trials.map((entry) => readiness(entry, 'trial') as TrialReadinessReadModel),
    encounterReadiness: encounters.map(
      (entry) => readiness(entry, 'encounter') as EncounterReadinessReadModel,
    ),
    rewardProfiles: [
      profile('profile-items', 'Trial items'),
      profile('profile-combat-encounter', 'Combat Encounter reward'),
      profile('profile-resource', 'Resource reward'),
    ],
    rewardAssignments: [
      assignment('assign-trial-item', 'trial', 'trial-combat', null, 'profile-items'),
      assignment('assign-enc-combat', 'encounter', null, 'enc-combat', 'profile-combat-encounter'),
      assignment('assign-resource', 'encounter', null, 'enc-resource', 'profile-resource'),
    ],
    rewardProfileEntries: [
      entry('entry-item', 'profile-items', 'item_generation'),
      entry('entry-xp', 'profile-combat-encounter', 'experience'),
      entry('entry-resource', 'profile-resource', 'resource'),
    ],
    effectPayloads: [
      effectPayload('payload-buff', 'enc-buff', 'effect-buff'),
      effectPayload('payload-debuff', 'enc-debuff', 'effect-debuff'),
    ],
    effectDefinitions: [
      effectDefinition('effect-buff', 'blessing', 'Blessing', 'buff'),
      effectDefinition('effect-debuff', 'curse', 'Curse', 'debuff'),
    ],
  };
}

function trial(
  id: string,
  key: string,
  label: string,
  minigameKey: string,
): TrialDefinitionReadModel {
  return { id, key, label, minigameKey, isActive: true } as TrialDefinitionReadModel;
}

function encounter(
  id: string,
  key: string,
  label: string,
  encounterKind: string,
): EncounterDefinitionReadModel {
  return { id, key, label, encounterKind, isActive: true } as EncounterDefinitionReadModel;
}

function readiness(
  definition: TrialDefinitionReadModel | EncounterDefinitionReadModel,
  definitionKind: 'trial' | 'encounter',
): TrialReadinessReadModel | EncounterReadinessReadModel {
  return {
    definitionKind,
    definitionId: definition.id,
    definitionKey: definition.key,
    isActive: true,
    isReady: true,
    statusKey: 'ready',
    minigameKey: 'minigameKey' in definition ? definition.minigameKey : null,
    encounterKind: 'encounterKind' in definition ? definition.encounterKind : null,
    combatCandidateCount: definitionKind === 'trial' || readEncounterKind(definition) === 'combat' ? 1 : 0,
    rewardAssignmentCount: 1,
    effectPayloadCount: definitionKind === 'encounter' ? 1 : 0,
    blockingReasonCount: 0,
    reasons: [],
    metadataJson: {},
  } as TrialReadinessReadModel | EncounterReadinessReadModel;
}

function readEncounterKind(
  definition: TrialDefinitionReadModel | EncounterDefinitionReadModel,
): string | null {
  return 'encounterKind' in definition ? definition.encounterKind : null;
}

function profile(id: string, label: string): RewardProfileReadModel {
  return { id, key: id, label, isActive: true } as RewardProfileReadModel;
}

function assignment(
  id: string,
  sourceKind: string,
  trialDefinitionId: string | null,
  encounterDefinitionId: string | null,
  rewardProfileId: string,
): RewardProfileAssignmentReadModel {
  return {
    id,
    sourceKind,
    trialDefinitionId,
    encounterDefinitionId,
    rewardProfileId,
    isActive: true,
  } as RewardProfileAssignmentReadModel;
}

function entry(
  id: string,
  rewardProfileId: string,
  entryKind: string,
): RewardProfileEntryReadModel {
  return { id, rewardProfileId, entryKind, isActive: true } as RewardProfileEntryReadModel;
}

function effectPayload(
  id: string,
  encounterDefinitionId: string,
  effectDefinitionId: string,
): EncounterEffectPayloadReadModel {
  return {
    id,
    encounterDefinitionId,
    effectDefinitionId,
    isActive: true,
  } as EncounterEffectPayloadReadModel;
}

function effectDefinition(
  id: string,
  key: string,
  label: string,
  effectKind: string,
): ExplorationEffectDefinitionReadModel {
  return {
    id,
    key,
    label,
    description: `${label} summary`,
    helperText: null,
    adminDescription: null,
    effectKind,
    isActive: true,
  } as ExplorationEffectDefinitionReadModel;
}
