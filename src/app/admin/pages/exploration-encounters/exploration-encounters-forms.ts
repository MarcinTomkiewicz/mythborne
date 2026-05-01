import { FormControl, FormGroup } from '@angular/forms';
import {
  EncounterCombatCandidateAdminView,
  EncounterRewardAssignmentAdminView,
  ExplorationEncounterAdminData,
} from '../../../core/domain/exploration/exploration-encounter-admin.model';

export function createEncounterDefinitionForm() {
  return new FormGroup({
    encounterDefinitionId: new FormControl<string | null>(null),
    key: new FormControl<string>('', { nonNullable: true }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    encounterKind: new FormControl<string>('combat', { nonNullable: true }),
    minigameKey: new FormControl<string | null>(null),
    rewardProfileId: new FormControl<string | null>(null),
    minDifficultyKey: new FormControl<string | null>(null),
    maxDifficultyKey: new FormControl<string | null>(null),
    minDistrictCode: new FormControl<string | null>(null),
    maxDistrictCode: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
}

export function createEncounterCombatCandidateForm() {
  return new FormGroup({
    candidateId: new FormControl<string | null>(null),
    candidateKind: new FormControl<string>('opponent', { nonNullable: true }),
    opponentDefinitionId: new FormControl<string | null>(null),
    familyKey: new FormControl<string | null>(null),
    scalingFormulaId: new FormControl<string | null>(null),
    difficultyMultiplier: new FormControl<number>(1, { nonNullable: true }),
    weight: new FormControl<number>(1, { nonNullable: true }),
    minHeroLevel: new FormControl<number | null>(null),
    maxHeroLevel: new FormControl<number | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
}

export function createEncounterRewardAssignmentForm() {
  return new FormGroup({
    assignmentId: new FormControl<string | null>(null),
    rewardProfileId: new FormControl<string | null>(null),
    outcomeKind: new FormControl<string>('success', { nonNullable: true }),
    difficultyKey: new FormControl<string | null>(null),
    districtCode: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
}

export function encounterFormValue(
  data: ExplorationEncounterAdminData | null,
  encounterId: string | null,
) {
  const encounter = data?.encounters.find((entry) => entry.id === encounterId);

  return {
    encounterDefinitionId: encounter?.id ?? null,
    key: encounter?.key ?? '',
    allowKeyOverride: false,
    label: encounter?.label ?? '',
    description: encounter?.description ?? '',
    helperText: encounter?.helperText ?? null,
    adminDescription: encounter?.adminDescription ?? null,
    encounterKind: encounter?.encounterKind ?? 'combat',
    minigameKey: encounter?.minigameKey ?? data?.minigames[0]?.key ?? null,
    rewardProfileId: encounter?.rewardProfileId ?? null,
    minDifficultyKey: encounter?.minDifficultyKey ?? null,
    maxDifficultyKey: encounter?.maxDifficultyKey ?? null,
    minDistrictCode: encounter?.minDistrictCode ?? null,
    maxDistrictCode: encounter?.maxDistrictCode ?? null,
    sortOrder: encounter?.sortOrder ?? 0,
    isActive: encounter?.isActive ?? true,
    metadataJsonText: JSON.stringify(encounter?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function candidateFormValue(row: EncounterCombatCandidateAdminView | null) {
  const candidate = row?.candidate;

  return {
    candidateId: candidate?.id ?? null,
    candidateKind: candidate?.candidateKind ?? 'opponent',
    opponentDefinitionId: candidate?.opponentDefinitionId ?? null,
    familyKey: candidate?.familyKey ?? null,
    scalingFormulaId: candidate?.scalingFormulaId ?? null,
    difficultyMultiplier: candidate?.difficultyMultiplier ?? 1,
    weight: candidate?.weight ?? 1,
    minHeroLevel: candidate?.minHeroLevel ?? null,
    maxHeroLevel: candidate?.maxHeroLevel ?? null,
    sortOrder: candidate?.sortOrder ?? 0,
    isActive: candidate?.isActive ?? true,
    reason: '',
  };
}

export function assignmentFormValue(row: EncounterRewardAssignmentAdminView | null) {
  const assignment = row?.assignment;

  return {
    assignmentId: assignment?.id ?? null,
    rewardProfileId: assignment?.rewardProfileId ?? null,
    outcomeKind: assignment?.outcomeKind ?? 'success',
    difficultyKey: assignment?.difficultyKey ?? null,
    districtCode: assignment?.districtCode ?? null,
    description: assignment?.description ?? null,
    helperText: assignment?.helperText ?? null,
    sortOrder: assignment?.sortOrder ?? 0,
    isActive: assignment?.isActive ?? true,
    metadataJsonText: JSON.stringify(assignment?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}
