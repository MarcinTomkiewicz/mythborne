import {
  ItemDetailPopoverContext,
  ItemDetailPopoverRequirementState,
  ItemDetailPopoverValueRow,
  ItemDetailPopoverViewModel,
} from '../domain/item/item-detail-popover.model';
import {
  ItemDetailPopoverDetailReadModel,
  ItemDetailPopoverDisplayTone,
} from '../domain/item/item-detail-popover-detail.model';

export function itemDetailPopoverViewModel(
  detail: ItemDetailPopoverDetailReadModel,
  context: ItemDetailPopoverContext = currentContext(),
): ItemDetailPopoverViewModel {
  const displayMeta = detail.displayMeta;

  return {
    itemId: detail.itemId,
    name: displayMeta.itemName,
    description: null,
    statusLabel: null,
    headerMetaLabels: [
      displayMeta.qualityLabel,
      displayMeta.baseTypeLabel,
      displayMeta.allowedSlotLabel,
    ].filter((label): label is string => Boolean(label)),
    iconClass: `pi pi-${displayMeta.displayIconKey}`,
    valueDisplay: displayMeta.valueDisplay,
    itemStats: detail.itemStats.map((row, index) => ({
      key: `stat-${index}`,
      label: row.label,
      displayValue: row.displayValue,
      valueParts: valueParts(row.displayValue, row.displayTone),
      sourceLabel: null,
      isBoosted: row.displayTone === 'positive',
      valueTone: row.displayTone,
    })),
    modifierRows: detail.modifierRows.map((row, index) => ({
      key: `modifier-${index}`,
      label: row.label,
      displayValue: row.displayValue,
      valueParts: valueParts(row.displayValue, row.displayTone),
      sourceLabel: null,
      isBoosted: row.displayTone === 'positive',
      valueTone: row.displayTone,
    })),
    requirementRows: detail.requirements.map((row, index) => ({
      key: `requirement-${index}`,
      label: row.compactDisplay?.label ?? row.displayLabel,
      requiredValue: row.compactDisplay?.requiredValue ?? row.requiredDisplayValue,
      currentValue: row.isMet === false
        ? row.compactDisplay?.currentValue ?? row.currentDisplayValue
        : null,
      isMet: row.isMet,
      failureReason: null,
    })),
    requirementState: requirementState(detail),
    context,
    isLoading: false,
    error: null,
  };
}

function valueParts(
  displayValue: string,
  tone: ItemDetailPopoverDisplayTone,
): ItemDetailPopoverValueRow['valueParts'] {
  return [{ text: displayValue, tone }];
}

function requirementState(
  detail: ItemDetailPopoverDetailReadModel,
): ItemDetailPopoverRequirementState {
  const status = detail.requirementStatus;
  const count = status.requirementCount;
  const unmetCount = status.unmetCount;
  const meetsRequirements = status.meetsRequirements;

  if (count === 0) {
    return { kind: 'met', label: null, details: null };
  }

  if (meetsRequirements === true) {
    return { kind: 'met', label: null, details: null };
  }

  if (meetsRequirements === false || (unmetCount ?? 0) > 0) {
    return { kind: 'not_met', label: null, details: null };
  }

  return {
    kind: 'unknown',
    label: null,
    details: null,
  };
}

function currentContext(): ItemDetailPopoverContext {
  return {
    kind: 'current',
    label: null,
    capturedAt: null,
    sourceLabel: null,
  };
}
