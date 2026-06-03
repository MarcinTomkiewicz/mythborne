import {
  ItemDetailPopoverContext,
  ItemDetailPopoverRequirementState,
  ItemDetailPopoverValueRow,
  ItemDetailPopoverViewModel,
} from '../domain/item/item-detail-popover.model';
import {
  classifyItemDisplay,
} from '../domain/equipment/equipment-preview.mapper';
import { ArmoryItemDetailReadModel } from '../domain/item/item-equipment.model';
import { PartialItemDetailPopoverInput } from '../types/item-detail-popover.types';
import { normalizeBonusTargetKey } from './bonus';
import { humanizeKey, trimText } from './normalize-text';

export function armoryDetailPopover(
  detail: ArmoryItemDetailReadModel,
  context: ItemDetailPopoverContext = currentContext('Current item'),
): ItemDetailPopoverViewModel {
  const requirementPreview = detail.requirementPreview;
  const failedRequirementKeys = new Set(requirementPreview?.failedRequirementKeys ?? []);
  const itemDisplay = classifyItemDisplay({ baseTypeKey: detail.baseTypeKey });
  const requirementRows = requirementPreview?.effectiveRequirements.map((requirement) => ({
    key: `${requirement.requirementDefinitionKey}-${requirement.requiredStatKey ?? 'any'}`,
    label: requirement.displayLabel,
    requiredValue: requirement.displayValue,
    currentValue: requirement.currentValueLabel ?? null,
    isMet: requirement.isMet ?? requirementIsMet(
      failedRequirementKeys,
      requirement.requirementDefinitionKey,
      requirement.requiredStatKey,
    ),
    failureReason: requirement.failureReasonLabel ?? null,
  })) ?? [];

  return {
    itemId: detail.itemId,
    name: detail.name,
    description: null,
    statusLabel: detail.lifecycleStatus ? humanizeKey(detail.lifecycleStatus) : null,
    qualityLabel: displayLabel(detail.qualityLabel),
    kindLabel: itemDisplay.kindLabel
      ?? displayLabel(detail.baseTypeKey)
      ?? displayLabel(detail.baseLabel),
    slotLabel: itemDisplay.slotLabel,
    iconClass: itemDisplay.iconClass,
    drachmaValue: detail.drachmaValue,
    valueDisplay: null,
    nativeStats: detail.itemStats.map((stat, index) => ({
      key: `stat-${index}-${stat.label}`,
      label: stat.label,
      displayValue: stat.displayValue,
      valueParts: statValueParts(stat.statKey, stat.displayValue, detail.bonuses),
      sourceLabel: null,
      isBoosted: (stat.numericValue ?? null) !== null && (stat.numericValue ?? 0) > 0,
      valueTone: valueTone(stat.numericValue ?? null),
    })),
    bonusRows: detail.bonuses.map((bonus, index) => ({
      key: `${bonus.sourceKey ?? 'bonus'}-${index}-${bonus.label}`,
      label: bonus.label,
      displayValue: bonus.displayValue,
      valueParts: [{
        text: bonus.displayValue,
        tone: valueTone(bonus.numericValue),
      }],
      sourceLabel: null,
      isBoosted: bonus.numericValue !== null && bonus.numericValue > 0,
      valueTone: valueTone(bonus.numericValue),
    })),
    requirementRows,
    requirementState: requirementState(requirementPreview, requirementRows.length),
    context,
    isLoading: false,
    error: null,
  };
}

function requirementIsMet(
  failedRequirementKeys: ReadonlySet<string>,
  requirementDefinitionKey: string,
  requiredStatKey: string | null,
): boolean | null {
  const key = `${requirementDefinitionKey}:${requiredStatKey ?? ''}`;

  if (failedRequirementKeys.has(key)) {
    return false;
  }

  return null;
}

