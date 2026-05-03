import { COMBAT_FORMULA_TARGET } from '../constants/combat-formula-targets.const';
import { CombatOpponentAdminData } from '../domain/combat/combat-opponent.model';
import { SelectOption } from '../types/select-option.types';

export function combatOpponentFamilyOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return (data?.families ?? []).map((entry) =>
    activeOption(entry.label, entry.key, entry.isActive),
  );
}

export function combatOpponentDefinitionOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return (data?.opponents ?? []).map((entry) =>
    activeOption(entry.label, entry.key, entry.isActive, entry.id),
  );
}

export function combatOpponentEquipmentModeOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return (data?.equipmentModes ?? [])
    .filter((entry) => entry.isActive)
    .map((entry) => activeOption(entry.label, entry.key, entry.isActive));
}

export function combatOpponentEquipmentEntryModeOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return combatOpponentEquipmentModeOptions(data).filter((entry) => entry.value !== 'none');
}

export function combatOpponentStatOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return (data?.stats ?? []).map((entry) => ({
    label: `${entry.label} (${entry.key})`,
    value: entry.key,
  }));
}

export function combatOpponentSlotOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string>> {
  return (data?.equipmentSlots ?? [])
    .filter((entry) => entry.isActive)
    .map((entry) => activeOption(entry.label, entry.key, entry.isActive));
}

export function combatOpponentScalingFormulaOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string | null>> {
  const target = (data?.formulaTargets ?? [])
    .find((entry) => entry.key === COMBAT_FORMULA_TARGET.opponentScaledStat);
  const assignedFormulaIds = new Set(
    (data?.assignments ?? [])
      .filter((entry) => entry.targetId === target?.id)
      .map((entry) => entry.formulaId),
  );
  const scopedFormulas = (data?.formulas ?? []).filter((entry) =>
    entry.scopeKey === target?.scopeKey || assignedFormulaIds.has(entry.id)
  );

  return [
    { label: 'Default combat opponent scaling', value: null },
    ...scopedFormulas.map((entry) =>
      activeOption(entry.label, entry.key, entry.isEnabled, entry.id, 'disabled'),
    ),
  ];
}

export function combatOpponentQualityOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string | null>> {
  return [
    { label: 'No quality selected', value: null },
    ...(data?.itemBalance?.qualities ?? []).map((entry) =>
      activeOption(entry.label, entry.key, entry.isEnabled),
    ),
  ];
}

export function combatOpponentManualBaseOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string | null>> {
  return [
    { label: 'No base selected', value: null },
    ...(data?.itemCatalog?.bases ?? []).map((entry) => ({
      label: `${entry.name} (${entry.key})`,
      value: entry.id,
    })),
  ];
}

export function combatOpponentAffixOptions(
  data: CombatOpponentAdminData | null,
  kind: 'prefixes' | 'suffixes',
): Array<SelectOption<string | null>> {
  return [
    { label: 'No affix', value: null },
    ...(data?.itemCatalog?.[kind] ?? []).map((entry) => ({
      label: `${entry.name} (${entry.key})`,
      value: entry.id,
    })),
  ];
}

export function combatOpponentBucketProfileOptions(
  data: CombatOpponentAdminData | null,
): Array<SelectOption<string | null>> {
  return [
    { label: 'No generated profile selected', value: null },
    ...(data?.itemBalance?.bucketProfiles ?? []).map((entry) =>
      activeOption(entry.name, entry.key, entry.isActive, entry.id ?? entry.key),
    ),
  ];
}

function activeOption(
  label: string,
  key: string,
  isActive: boolean,
  value: string = key,
  inactiveLabel = 'inactive',
) {
  return {
    label: `${label} (${key})${isActive ? '' : ` - ${inactiveLabel}`}`,
    value,
  };
}
