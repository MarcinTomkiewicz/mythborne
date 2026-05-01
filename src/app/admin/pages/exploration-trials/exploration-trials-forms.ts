import { FormControl, FormGroup } from '@angular/forms';
import { ExplorationTrialAdminData, TrialCombatCandidateAdminView } from '../../../core/domain/exploration/exploration-trial-admin.model';

export function createTrialDefinitionForm() {
  return new FormGroup({
    trialDefinitionId: new FormControl<string | null>(null),
    key: new FormControl<string>('', { nonNullable: true }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    testedStatKey: new FormControl<string | null>(null),
    minigameKey: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
}

export function createTrialCombatCandidateForm() {
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
