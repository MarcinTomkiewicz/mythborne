import {
  CombatOpponentDefinitionReadModel,
  CombatOpponentFamilyReadModel,
  ExplorationTrialAdminData,
  TrialCombatCandidateAdminView,
  TrialCombatCandidateReadModel,
  TrialDefinitionAdminView,
} from '../domain/exploration/exploration-trial-admin.model';
import { Row } from '../types/supabase.types';

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
    minigameLabel: minigame ? `${minigame.label} (${minigame.key})` : trial.minigameKey,
    minigameDescription: minigame?.description ?? null,
    isCombatTrial: trial.minigameKey === 'combat',
    metadataJson: trial.metadataJson,
  };
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
