import { REWARD_ENTRY_KIND, REWARD_SOURCE_KIND } from '../constants/reward-runtime-keys.const';
import {
  EncounterDefinitionReadModel,
  TrialDefinitionReadModel,
} from '../domain/exploration/exploration-definition.model';
import {
  EncounterReadinessReadModel,
  ExplorationDefinitionReadinessReadModel,
  TrialReadinessReadModel,
} from '../domain/exploration/exploration-readiness.model';
import {
  ExplorationSmokeDefinitionSummary,
  ExplorationSmokeReadinessData,
  ExplorationSmokeReadinessItem,
  ExplorationSmokeReadinessStatus,
  ExplorationSmokeRewardSummary,
} from '../domain/exploration/exploration-smoke-readiness.model';
import { RewardProfileAssignmentReadModel, RewardProfileEntryReadModel } from '../domain/exploration/exploration-reward.model';

type DefinitionCandidate =
  | {
      kind: 'trial';
      definition: TrialDefinitionReadModel;
      readiness: TrialReadinessReadModel | null;
    }
  | {
      kind: 'encounter';
      definition: EncounterDefinitionReadModel;
      readiness: EncounterReadinessReadModel | null;
    };

export function toExplorationSmokeReadinessItems(
  data: ExplorationSmokeReadinessData,
): ExplorationSmokeReadinessItem[] {
  const combatTrial = selectTrial(data, (trial) => trial.minigameKey === 'combat');
  const combatEncounter = selectEncounter(data, (encounter) => encounter.encounterKind === 'combat');
  const resourceEncounter = selectEncounter(data, (encounter) => encounter.encounterKind === 'resource');
  const buffEncounter = selectEncounter(data, (encounter) => encounter.encounterKind === 'buff');
  const debuffEncounter = selectEncounter(data, (encounter) => encounter.encounterKind === 'debuff');

  return [
    definitionItem('combat_trial', 'Combat Trial definition', combatTrial),
    definitionItem('combat_encounter', 'Combat Encounter definition', combatEncounter),
    definitionItem('resource_encounter', 'Resource Encounter definition', resourceEncounter),
    definitionItem('buff_encounter', 'Buff Encounter definition', buffEncounter),
    definitionItem('debuff_encounter', 'Debuff Encounter definition', debuffEncounter),
    rewardItem({
      key: 'trial_item_reward',
      label: 'Trial item-generation reward',
      candidate: combatTrial,
      sourceKind: REWARD_SOURCE_KIND.trial,
      requiredEntryKinds: [REWARD_ENTRY_KIND.itemGeneration],
      data,
    }),
    rewardItem({
      key: 'combat_encounter_xp_reward',
      label: 'Combat Encounter XP reward',
      candidate: combatEncounter,
      sourceKind: REWARD_SOURCE_KIND.encounter,
      requiredEntryKinds: [REWARD_ENTRY_KIND.experience],
      data,
    }),
    rewardItem({
      key: 'resource_reward',
      label: 'Resource Encounter resource reward',
      candidate: resourceEncounter,
      sourceKind: REWARD_SOURCE_KIND.encounter,
      requiredEntryKinds: [REWARD_ENTRY_KIND.resource],
      data,
    }),
    effectItem('buff_effect', 'Buff Encounter active effect', buffEncounter, 'buff', data),
    effectItem('debuff_effect', 'Debuff Encounter active effect', debuffEncounter, 'debuff', data),
  ];

  function selectTrial(
    data: ExplorationSmokeReadinessData,
    predicate: (trial: TrialDefinitionReadModel) => boolean,
  ): DefinitionCandidate | null {
    const definitions = data.trials.filter(predicate);
    const definition =
      definitions.find((entry) => readinessForTrial(data, entry.id)?.statusKey === 'ready') ??
      definitions[0] ??
      null;

    return definition
      ? { kind: 'trial', definition, readiness: readinessForTrial(data, definition.id) }
      : null;
  }

  function selectEncounter(
    data: ExplorationSmokeReadinessData,
    predicate: (encounter: EncounterDefinitionReadModel) => boolean,
  ): DefinitionCandidate | null {
    const definitions = data.encounters.filter(predicate);
    const definition =
      definitions.find((entry) => readinessForEncounter(data, entry.id)?.statusKey === 'ready') ??
      definitions[0] ??
      null;

    return definition
      ? { kind: 'encounter', definition, readiness: readinessForEncounter(data, definition.id) }
      : null;
  }
}

