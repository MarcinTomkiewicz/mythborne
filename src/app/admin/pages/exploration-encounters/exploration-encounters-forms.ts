import { FormControl, FormGroup, Validators } from '@angular/forms';
import { trimRequiredValidator } from '../../../core/validators/form.validators';
import { EncounterCombatCandidateAdminView, EncounterEffectPayloadAdminView, EncounterResourcePayloadAdminView, EncounterRewardAssignmentAdminView, ExplorationEncounterAdminData, ExplorationEffectDefinitionAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { COMBAT_CANDIDATE_KIND, ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS, REWARD_AMOUNT_MODE, REWARD_ASSIGNMENT_MATCH_KIND } from '../../../core/constants/reward-runtime-keys.const';

export function createEncounterDefinitionForm() {
  return new FormGroup({
    encounterDefinitionId: new FormControl<string | null>(null),
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
    encounterKind: new FormControl<string>(ENCOUNTER_KIND.combat, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    minigameKey: new FormControl<string | null>(null),
    rewardProfileId: new FormControl<string | null>(null),
    minDifficultyKey: new FormControl<string | null>(null),
    maxDifficultyKey: new FormControl<string | null>(null),
    minDistrictCode: new FormControl<string | null>(null),
    maxDistrictCode: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createEncounterCombatCandidateForm() {
  return new FormGroup({
    candidateId: new FormControl<string | null>(null),
    candidateKind: new FormControl<string>(COMBAT_CANDIDATE_KIND.opponent, {
      nonNullable: true, validators: [trimRequiredValidator()],
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

export function createEncounterRewardAssignmentForm() {
  return new FormGroup({
    assignmentId: new FormControl<string | null>(null),
    rewardProfileId: new FormControl<string | null>(null, { validators: [Validators.required] }),
    outcomeKind: new FormControl<string>(ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS[0], {
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

export function createEncounterResourcePayloadForm() {
  return new FormGroup({
    payloadId: new FormControl<string | null>(null),
    resourceType: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    amountMode: new FormControl<string>(REWARD_AMOUNT_MODE.fixed, {
      nonNullable: true, validators: [trimRequiredValidator()],
    }),
    minAmount: new FormControl<number | null>(1),
    maxAmount: new FormControl<number | null>(1),
    formulaId: new FormControl<string | null>(null),
    chancePercent: new FormControl<number>(100, { nonNullable: true }),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createExplorationEffectDefinitionForm() {
  return new FormGroup({
    effectDefinitionId: new FormControl<string | null>(null),
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
    effectKind: new FormControl<string>(ENCOUNTER_KIND.buff, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    bonusTemplateId: new FormControl<string | null>(null),
    defaultValue: new FormControl<number | null>(null),
    defaultDurationSteps: new FormControl<number | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createEncounterEffectPayloadForm() {
  return new FormGroup({
    payloadId: new FormControl<string | null>(null),
    effectDefinitionId: new FormControl<string | null>(null, { validators: [Validators.required] }),
    chancePercent: new FormControl<number>(100, { nonNullable: true }),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
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
    encounterKind: encounter?.encounterKind ?? ENCOUNTER_KIND.combat,
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
    candidateKind: candidate?.candidateKind ?? COMBAT_CANDIDATE_KIND.opponent,
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
    outcomeKind: assignment?.outcomeKind ?? ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS[0],
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

export function resourcePayloadFormValue(row: EncounterResourcePayloadAdminView | null) {
  const payload = row?.payload;

  return {
    payloadId: payload?.id ?? null,
    resourceType: payload?.resourceType ?? '',
    amountMode: payload?.amountMode ?? REWARD_AMOUNT_MODE.fixed,
    minAmount: payload?.minAmount ?? 1,
    maxAmount: payload?.maxAmount ?? payload?.minAmount ?? 1,
    formulaId: payload?.formulaId ?? null,
    chancePercent: payload?.chancePercent ?? 100,
    description: payload?.description ?? null,
    helperText: payload?.helperText ?? null,
    adminDescription: payload?.adminDescription ?? null,
    sortOrder: payload?.sortOrder ?? 0,
    isActive: payload?.isActive ?? true,
    metadataJsonText: JSON.stringify(payload?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function effectDefinitionFormValue(row: ExplorationEffectDefinitionAdminView | null) {
  const effect = row?.effect;

  return {
    effectDefinitionId: effect?.id ?? null,
    key: effect?.key ?? '',
    allowKeyOverride: false,
    label: effect?.label ?? '',
    description: effect?.description ?? '',
    helperText: effect?.helperText ?? null,
    adminDescription: effect?.adminDescription ?? null,
    effectKind: effect?.effectKind ?? ENCOUNTER_KIND.buff,
    bonusTemplateId: effect?.bonusTemplateId ?? null,
    defaultValue: effect?.defaultValue ?? null,
    defaultDurationSteps: effect?.defaultDurationSteps ?? null,
    sortOrder: effect?.sortOrder ?? 0,
    isActive: effect?.isActive ?? true,
    metadataJsonText: JSON.stringify(effect?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function effectPayloadFormValue(row: EncounterEffectPayloadAdminView | null) {
  const payload = row?.payload;

  return {
    payloadId: payload?.id ?? null,
    effectDefinitionId: payload?.effectDefinitionId ?? null,
    chancePercent: payload?.chancePercent ?? 100,
    description: payload?.description ?? null,
    helperText: payload?.helperText ?? null,
    adminDescription: payload?.adminDescription ?? null,
    sortOrder: payload?.sortOrder ?? 0,
    isActive: payload?.isActive ?? true,
    metadataJsonText: JSON.stringify(payload?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}
