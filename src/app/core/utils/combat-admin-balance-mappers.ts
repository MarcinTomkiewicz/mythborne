import {
  CombatAdminBalanceData,
  CombatCandidateInspectionRow,
  CombatCandidateSourceKind,
} from '../domain/combat/combat-admin-balance.model';
import {
  CombatDictionaryReadModel,
  CombatOpponentAdminData,
} from '../domain/combat/combat-opponent.model';
import { BalanceFormula } from '../domain/formula/formula.model';
import { EncounterCombatCandidateReadModel } from '../domain/exploration/exploration-encounter-admin.model';
import {
  EncounterDefinitionReadModel,
  TrialDefinitionReadModel,
} from '../domain/exploration/exploration-definition.model';
import { TrialCombatCandidateReadModel } from '../domain/exploration/exploration-trial-admin.model';

type Candidate =
  | TrialCombatCandidateReadModel
  | EncounterCombatCandidateReadModel;

export function toCombatAdminBalanceData(input: {
  opponents: CombatOpponentAdminData;
  trials: readonly TrialDefinitionReadModel[];
  trialCandidates: readonly TrialCombatCandidateReadModel[];
  encounters: readonly EncounterDefinitionReadModel[];
  encounterCandidates: readonly EncounterCombatCandidateReadModel[];
  formulas: readonly BalanceFormula[];
}): CombatAdminBalanceData {
  return {
    opponents: input.opponents,
    trialCandidates: input.trialCandidates.map((candidate) =>
      toCandidateInspectionRow({
        sourceKind: 'trial',
        sourceLabel: sourceLabelFor(input.trials, candidate.trialDefinitionId),
        candidate,
        opponents: input.opponents,
        formulas: input.formulas,
      }),
    ),
    encounterCandidates: input.encounterCandidates.map((candidate) =>
      toCandidateInspectionRow({
        sourceKind: 'encounter',
        sourceLabel: sourceLabelFor(input.encounters, candidate.encounterDefinitionId),
        candidate,
        opponents: input.opponents,
        formulas: input.formulas,
      }),
    ),
    dictionaries: {
      ...input.opponents.dictionaries,
      equipmentModes: input.opponents.equipmentModes,
      equipmentSlots: input.opponents.equipmentSlots,
    },
  };
}

function toCandidateInspectionRow(input: {
  sourceKind: CombatCandidateSourceKind;
  sourceLabel: { label: string; key: string };
  candidate: Candidate;
  opponents: CombatOpponentAdminData;
  formulas: readonly BalanceFormula[];
}): CombatCandidateInspectionRow {
  const candidateKind = dictionaryEntry(
    input.opponents.dictionaries.candidateKinds,
    input.candidate.candidateKind,
  );
  const opponent = input.candidate.opponentDefinitionId
    ? input.opponents.opponents.find((entry) => entry.id === input.candidate.opponentDefinitionId)
    : null;
  const family = input.candidate.familyKey
    ? input.opponents.families.find((entry) => entry.key === input.candidate.familyKey)
    : null;
  const formula = input.candidate.scalingFormulaId
    ? input.formulas.find((entry) => entry.id === input.candidate.scalingFormulaId)
    : null;

  return {
    id: input.candidate.id,
    sourceKind: input.sourceKind,
    sourceLabel: input.sourceLabel.label,
    sourceKey: input.sourceLabel.key,
    candidateKindKey: input.candidate.candidateKind,
    candidateKindLabel: candidateKind?.label ?? input.candidate.candidateKind,
    candidateKindDescription:
      candidateKind?.description ?? candidateKind?.helperText ?? candidateKind?.adminDescription ?? null,
    targetLabel: targetLabel(input.candidate, opponent ?? null, family ?? null),
    targetDescription:
      input.candidate.candidateKind === 'opponent'
        ? opponent?.description ?? opponent?.helperText ?? opponent?.adminDescription ?? null
        : family?.description ?? family?.helperText ?? family?.adminDescription ?? null,
    formulaLabel: formula ? `${formula.label} (${formula.key})` : 'Default combat scaling',
    levelRangeLabel: levelRangeLabel(input.candidate.minHeroLevel, input.candidate.maxHeroLevel),
    difficultyMultiplier: input.candidate.difficultyMultiplier,
    weight: input.candidate.weight,
    sortOrder: input.candidate.sortOrder,
    isActive: input.candidate.isActive,
  };
}

function targetLabel(
  candidate: Candidate,
  opponent: CombatOpponentAdminData['opponents'][number] | null,
  family: CombatOpponentAdminData['families'][number] | null,
): string {
  if (candidate.candidateKind === 'opponent') {
    return opponent
      ? `${opponent.label} (${opponent.key})`
      : candidate.opponentDefinitionId ?? 'Missing opponent';
  }

  return family ? `${family.label} (${family.key})` : candidate.familyKey ?? 'Missing family';
}

function sourceLabelFor(
  rows: ReadonlyArray<{ id: string; label: string; key: string }>,
  id: string,
) {
  const row = rows.find((entry) => entry.id === id);

  return row
    ? { label: `${row.label} (${row.key})`, key: row.key }
    : { label: `Missing source (${id})`, key: id };
}

function dictionaryEntry(
  entries: readonly CombatDictionaryReadModel[],
  key: string,
): CombatDictionaryReadModel | null {
  return entries.find((entry) => entry.key === key) ?? null;
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
