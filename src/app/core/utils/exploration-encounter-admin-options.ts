import {
  COMBAT_CANDIDATE_KIND,
  ENCOUNTER_KIND_FALLBACKS,
  EXPLORATION_EFFECT_KIND_FALLBACKS,
} from '../constants/encounter-runtime-keys.const';
import {
  ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS,
  REWARD_AMOUNT_MODE_PVE_FALLBACKS,
  REWARD_SOURCE_KIND,
} from '../constants/reward-runtime-keys.const';
import { ExplorationEncounterAdminData } from '../domain/exploration/exploration-encounter-admin.model';
import { SelectOption } from '../types/select-option.types';
import { labelFromKey, optionsFromValues } from './dictionary-options';
import { isExplorationPayloadFormulaScope } from './reward-formula-options';

export const ENCOUNTER_CANDIDATE_KIND_OPTIONS = [
  { label: 'Concrete opponent', value: COMBAT_CANDIDATE_KIND.opponent },
  { label: 'Opponent family', value: COMBAT_CANDIDATE_KIND.family },
];

export const EXPLORATION_EFFECT_KIND_OPTIONS = optionsFromValues(EXPLORATION_EFFECT_KIND_FALLBACKS);

export function encounterSelectorOptions(data: ExplorationEncounterAdminData | null) {
  return (data?.encounters ?? []).map((encounter) => ({
    label: `${encounter.label} (${encounter.key})${encounter.isActive ? '' : ' - inactive'}`,
    value: encounter.id,
  }));
}

export function encounterKindOptions(data: ExplorationEncounterAdminData | null) {
  const existing = new Set((data?.encounters ?? []).map((entry) => entry.encounterKind));
  ENCOUNTER_KIND_FALLBACKS.forEach((kind) => existing.add(kind));

  return Array.from(existing).sort().map((kind) => ({
    label: labelFromKey(kind),
    value: kind,
  }));
}

export function minigameOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'No minigame', value: null },
    ...(data?.minigames ?? []).map((entry) => activeKeyOption(entry.label, entry.key, entry.isActive)),
  ];
}

export function difficultyOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'Any difficulty', value: null },
    ...(data?.difficulties ?? []).map((entry) => activeKeyOption(entry.label, entry.key, entry.isActive)),
  ];
}

export function districtOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'Any district', value: null },
    ...(data?.districts ?? []).map((entry) => ({
      label: `${entry.name} (${entry.code})`,
      value: entry.code,
    })),
  ];
}

export function rewardProfileOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'No direct reward profile', value: null },
    ...requiredRewardProfileOptions(data),
  ];
}

export function requiredRewardProfileOptions(data: ExplorationEncounterAdminData | null) {
  return (data?.rewardProfiles ?? []).map((entry) =>
    activeKeyOption(entry.label, entry.key, entry.isActive, entry.id),
  );
}

export function encounterOutcomeKindOptions(data: ExplorationEncounterAdminData | null) {
  const options = (data?.rewardOutcomeKinds ?? [])
    .filter((entry) => entry.sourceKind === REWARD_SOURCE_KIND.encounter && entry.isActive)
    .map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    }));

  return options.length > 0
    ? options
    : ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS.map((kind) => ({
      label: `${labelFromKey(kind)} (${kind})`,
      value: kind,
    }));
}

export function opponentOptions(data: ExplorationEncounterAdminData | null) {
  return (data?.opponents ?? []).map((entry) =>
    activeKeyOption(entry.label, entry.key, entry.isActive, entry.id),
  );
}

export function familyOptions(data: ExplorationEncounterAdminData | null) {
  return (data?.families ?? []).map((entry) =>
    activeKeyOption(entry.label, entry.key, entry.isActive),
  );
}

export function formulaOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'Default combat scaling', value: null },
    ...(data?.formulas ?? []).map((entry) =>
      activeKeyOption(entry.label, entry.key, entry.isEnabled, entry.id, 'disabled'),
    ),
  ];
}

export function payloadFormulaOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'No formula', value: null },
    ...(data?.formulas ?? [])
      .filter((entry) => isExplorationPayloadFormulaScope(entry.scopeKey))
      .map((entry) => activeKeyOption(entry.label, entry.key, entry.isEnabled, entry.id, 'disabled')),
  ];
}

export function bonusTemplateOptions(data: ExplorationEncounterAdminData | null) {
  return [
    { label: 'No bonus template', value: null },
    ...(data?.bonusTemplates ?? []).map((entry) =>
      activeKeyOption(entry.label, entry.key, entry.isActive, entry.id),
    ),
  ];
}

export function amountModeOptions(data: ExplorationEncounterAdminData | null): Array<SelectOption<string>> {
  const allowed = new Set<string>(REWARD_AMOUNT_MODE_PVE_FALLBACKS);
  const active = (data?.rewardEntryAmountModes ?? [])
    .filter((entry) => entry.isActive && allowed.has(entry.key))
    .map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    }));

  return active.length > 0 ? active : optionsFromValues(REWARD_AMOUNT_MODE_PVE_FALLBACKS);
}

function activeKeyOption(
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
