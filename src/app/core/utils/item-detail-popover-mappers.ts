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
    qualityLabel: displayMeta.qualityLabel,
    kindLabel: displayMeta.baseTypeLabel,
    slotLabel: displayMeta.allowedSlotLabel,
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
      label: row.displayText,
      requiredValue: row.requiredDisplayText,
      currentValue: row.currentDisplayText,
      isMet: row.isMet,
      failureReason: row.failureDisplayText ?? row.failureReasonLabel,
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
  const count = status.requirementCount ?? detail.requirementCount;
  const unmetCount = status.unmetCount ?? detail.unmetCount;
  const meetsRequirements = status.meetsRequirements ?? detail.meetsRequirements;

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
