import {
  EncounterCombatCandidateAdminView,
  EncounterCombatCandidateReadModel,
  EncounterDefinitionAdminView,
  EncounterRewardAssignmentAdminView,
  ExplorationEncounterAdminData,
} from '../domain/exploration/exploration-encounter-admin.model';
import { ENCOUNTER_KIND } from '../constants/encounter-runtime-keys.const';
import {
  REWARD_ASSIGNMENT_MATCH_KIND,
  REWARD_SOURCE_KIND,
} from '../constants/reward-runtime-keys.const';
import { Row } from '../types/supabase.types';
import { labelFromKey } from './dictionary-options';
import { toRewardProfileEntrySummary } from './reward-profile-entry-summary';

export function mapEncounterCombatCandidate(
  row: Row<'encounter_combat_candidates'>,
): EncounterCombatCandidateReadModel {
  return {
    id: row.id,
    encounterDefinitionId: row.encounter_definition_id,
    candidateKind: row.candidate_kind,
    opponentDefinitionId: row.opponent_definition_id,
    familyKey: row.family_key,
    scalingFormulaId: row.scaling_formula_id,
    difficultyMultiplier: row.difficulty_multiplier,
    weight: row.weight,
    minHeroLevel: row.min_hero_level,
    maxHeroLevel: row.max_hero_level,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toEncounterDefinitionAdminView(
  data: ExplorationEncounterAdminData,
  encounterId: string,
): EncounterDefinitionAdminView | null {
  const encounter = data.encounters.find((entry) => entry.id === encounterId);

  if (!encounter) {
    return null;
  }

  const minigame = encounter.minigameKey
    ? data.minigames.find((entry) => entry.key === encounter.minigameKey)
    : null;
  const rewardProfile = encounter.rewardProfileId
    ? data.rewardProfiles.find((entry) => entry.id === encounter.rewardProfileId)
    : null;
  const readiness = data.encounterReadiness.find((entry) => entry.definitionId === encounter.id) ?? null;

  return {
    encounter,
    readiness,
    kindLabel: labelFromKey(encounter.encounterKind),
    minigameLabel: minigame
      ? `${minigame.label} (${minigame.key})`
      : encounter.minigameKey ?? 'No minigame',
    rewardProfileLabel: rewardProfile
      ? `${rewardProfile.label} (${rewardProfile.key})`
      : encounter.rewardProfileId ?? 'Reward by assignments',
    difficultyRangeLabel: keyRangeLabel(
      data.difficulties.map((entry) => ({ key: entry.key, label: entry.label })),
      encounter.minDifficultyKey,
      encounter.maxDifficultyKey,
      'Any difficulty',
    ),
    districtRangeLabel: keyRangeLabel(
      data.districts.map((entry) => ({ key: entry.code, label: entry.name })),
      encounter.minDistrictCode,
      encounter.maxDistrictCode,
      'Any district',
    ),
    isCombatEncounter:
      encounter.encounterKind === ENCOUNTER_KIND.combat ||
      encounter.minigameKey === ENCOUNTER_KIND.combat,
  };
}

export function toEncounterCombatCandidateAdminViews(
  data: ExplorationEncounterAdminData,
  encounterId: string,
): EncounterCombatCandidateAdminView[] {
  return data.combatCandidates
    .filter((entry) => entry.encounterDefinitionId === encounterId)
    .map((candidate) => toEncounterCombatCandidateAdminView(data, candidate));
}

export function toEncounterRewardAssignmentAdminViews(
  data: ExplorationEncounterAdminData,
  encounterId: string,
): EncounterRewardAssignmentAdminView[] {
  return data.rewardAssignments
    .filter(
      (entry) =>
        entry.sourceKind === REWARD_SOURCE_KIND.encounter &&
        entry.encounterDefinitionId === encounterId,
    )
    .map((assignment) => toEncounterRewardAssignmentAdminView(data, assignment));
}

export function toGlobalEncounterRewardAssignmentAdminViews(
  data: ExplorationEncounterAdminData,
): EncounterRewardAssignmentAdminView[] {
  return data.rewardAssignments
    .filter(
      (entry) =>
        entry.sourceKind === REWARD_SOURCE_KIND.encounter &&
        entry.encounterDefinitionId === null,
    )
    .map((assignment) => toEncounterRewardAssignmentAdminView(data, assignment));
}

function toEncounterRewardAssignmentAdminView(
  data: ExplorationEncounterAdminData,
  assignment: ExplorationEncounterAdminData['rewardAssignments'][number],
): EncounterRewardAssignmentAdminView {
  const rewardProfile = data.rewardProfiles.find(
    (entry) => entry.id === assignment.rewardProfileId,
  );
  const outcome = data.rewardOutcomeKinds.find(
    (entry) =>
      entry.sourceKind === REWARD_SOURCE_KIND.encounter && entry.key === assignment.outcomeKind,
  );
  const difficultyMatchLabel = matchScopeLabel(
    data,
    assignment.difficultyMatchKind,
    assignment.difficultyKey,
    assignment.maxDifficultyKey,
    'difficulty',
  );
  const districtMatchLabel = matchScopeLabel(
    data,
    assignment.districtMatchKind,
    assignment.districtCode,
    assignment.maxDistrictCode,
    'district',
  );
  const rewardProfileLabel = rewardProfile
    ? `${rewardProfile.label} (${rewardProfile.key})`
    : assignment.rewardProfileId;

  return {
    assignment,
    rewardProfileLabel,
    rewardProfileDescription:
      rewardProfile?.description ?? rewardProfile?.helperText ?? rewardProfile?.adminDescription ?? null,
    outcomeLabel: outcome ? `${outcome.label} (${outcome.key})` : assignment.outcomeKind,
    difficultyMatchLabel,
    districtMatchLabel,
    scopeLabel: assignment.encounterDefinitionId === null
      ? 'Global encounter assignment'
      : 'Selected encounter assignment',
    summaryLabel: `When runtime emits ${outcome?.label ?? assignment.outcomeKind}, and ${difficultyMatchLabel}, and ${districtMatchLabel}, use ${rewardProfileLabel}.`,
    rewardProfileEntrySummaries: data.rewardProfileEntries
      .filter((entry) => entry.rewardProfileId === assignment.rewardProfileId && entry.isActive)
      .map((entry) =>
        toRewardProfileEntrySummary({
          entryKinds: data.rewardEntryKinds,
          amountModes: data.rewardEntryAmountModes,
          resourceTypes: data.resourceTypes,
          formulas: data.formulas,
          effectDefinitions: data.effectDefinitions,
        }, entry),
      ),
  };
}

function matchScopeLabel(
  data: ExplorationEncounterAdminData,
  matchKind: string,
  key: string | null,
  maxKey: string | null,
  noun: string,
): string {
  const match = data.rewardAssignmentMatchKinds.find((entry) => entry.key === matchKind);
  const matchLabel = match?.label ?? labelFromKey(matchKind);

  if (!key && !maxKey) {
    return `${noun} ${matchLabel.toLowerCase()}: any`;
  }

  return `${noun} ${matchLabel.toLowerCase()}: ${key ?? REWARD_ASSIGNMENT_MATCH_KIND.any}${maxKey ? `..${maxKey}` : ''}`;
}

function toEncounterCombatCandidateAdminView(
  data: ExplorationEncounterAdminData,
  candidate: EncounterCombatCandidateReadModel,
): EncounterCombatCandidateAdminView {
  const opponent = candidate.opponentDefinitionId
    ? data.opponents.find((entry) => entry.id === candidate.opponentDefinitionId)
    : null;
  const family = candidate.familyKey
    ? data.families.find((entry) => entry.key === candidate.familyKey)
    : null;
  const formula = candidate.scalingFormulaId
    ? data.formulas.find((entry) => entry.id === candidate.scalingFormulaId)
    : null;

  return {
    candidate,
    targetLabel:
      candidate.candidateKind === 'opponent'
        ? opponent
          ? `${opponent.label} (${opponent.key})`
          : candidate.opponentDefinitionId ?? 'Missing opponent'
        : family
          ? `${family.label} (${family.key})`
          : candidate.familyKey ?? 'Missing family',
    targetDescription:
      candidate.candidateKind === 'opponent'
        ? opponent?.description ?? null
        : family?.description ?? null,
    formulaLabel: formula ? `${formula.label} (${formula.key})` : 'Default combat scaling',
    levelRangeLabel: levelRangeLabel(candidate.minHeroLevel, candidate.maxHeroLevel),
  };
}

function keyRangeLabel(
  options: Array<{ key: string; label: string }>,
  minKey: string | null,
  maxKey: string | null,
  emptyLabel: string,
): string {
  if (!minKey && !maxKey) {
    return emptyLabel;
  }

  const label = (key: string | null) =>
    key ? options.find((entry) => entry.key === key)?.label ?? key : null;

  if (minKey && maxKey) {
    return `${label(minKey)} - ${label(maxKey)}`;
  }

  return minKey ? `${label(minKey)}+` : `Up to ${label(maxKey)}`;
}

function levelRangeLabel(min: number | null, max: number | null): string {
  if (min === null && max === null) {
    return 'Any hero level';
  }

  if (min !== null && max !== null) {
    return `${min}-${max}`;
  }

  return min !== null ? `${min}+` : `Up to ${max}`;
}
