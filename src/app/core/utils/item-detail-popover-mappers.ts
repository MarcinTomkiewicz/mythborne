import {
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
): ItemDetailPopoverViewModel {
  const displayMeta = detail.displayMeta;
  const itemStats = detail.itemStats.map((row, index) => ({
    key: `stat-${index}`,
    label: row.label,
    displayValue: row.displayValue,
    valueParts: row.displaySegments.length
      ? row.displaySegments
      : valueParts(row.displayValue, row.displayTone),
    valueTone: row.displaySegments.length ? 'neutral' : row.displayTone,
  }));

  return {
    itemId: detail.itemId,
    name: displayMeta.itemName,
    headerMetaLabels: [
      displayMeta.qualityLabel,
      displayMeta.baseTypeLabel,
      displayMeta.allowedSlotLabel,
    ].filter((label): label is string => Boolean(label)),
    iconClass: `pi pi-${displayMeta.displayIconKey}`,
    valueDisplay: detail.valueDisplay ?? displayMeta.valueDisplay,
    itemStats,
    modifierRows: detail.modifierRows.map((row, index) => ({
      key: `modifier-${index}`,
      label: row.label,
      displayValue: row.displayValue,
      valueParts: valueParts(row.displayValue, row.displayTone),
      valueTone: row.displayTone,
    })),
    requirementRows: detail.requirements.map((row, index) => ({
      key: `requirement-${index}`,
      label: row.compactDisplay?.label || row.displayLabel,
      requiredValue: row.compactDisplay?.requiredValue || row.requiredDisplayValue,
      currentValue: row.isMet === false
        ? row.currentDisplayText
          ?? row.currentValueLabel
          ?? row.compactDisplay?.currentValue
          ?? row.currentDisplayValue
        : null,
      isMet: row.isMet,
    })),
    requirementState: requirementState(detail),
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
  const count = status.requirementCount ?? 0;
  const unmetCount = status.unmetCount ?? 0;
  const meetsRequirements = status.meetsRequirements;

  if (count === 0) {
    return { kind: 'met' };
  }

  if (meetsRequirements === true) {
    return { kind: 'met' };
  }

  if (meetsRequirements === false || (unmetCount ?? 0) > 0) {
    return { kind: 'not_met' };
  }

  return {
    kind: 'unknown',
  };
}