export function partialItemPopover(
  input: PartialItemDetailPopoverInput,
): ItemDetailPopoverViewModel {
  return {
    itemId: input.itemId,
    name: input.name,
    description: input.description,
    statusLabel: partialDisplayLabel(input.statusLabel, input.preserveDisplayLabels),
    qualityLabel: partialDisplayLabel(input.qualityLabel, input.preserveDisplayLabels),
    kindLabel: partialDisplayLabel(input.kindLabel, input.preserveDisplayLabels),
    slotLabel: partialDisplayLabel(input.slotLabel, input.preserveDisplayLabels),
    iconClass: input.iconClass,
    drachmaValue: input.drachmaValue,
    valueDisplay: input.valueDisplay,
    nativeStats: [...input.detailRows],
    bonusRows: [],
    requirementRows: [],
    requirementState: {
      kind: 'unknown',
      label: 'Requirements unavailable.',
      details: null,
    },
    context: input.context,
    isLoading: input.isLoading,
    error: input.error,
  };
}

function displayLabel(value: string | null): string | null {
  return value?.trim() ? humanizeKey(value) : null;
}

function partialDisplayLabel(
  value: string | null,
  preserveDisplayLabel: boolean,
): string | null {
  if (!preserveDisplayLabel) {
    return displayLabel(value);
  }

  const label = trimText(value);

  return label || null;
}

function statValueParts(
  statKey: string | null,
  displayValue: string,
  bonuses: readonly ArmoryItemDetailReadModel['bonuses'][number][],
): ItemDetailPopoverValueRow['valueParts'] {
  if (normalizeBonusTargetKey(statKey) !== 'damage') {
    return [{ text: displayValue, tone: 'neutral' }];
  }

  const separatorIndex = displayValue.indexOf('-');
  if (separatorIndex < 0) {
    return [{ text: displayValue, tone: 'neutral' }];
  }

  const min = displayValue.slice(0, separatorIndex).trim();
  const separator = displayValue.slice(separatorIndex, separatorIndex + 1);
  const max = displayValue.slice(separatorIndex + 1).trim();

  return [
    { text: min, tone: targetTone(bonuses, 'min_damage') },
    { text: separator, tone: 'neutral' as const },
    { text: max, tone: targetTone(bonuses, 'max_damage') },
  ].filter((part) => part.text.length > 0);
}

function targetTone(
  bonuses: readonly ArmoryItemDetailReadModel['bonuses'][number][],
  targetKey: string,
): ItemDetailPopoverValueRow['valueTone'] {
  const normalizedTarget = normalizeBonusTargetKey(targetKey);
  const total = bonuses
    .filter((bonus) => normalizeBonusTargetKey(bonus.targetKey) === normalizedTarget)
    .reduce((sum, bonus) => sum + (bonus.numericValue ?? 0), 0);

  return valueTone(total || null);
}

function valueTone(value: number | null): ItemDetailPopoverValueRow['valueTone'] {
  if (value === null || value === 0) {
    return 'neutral';
  }

  return value > 0 ? 'positive' : 'negative';
}

function requirementState(
  preview: ArmoryItemDetailReadModel['requirementPreview'],
  renderedRequirementCount: number,
): ItemDetailPopoverRequirementState {
  if (!preview) {
    return { kind: 'unknown', label: 'Unchecked', details: null };
  }

  if (preview.meetsRequirements === true) {
    if (preview.requirementCount === 0 || renderedRequirementCount > 0) {
      return { kind: 'met', label: 'Met', details: null };
    }

    return { kind: 'unknown', label: 'Unchecked', details: null };
  }

  if (preview.meetsRequirements === false) {
    return { kind: 'not_met', label: 'Not met', details: null };
  }

  return { kind: 'unknown', label: 'Unchecked', details: null };
}

function currentContext(label: string): ItemDetailPopoverContext {
  return {
    kind: 'current',
    label,
    capturedAt: null,
    sourceLabel: null,
  };
}
