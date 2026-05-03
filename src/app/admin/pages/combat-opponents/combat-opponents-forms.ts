import { FormControl, FormGroup, Validators } from '@angular/forms';
import { trimRequiredValidator } from '../../../core/validators/form.validators';
import {
  CombatOpponentAdminData,
  CombatOpponentAdminView,
  CombatOpponentAttackSourceView,
  CombatOpponentEquipmentEntryView,
  CombatOpponentFamilyReadModel,
  CombatOpponentStatBaselineView,
} from '../../../core/domain/combat/combat-opponent.model';

export function createCombatOpponentFamilyForm() {
  return new FormGroup({
    key: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
  });
}

export function createCombatOpponentDefinitionForm() {
  return new FormGroup({
    opponentDefinitionId: new FormControl<string | null>(null),
    key: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    familyKey: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    equipmentMode: new FormControl<string>('none', { nonNullable: true, validators: [trimRequiredValidator()] }),
    defaultScalingFormulaId: new FormControl<string | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
  });
}

export function createCombatOpponentStatForm() {
  return new FormGroup({
    statValueId: new FormControl<string | null>(null),
    statKey: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    baseValue: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
  });
}

export function createCombatOpponentAttackForm() {
  return new FormGroup({
    attackSourceId: new FormControl<string | null>(null),
    key: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    allowKeyOverride: new FormControl<boolean>(false, { nonNullable: true }),
    label: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    description: new FormControl<string | null>(null),
    helperText: new FormControl<string | null>(null),
    adminDescription: new FormControl<string | null>(null),
    minOpponentLevel: new FormControl<number | null>(null),
    maxOpponentLevel: new FormControl<number | null>(null),
    attackCount: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    minDamage: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    maxDamage: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    criticalChance: new FormControl<number>(5, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(100)] }),
    criticalDamage: new FormControl<number>(50, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
  });
}

export function createCombatOpponentEquipmentForm() {
  return new FormGroup({
    equipmentEntryId: new FormControl<string | null>(null),
    slotKey: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
    entryMode: new FormControl<string>('manual', { nonNullable: true, validators: [trimRequiredValidator()] }),
    manualBaseId: new FormControl<string | null>(null),
    manualQualityKey: new FormControl<string | null>(null),
    manualPrefixAffixId: new FormControl<string | null>(null),
    manualSuffixAffixId: new FormControl<string | null>(null),
    generatedBucketProfileId: new FormControl<string | null>(null),
    generatedMaxQualityKey: new FormControl<string | null>(null),
    minOpponentLevel: new FormControl<number | null>(null),
    maxOpponentLevel: new FormControl<number | null>(null),
    sortOrder: new FormControl<number>(0, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true, validators: [trimRequiredValidator()] }),
  });
}

export function familyFormValue(family: CombatOpponentFamilyReadModel | null, sortOrder = 0) {
  return {
    key: family?.key ?? '',
    allowKeyOverride: Boolean(family),
    label: family?.label ?? '',
    description: family?.description ?? null,
    helperText: family?.helperText ?? null,
    adminDescription: family?.adminDescription ?? null,
    sortOrder: family?.sortOrder ?? sortOrder,
    isActive: family?.isActive ?? true,
    reason: '',
  };
}

export function definitionFormValue(
  data: CombatOpponentAdminData | null,
  view: CombatOpponentAdminView | null,
  sortOrder = 0,
) {
  const opponent = view?.opponent;

  return {
    opponentDefinitionId: opponent?.id ?? null,
    key: opponent?.key ?? '',
    allowKeyOverride: Boolean(opponent),
    label: opponent?.label ?? '',
    description: opponent?.description ?? null,
    helperText: opponent?.helperText ?? null,
    adminDescription: opponent?.adminDescription ?? null,
    familyKey: opponent?.familyKey ?? data?.families[0]?.key ?? '',
    equipmentMode: opponent?.equipmentMode ?? data?.equipmentModes[0]?.key ?? 'none',
    defaultScalingFormulaId: opponent?.defaultScalingFormulaId ?? null,
    sortOrder: opponent?.sortOrder ?? sortOrder,
    isActive: opponent?.isActive ?? true,
    reason: '',
  };
}

export function statFormValue(
  data: CombatOpponentAdminData | null,
  row: CombatOpponentStatBaselineView | null,
  sortOrder = 0,
) {
  return {
    statValueId: row?.stat.id ?? null,
    statKey: row?.stat.statKey ?? data?.stats[0]?.key ?? '',
    baseValue: row?.stat.baseValue ?? 1,
    sortOrder: row?.stat.sortOrder ?? sortOrder,
    reason: '',
  };
}

export function attackFormValue(row: CombatOpponentAttackSourceView | null, sortOrder = 0) {
  const attack = row?.attack;

  return {
    attackSourceId: attack?.id ?? null,
    key: attack?.key ?? '',
    allowKeyOverride: Boolean(attack),
    label: attack?.label ?? '',
    description: attack?.description ?? null,
    helperText: attack?.helperText ?? null,
    adminDescription: attack?.adminDescription ?? null,
    minOpponentLevel: attack?.minOpponentLevel ?? null,
    maxOpponentLevel: attack?.maxOpponentLevel ?? null,
    attackCount: attack?.attackCount ?? 1,
    minDamage: attack?.minDamage ?? 1,
    maxDamage: attack?.maxDamage ?? attack?.minDamage ?? 1,
    criticalChance: attack?.criticalChance ?? 5,
    criticalDamage: attack?.criticalDamage ?? 50,
    sortOrder: attack?.sortOrder ?? sortOrder,
    isActive: attack?.isActive ?? true,
    reason: '',
  };
}

export function equipmentFormValue(
  data: CombatOpponentAdminData | null,
  row: CombatOpponentEquipmentEntryView | null,
  sortOrder = 0,
) {
  const entry = row?.entry;
  const defaultSlotKey = data?.equipmentSlots.find((slot) => slot.isActive)?.key ?? '';

  return {
    equipmentEntryId: entry?.id ?? null,
    slotKey: entry?.slotKey ?? defaultSlotKey,
    entryMode: entry?.entryMode === 'generated' ? 'generated' : 'manual',
    manualBaseId: entry?.manualBaseId ?? null,
    manualQualityKey: entry?.manualQualityKey ?? null,
    manualPrefixAffixId: entry?.manualPrefixAffixId ?? null,
    manualSuffixAffixId: entry?.manualSuffixAffixId ?? null,
    generatedBucketProfileId: entry?.generatedBucketProfileId ?? null,
    generatedMaxQualityKey: entry?.generatedMaxQualityKey ?? null,
    minOpponentLevel: entry?.minOpponentLevel ?? null,
    maxOpponentLevel: entry?.maxOpponentLevel ?? null,
    sortOrder: entry?.sortOrder ?? sortOrder,
    isActive: entry?.isActive ?? true,
    reason: '',
  };
}
