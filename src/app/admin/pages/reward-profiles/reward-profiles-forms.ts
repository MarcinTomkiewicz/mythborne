import { FormControl, FormGroup } from '@angular/forms';
import {
  RewardOutcomeKindReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import {
  REWARD_AMOUNT_MODE,
  REWARD_ENTRY_KIND,
  REWARD_SOURCE_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { trimRequiredValidator } from '../../../core/validators/form.validators';

export function createRewardOutcomeKindForm() {
  return new FormGroup({
    sourceKind: new FormControl<string>(REWARD_SOURCE_KIND.encounter, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
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
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function createRewardProfileForm() {
  return new FormGroup({
    rewardProfileId: new FormControl<string | null>(null),
    key: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    category: new FormControl<string>(REWARD_SOURCE_KIND.encounter, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
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

export function createRewardEntryForm() {
  return new FormGroup({
    entryId: new FormControl<string | null>(null),
    entryKind: new FormControl<string>(REWARD_ENTRY_KIND.experience, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
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
    amountMode: new FormControl<string>(REWARD_AMOUNT_MODE.fixed, {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
    minAmount: new FormControl<number | null>(1),
    maxAmount: new FormControl<number | null>(1),
    resourceType: new FormControl<string | null>(null),
    formulaId: new FormControl<string | null>(null),
    chancePercent: new FormControl<number>(100, { nonNullable: true }),
    minItemCount: new FormControl<number | null>(1),
    maxItemCount: new FormControl<number | null>(1),
    maxQualityKey: new FormControl<string | null>(null),
    bucketProfileId: new FormControl<string | null>(null),
    effectDefinitionId: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    metadataJsonText: new FormControl<string>('{}', { nonNullable: true }),
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
}

export function outcomeKindFormValue(row: RewardOutcomeKindReadModel | null) {
  return {
    sourceKind: row?.sourceKind ?? REWARD_SOURCE_KIND.encounter,
    key: row?.key ?? '',
    allowKeyOverride: false,
    label: row?.label ?? '',
    description: row?.description ?? '',
    helperText: row?.helperText ?? null,
    adminDescription: row?.adminDescription ?? null,
    sortOrder: row?.sortOrder ?? 0,
    isActive: row?.isActive ?? true,
    metadataJsonText: JSON.stringify(row?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function profileFormValue(row: RewardProfileReadModel | null) {
  return {
    rewardProfileId: row?.id ?? null,
    key: row?.key ?? '',
    allowKeyOverride: false,
    label: row?.label ?? '',
    category: row?.category ?? REWARD_SOURCE_KIND.encounter,
    description: row?.description ?? '',
    helperText: row?.helperText ?? null,
    adminDescription: row?.adminDescription ?? null,
    sortOrder: row?.sortOrder ?? 0,
    isActive: row?.isActive ?? true,
    metadataJsonText: JSON.stringify(row?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

export function entryFormValue(row: RewardProfileEntryReadModel | null) {
  return {
    entryId: row?.id ?? null,
    entryKind: row?.entryKind ?? REWARD_ENTRY_KIND.experience,
    label: row?.label ?? '',
    description: row?.description ?? '',
    helperText: row?.helperText ?? null,
    adminDescription: row?.adminDescription ?? null,
    amountMode: row?.amountMode ?? defaultAmountMode(row?.entryKind ?? null),
    minAmount: row?.minAmount ?? 1,
    maxAmount: row?.maxAmount ?? row?.minAmount ?? 1,
    resourceType: row?.resourceType ?? null,
    formulaId: row?.formulaId ?? null,
    chancePercent: row?.chancePercent ?? 100,
    minItemCount: row?.minItemCount ?? 1,
    maxItemCount: row?.maxItemCount ?? row?.minItemCount ?? 1,
    maxQualityKey: row?.maxQualityKey ?? null,
    bucketProfileId: row?.bucketProfileId ?? null,
    effectDefinitionId: row?.effectDefinitionId ?? null,
    sortOrder: row?.sortOrder ?? 0,
    isActive: row?.isActive ?? true,
    metadataJsonText: JSON.stringify(row?.metadataJson ?? {}, null, 2),
    reason: '',
  };
}

function defaultAmountMode(entryKind: string | null): string {
  return entryKind === REWARD_ENTRY_KIND.itemGeneration ||
    entryKind === REWARD_ENTRY_KIND.explorationEffect
    ? REWARD_AMOUNT_MODE.none
    : REWARD_AMOUNT_MODE.fixed;
}