function definitionItem(key: ExplorationSmokeReadinessItem['key'], label: string, candidate: DefinitionCandidate | null): ExplorationSmokeReadinessItem {
  return {
    key,
    label,
    status: definitionStatus(candidate),
    definition: definitionSummary(candidate),
    reward: null,
    effect: null,
    issues: definitionIssues(candidate),
  };
}

function rewardItem(input: {
  key: ExplorationSmokeReadinessItem['key'];
  label: string;
  candidate: DefinitionCandidate | null;
  sourceKind: string;
  requiredEntryKinds: string[];
  data: ExplorationSmokeReadinessData;
}): ExplorationSmokeReadinessItem {
  const reward = resolveReward(input.data, input.candidate, input.sourceKind, input.requiredEntryKinds);
  const issues = [
    ...definitionIssues(input.candidate),
    ...rewardIssues(reward, input.requiredEntryKinds),
  ];

  return {
    key: input.key,
    label: input.label,
    status: issues.length ? definitionAwareStatus(input.candidate) : 'ready',
    definition: definitionSummary(input.candidate),
    reward,
    effect: null,
    issues,
  };
}

function effectItem(
  key: ExplorationSmokeReadinessItem['key'],
  label: string,
  candidate: DefinitionCandidate | null,
  effectKind: string,
  data: ExplorationSmokeReadinessData,
): ExplorationSmokeReadinessItem {
  const encounterId = candidate?.kind === 'encounter' ? candidate.definition.id : null;
  const payload = encounterId
    ? data.effectPayloads.find((entry) => entry.encounterDefinitionId === encounterId && entry.isActive) ?? null
    : null;
  const definition = payload
    ? data.effectDefinitions.find((entry) => entry.id === payload.effectDefinitionId) ?? null
    : null;
  const effectSummary = definition ? definition.helperText ?? definition.description ?? definition.adminDescription : null;
  const issues = [
    ...definitionIssues(candidate),
    ...(payload ? [] : ['Missing active effect payload.']),
    ...(definition ? [] : ['Missing effect definition for payload.']),
    ...(definition?.effectKind === effectKind
      ? []
      : definition
        ? [`Effect definition kind is ${definition.effectKind}, expected ${effectKind}.`]
        : []),
    ...(definition?.isActive === false ? ['Effect definition is inactive.'] : []),
    ...(definition && !definition.label ? ['Effect definition label is missing.'] : []),
    ...(definition && !effectSummary ? ['Effect definition summary is missing.'] : []),
  ];

  return {
    key,
    label,
    status: issues.length ? definitionAwareStatus(candidate) : 'ready',
    definition: definitionSummary(candidate),
    reward: null,
    effect: {
      payloadId: payload?.id ?? null,
      definitionId: definition?.id ?? payload?.effectDefinitionId ?? null,
      definitionKey: definition?.key ?? null,
      label: definition?.label ?? null,
      summary: effectSummary,
      effectKind: definition?.effectKind ?? null,
      isDefinitionActive: definition?.isActive ?? null,
    },
    issues,
  };
}

function resolveReward(
  data: ExplorationSmokeReadinessData,
  candidate: DefinitionCandidate | null,
  sourceKind: string,
  requiredEntryKinds: readonly string[],
): ExplorationSmokeRewardSummary | null {
  if (!candidate) {
    return null;
  }

  const assignment = findRewardAssignment(data, candidate, sourceKind, requiredEntryKinds);
  const profile = assignment
    ? data.rewardProfiles.find((entry) => entry.id === assignment.rewardProfileId) ?? null
    : null;
  const activeEntries = assignment
    ? data.rewardProfileEntries.filter(
        (entry) => entry.rewardProfileId === assignment.rewardProfileId && entry.isActive,
      )
    : [];

  return {
    assignmentId: assignment?.id ?? null,
    profileId: assignment?.rewardProfileId ?? null,
    profileLabel: profile ? `${profile.label} (${profile.key})` : null,
    entryKinds: activeEntries.map((entry) => entry.entryKind),
    activeEntryCount: activeEntries.length,
  };
}

