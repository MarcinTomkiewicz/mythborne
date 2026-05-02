import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ExplorationTrialAdminData,
  TrialCombatCandidateAdminView,
  TrialRewardAssignmentAdminView,
} from '../../../core/domain/exploration/exploration-trial-admin.model';
import { REWARD_ASSIGNMENT_MATCH_KIND } from '../../../core/constants/reward-runtime-keys.const';
import { trimRequiredValidator } from '../../../core/validators/form.validators';

export function createTrialDefinitionForm() {
  return new FormGroup({
    trialDefinitionId: new FormControl<string | null>(null),
    key: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    testedStatKey: new FormControl<string | null>(null),
    minigameKey: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createTrialCombatCandidateForm() {
  return new FormGroup({
    candidateId: new FormControl<string | null>(null),
    candidateKind: new FormControl<string>('opponent', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    opponentDefinitionId: new FormControl<string | null>(null),
    familyKey: new FormControl<string | null>(null),
    scalingFormulaId: new FormControl<string | null>(null),
    difficultyMultiplier: new FormControl<number>(1, { nonNullable: true }),
    weight: new FormControl<number>(1, { nonNullable: true }),
    minHeroLevel: new FormControl<number | null>(null),
    maxHeroLevel: new FormControl<number | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createTrialRewardAssignmentForm() {
  return new FormGroup({
    assignmentId: new FormControl<string | null>(null),
    rewardProfileId: new FormControl<string | null>(null, { validators: [Validators.required] }),
    outcomeKind: new FormControl<string>('success', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    allowOutcomeOverride: new FormControl<boolean>(false, { nonNullable: true }),
    difficultyKey: new FormControl<string | null>(null),
    difficultyMatchKind: new FormControl<string>(REWARD_ASSIGNMENT_MATCH_KIND.any, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    maxDifficultyKey: new FormControl<string | null>(null),
    districtCode: new FormControl<string | null>(null),
    districtMatchKind: new FormControl<string>(REWARD_ASSIGNMENT_MATCH_KIND.any, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    maxDistrictCode: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function trialFormValue(data: ExplorationTrialAdminData | null, trialId: string | null) {
  const trial = data?.trials.find((entry) => entry.id === trialId);

  return {
    trialDefinitionId: trial?.id ?? null,
    key: trial?.key ?? '',
    allowKeyOverride: false,
    label: trial?.label ?? '',
    description: trial?.description ?? '',
    helperText: trial?.helperText ?? null,
    adminDescription: trial?.adminDescription ?? null,
    testedStatKey: trial?.testedStatKey ?? data?.stats[0]?.key ?? null,
    minigameKey: trial?.minigameKey ?? data?.minigames[0]?.key ?? null,
    sortOrder: trial?.sortOrder ?? 0,
    isActive: trial?.isActive ?? true,
    metadataJsonText: JSON.stringify(trial?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function candidateFormValue(row: TrialCombatCandidateAdminView | null) {
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

export function assignmentFormValue(row: TrialRewardAssignmentAdminView | null) {
  const assignment = row?.assignment;

  return {
    assignmentId: assignment?.id ?? null,
    rewardProfileId: assignment?.rewardProfileId ?? null,
    outcomeKind: assignment?.outcomeKind ?? 'success',
    allowOutcomeOverride: false,
    difficultyKey: assignment?.difficultyKey ?? null,
    difficultyMatchKind: assignment?.difficultyMatchKind ?? REWARD_ASSIGNMENT_MATCH_KIND.any,
    maxDifficultyKey: assignment?.maxDifficultyKey ?? null,
    districtCode: assignment?.districtCode ?? null,
    districtMatchKind: assignment?.districtMatchKind ?? REWARD_ASSIGNMENT_MATCH_KIND.any,
    maxDistrictCode: assignment?.maxDistrictCode ?? null,
    description: assignment?.description ?? null,
    helperText: assignment?.helperText ?? null,
    sortOrder: assignment?.sortOrder ?? 0,
    isActive: assignment?.isActive ?? true,
    metadataJsonText: JSON.stringify(assignment?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}
