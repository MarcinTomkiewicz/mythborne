import { REWARD_AMOUNT_MODE, REWARD_ENTRY_KIND } from '../constants/reward-runtime-keys.const';
import {
  RewardDictionaryReadModel,
  RewardProfileEntryReadModel,
  RewardProfileEntrySummaryView,
  ResourceTypeReadModel,
} from '../domain/exploration/exploration-reward.model';
import { BalanceFormula } from '../domain/formula/formula.model';
import { labelFromKey } from './dictionary-options';
import { resourceTypeDisplayLabel } from './resource-type-options';

export interface RewardProfileEntrySummaryData {
  entryKinds: RewardDictionaryReadModel[];
  amountModes: RewardDictionaryReadModel[];
  resourceTypes: ResourceTypeReadModel[];
  formulas: BalanceFormula[];
  effectDefinitions: Array<{
    id: string;
    key: string;
    label: string;
    description: string;
  }>;
}

export function toRewardProfileEntrySummary(
  data: RewardProfileEntrySummaryData,
  entry: RewardProfileEntryReadModel,
): RewardProfileEntrySummaryView {
  const kind = dictionaryEntry(data.entryKinds, entry.entryKind);
  const amountMode = dictionaryEntry(data.amountModes, entry.amountMode);
  const kindLabel = kind ? `${kind.label} (${kind.key})` : `${labelFromKey(entry.entryKind)} (${entry.entryKind})`;

  return {
    entryId: entry.id,
    label: `${entry.label} - ${kindLabel}`,
    detail: rewardEntryDetail(data, entry, amountMode?.label ?? labelFromKey(entry.amountMode)),
    dictionaryHelp: kind?.description ?? kind?.helperText ?? kind?.adminDescription ?? null,
  };
}

function rewardEntryDetail(
  data: RewardProfileEntrySummaryData,
  entry: RewardProfileEntryReadModel,
  amountModeLabel: string,
): string {
  if (entry.entryKind === REWARD_ENTRY_KIND.itemGeneration) {
    return `Item generation, count ${rangeLabel(entry.minItemCount, entry.maxItemCount)}, max quality ${entry.maxQualityKey ?? 'runtime default'}, bucket ${entry.bucketProfileId ?? 'runtime default'}.`;
  }

  if (entry.entryKind === REWARD_ENTRY_KIND.explorationEffect) {
    const effect = entry.effectDefinitionId
      ? data.effectDefinitions.find((definition) => definition.id === entry.effectDefinitionId)
      : null;

    return `Exploration effect ${effect ? `${effect.label} (${effect.key})` : entry.effectDefinitionId ?? 'not selected'}.`;
  }

  const amount = numericAmountLabel(data, entry);
  const resource = entry.entryKind === REWARD_ENTRY_KIND.resource && entry.resourceType
    ? ` ${resourceTypeDisplayLabel(data.resourceTypes, entry.resourceType)}`
    : '';

  return `${amountModeLabel}: ${amount}${resource}.`;
}

function numericAmountLabel(
  data: RewardProfileEntrySummaryData,
  entry: RewardProfileEntryReadModel,
): string {
  if (entry.amountMode === REWARD_AMOUNT_MODE.formula) {
    const formula = entry.formulaId
      ? data.formulas.find((row) => row.id === entry.formulaId)
      : null;

    return formula ? `formula ${formula.label} (${formula.key})` : entry.formulaId ?? 'formula not selected';
  }

  if (entry.amountMode === REWARD_AMOUNT_MODE.none) {
    return 'no numeric amount';
  }

  return rangeLabel(entry.minAmount, entry.maxAmount);
}

function rangeLabel(min: number | null, max: number | null): string {
  if (min !== null && max !== null) {
    return min === max ? `${min}` : `${min}-${max}`;
  }

  if (min !== null) {
    return `${min}+`;
  }

  return max !== null ? `up to ${max}` : 'not configured';
}

function dictionaryEntry(
  dictionary: RewardDictionaryReadModel[],
  key: string,
): RewardDictionaryReadModel | null {
  return dictionary.find((entry) => entry.key === key) ?? null;
}