function findRewardAssignment(
  data: ExplorationSmokeReadinessData,
  candidate: DefinitionCandidate,
  sourceKind: string,
  requiredEntryKinds: readonly string[],
): RewardProfileAssignmentReadModel | null {
  const definitionId = candidate.definition.id;
  const matchingAssignments = data.rewardAssignments.filter((entry) =>
    entry.isActive &&
    entry.sourceKind === sourceKind &&
    (candidate.kind === 'trial'
      ? entry.trialDefinitionId === definitionId
      : entry.encounterDefinitionId === definitionId)
  );
  const scoped = matchingAssignments.find((entry) =>
    hasRequiredEntries(data.rewardProfileEntries, entry, requiredEntryKinds)
  ) ?? matchingAssignments[0] ?? null;

  return scoped ??
    data.rewardAssignments.find((entry) =>
      entry.isActive &&
      entry.sourceKind === sourceKind &&
      entry.trialDefinitionId === null &&
      entry.encounterDefinitionId === null &&
      hasRequiredEntries(data.rewardProfileEntries, entry, requiredEntryKinds)
    ) ??
    data.rewardAssignments.find((entry) =>
      entry.isActive &&
      entry.sourceKind === sourceKind &&
      entry.trialDefinitionId === null &&
      entry.encounterDefinitionId === null
    ) ??
    null;
}

function hasRequiredEntries(
  entries: RewardProfileEntryReadModel[],
  assignment: RewardProfileAssignmentReadModel,
  requiredEntryKinds: readonly string[],
): boolean {
  const profileEntryKinds = entries
    .filter((entry) => entry.rewardProfileId === assignment.rewardProfileId && entry.isActive)
    .map((entry) => entry.entryKind);

  return requiredEntryKinds.every((kind) => profileEntryKinds.includes(kind));
}

function rewardIssues(
  reward: ExplorationSmokeRewardSummary | null,
  requiredEntryKinds: readonly string[],
): string[] {
  if (!reward?.assignmentId) {
    return ['Missing active reward assignment.'];
  }

  if (!reward.profileLabel) {
    return ['Reward assignment points to a missing or inactive reward profile.'];
  }

  const missingEntryIssues = requiredEntryKinds
    .filter((kind) => !reward.entryKinds.includes(kind))
    .map((kind) => `Reward profile is missing active ${kind} entry.`);

  return reward.activeEntryCount
    ? missingEntryIssues
    : ['Reward profile has no active entries.', ...missingEntryIssues];
}

function definitionStatus(candidate: DefinitionCandidate | null): ExplorationSmokeReadinessStatus {
  if (!candidate) {
    return 'missing';
  }

  return candidate.readiness?.statusKey === 'ready' ? 'ready' : 'incomplete';
}

function definitionAwareStatus(candidate: DefinitionCandidate | null): ExplorationSmokeReadinessStatus {
  return candidate ? 'incomplete' : 'missing';
}

function definitionIssues(candidate: DefinitionCandidate | null): string[] {
  if (!candidate) {
    return ['Missing definition.'];
  }

  const readinessIssues = readinessIssueLabels(candidate.readiness);
  return candidate.readiness?.statusKey === 'ready' ? [] : readinessIssues;
}

function readinessIssueLabels(readiness: ExplorationDefinitionReadinessReadModel | null): string[] {
  if (!readiness) {
    return ['Missing DB readiness row.'];
  }

  if (readiness.reasons.length) {
    return readiness.reasons.map((reason) => reason.label ?? reason.key);
  }

  return readiness.statusKey === 'inactive'
    ? ['Definition is inactive.']
    : ['Definition is incomplete.'];
}

function definitionSummary(candidate: DefinitionCandidate | null): ExplorationSmokeDefinitionSummary | null {
  if (!candidate) {
    return null;
  }

  return {
    id: candidate.definition.id,
    key: candidate.definition.key,
    label: candidate.definition.label,
    kind: candidate.kind,
    subtype: candidate.kind === 'trial' ? candidate.definition.minigameKey : candidate.definition.encounterKind,
  };
}

function readinessForTrial(
  data: ExplorationSmokeReadinessData,
  definitionId: string,
): TrialReadinessReadModel | null {
  return data.trialReadiness.find((entry) => entry.definitionId === definitionId) ?? null;
}

function readinessForEncounter(
  data: ExplorationSmokeReadinessData,
  definitionId: string,
): EncounterReadinessReadModel | null {
  return data.encounterReadiness.find((entry) => entry.definitionId === definitionId) ?? null;
}
