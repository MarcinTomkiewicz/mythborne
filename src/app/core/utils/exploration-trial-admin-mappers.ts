import {
  CombatOpponentDefinitionReadModel,
  CombatOpponentFamilyReadModel,
  ExplorationTrialAdminData,
  TrialCombatCandidateAdminView,
  TrialCombatCandidateReadModel,
  TrialDefinitionAdminView,
  TrialRewardAssignmentAdminView,
} from '../domain/exploration/exploration-trial-admin.model';
import {
  REWARD_ASSIGNMENT_MATCH_KIND,
  REWARD_SOURCE_KIND,
} from '../constants/reward-runtime-keys.const';
import { Row } from '../types/supabase.types';
import { labelFromKey } from './dictionary-options';
import { toRewardProfileEntrySummary } from './reward-profile-entry-summary';

export function mapTrialCombatCandidate(
  row: Row<'trial_combat_candidates'>,
): TrialCombatCandidateReadModel {
  return {
    id: row.id,
    trialDefinitionId: row.trial_definition_id,
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

export function mapCombatOpponentDefinition(
  row: Row<'combat_opponent_definitions'>,
): CombatOpponentDefinitionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    familyKey: row.family_key,
    equipmentMode: row.equipment_mode,
    defaultScalingFormulaId: row.default_scaling_formula_id,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCombatOpponentFamily(
  row: Row<'combat_opponent_families'>,
): CombatOpponentFamilyReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTrialDefinitionAdminView(
  data: ExplorationTrialAdminData,
  trialId: string,
): TrialDefinitionAdminView | null {
  const trial = data.trials.find((entry) => entry.id === trialId);

  if (!trial) {
    return null;
  }

  const stat = data.stats.find((entry) => entry.key === trial.testedStatKey);
  const minigame = data.minigames.find((entry) => entry.key === trial.minigameKey);

  return {
    trial,
    testedStatLabel: stat ? `${stat.label} (${stat.key})` : trial.testedStatKey,
    testedStatDescription:
      stat?.description ?? stat?.helperText ?? stat?.adminDescription ?? null,
    minigameLabel: minigame ? `${minigame.label} (${minigame.key})` : trial.minigameKey,
    minigameDescription: minigame?.description ?? null,
    isCombatTrial: trial.minigameKey === 'combat',
    metadataJson: trial.metadataJson,
  };
}

export function toTrialRewardAssignmentAdminViews(
  data: ExplorationTrialAdminData,
  trialId: string,
): TrialRewardAssignmentAdminView[] {
  return data.rewardAssignments
    .filter(
      (entry) =>
        entry.sourceKind === REWARD_SOURCE_KIND.trial &&
        entry.trialDefinitionId === trialId,
    )
    .map((assignment) => toTrialRewardAssignmentAdminView(data, assignment));
}

export function toGlobalTrialRewardAssignmentAdminViews(
  data: ExplorationTrialAdminData,
): TrialRewardAssignmentAdminView[] {
  return data.rewardAssignments
    .filter(
      (entry) =>
        entry.sourceKind === REWARD_SOURCE_KIND.trial &&
        entry.trialDefinitionId === null,
    )
    .map((assignment) => toTrialRewardAssignmentAdminView(data, assignment));
}

function toTrialRewardAssignmentAdminView(
  data: ExplorationTrialAdminData,
  assignment: ExplorationTrialAdminData['rewardAssignments'][number],
): TrialRewardAssignmentAdminView {
  const rewardProfile = data.rewardProfiles.find(
    (entry) => entry.id === assignment.rewardProfileId,
  );
  const outcome = data.rewardOutcomeKinds.find(
    (entry) =>
      entry.sourceKind === REWARD_SOURCE_KIND.trial && entry.key === assignment.outcomeKind,
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
    scopeLabel: assignment.trialDefinitionId === null
      ? 'Global trial assignment'
      : 'Selected trial assignment',
    summaryLabel: `When trial runtime emits ${outcome?.label ?? assignment.outcomeKind}, and ${difficultyMatchLabel}, and ${districtMatchLabel}, use ${rewardProfileLabel}.`,
    rewardProfileEntrySummaries: data.rewardProfileEntries
      .filter((entry) => entry.rewardProfileId === assignment.rewardProfileId && entry.isActive)
      .map((entry) =>
        toRewardProfileEntrySummary({
          entryKinds: data.rewardEntryKinds,
          amountModes: data.rewardEntryAmountModes,
          resourceTypes: data.resourceTypes,
          formulas: data.formulas,
          effectDefinitions: [],
        }, entry),
      ),
  };
}

function matchScopeLabel(
  data: ExplorationTrialAdminData,
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

export function toTrialCombatCandidateAdminViews(
  data: ExplorationTrialAdminData,
  trialId: string,
): TrialCombatCandidateAdminView[] {
  return data.combatCandidates
    .filter((entry) => entry.trialDefinitionId === trialId)
    .map((candidate) => toTrialCombatCandidateAdminView(data, candidate));
}

function toTrialCombatCandidateAdminView(
  data: ExplorationTrialAdminData,
  candidate: TrialCombatCandidateReadModel,
): TrialCombatCandidateAdminView {
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

function levelRangeLabel(min: number | null, max: number | null): string {
  if (min === null && max === null) {
    return 'Any hero level';
  }

  if (min !== null && max !== null) {
    return `${min}-${max}`;
  }

  return min !== null ? `${min}+` : `Up to ${max}`;
}
