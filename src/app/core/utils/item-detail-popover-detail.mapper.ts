import {
  ItemDetailPopoverDetailReadModel,
  ItemDetailPopoverDisplayTone,
  ItemDetailPopoverModifierRow,
  ItemDetailPopoverRequirementRow,
  ItemDetailPopoverRequirementStatus,
  ItemDetailPopoverStatRow,
  ItemDetailPopoverStatValueSegment,
} from '../domain/item/item-detail-popover-detail.model';
import { PlayerItemDisplayCoreValueDisplay } from '../domain/item/player-item-display-core.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonRecord,
  mapJsonArray,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredNullableText,
  requiredRecord,
  requiredText,
  rowsValue,
} from './json-read';

export function mapItemDetailPopoverDetail(
  value: Json,
  fieldPath = 'item_popover_detail',
): ItemDetailPopoverDetailReadModel {
  const root = requiredRecord(value, fieldPath);
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    `${fieldPath}.contractVersion`,
  );

  if (contractVersion !== 'item_detail_popover_detail_v1') {
    throw new Error(`${fieldPath}.contractVersion must be item_detail_popover_detail_v1.`);
  }

  const detail = jsonRecord(read(root, 'detail'));
  const itemDetailValue = read(root, 'itemDetail') ?? read(detail, 'itemDetail');
  const itemDetailFieldPath = read(root, 'itemDetail') !== undefined
    ? `${fieldPath}.itemDetail`
    : `${fieldPath}.detail.itemDetail`;
  const itemDetail = requiredRecord(itemDetailValue, itemDetailFieldPath);
  const bonusesJson = jsonRecord(read(itemDetail, 'bonuses_json', 'bonusesJson'))
    ?? jsonRecord(read(detail, 'bonuses_json', 'bonusesJson'));
  const displayMetaSource = jsonRecord(read(itemDetail, 'displayMeta'))
    ?? jsonRecord(read(detail, 'displayMeta'))
    ?? jsonRecord(read(bonusesJson, 'displayMeta'));
  const displayMeta = mapDisplayMeta(
    displayMetaSource,
    itemDetail,
    itemDetailFieldPath,
  );
  const valueDisplay = mapValueDisplay(
    read(itemDetail, 'valueDisplay')
    ?? read(bonusesJson, 'valueDisplay')
    ?? read(displayMetaSource, 'valueDisplay'),
  );
  const requirements = mapRequirementRows(
    rowsValue(read(bonusesJson, 'requirementsJson'))
    ?? rowsValue(read(bonusesJson, 'requirements'))
    ?? rowsValue(read(itemDetail, 'requirementsJson'))
    ?? rowsValue(read(itemDetail, 'requirements'))
    ?? rowsValue(read(detail, 'requirementsJson'))
    ?? rowsValue(read(detail, 'requirements')),
  );
  const requirementStatus = mapRequirementStatus(
    jsonRecord(read(bonusesJson, 'requirementStatus'))
    ?? jsonRecord(read(itemDetail, 'requirementStatus')),
    bonusesJson,
    itemDetail,
  );

  return {
    contractVersion,
    itemId: requiredNullableText(read(itemDetail, 'item_id', 'itemId') ?? null, `${itemDetailFieldPath}.item_id`),
    displayMeta,
    valueDisplay,
    itemStats: mapStatRows(
      rowsValue(read(bonusesJson, 'itemStats'))
      ?? rowsValue(read(itemDetail, 'itemStats')),
    ),
    modifierRows: mapModifierRows(
      rowsValue(read(bonusesJson, 'displayBonusRows'))
      ?? rowsValue(read(bonusesJson, 'bonusRows'))
      ?? rowsValue(read(bonusesJson, 'itemStats'), 'bonusRows')
      ?? rowsValue(read(bonusesJson, 'bonuses'))
      ?? rowsValue(read(bonusesJson, 'modifierRows'))
      ?? rowsValue(read(itemDetail, 'displayBonusRows'))
      ?? rowsValue(read(itemDetail, 'bonusRows'))
      ?? rowsValue(read(itemDetail, 'itemStats'), 'bonusRows')
      ?? rowsValue(read(itemDetail, 'bonuses'))
      ?? rowsValue(read(itemDetail, 'modifierRows')),
    ),
    requirements,
    requirementStatus,
  };
}

function mapDisplayMeta(
  displayMeta: JsonRecord | null,
  itemDetail: JsonRecord,
  fieldPath: string,
) {
  return {
    itemName: requiredText(
      read(displayMeta, 'itemName') ?? read(itemDetail, 'item_name', 'itemName'),
      `${fieldPath}.item_name`,
    ),
    displayIconKey: optionalText(read(displayMeta, 'displayIconKey')) ?? 'box',
    qualityLabel: optionalText(read(displayMeta, 'qualityLabel')),
    baseTypeLabel: optionalText(read(displayMeta, 'baseTypeLabel')),
    allowedSlotLabel: optionalText(read(displayMeta, 'allowedSlotLabel')),
    valueDisplay: mapValueDisplay(read(displayMeta, 'valueDisplay')),
  };
}

function mapStatRows(value: Json | undefined): ItemDetailPopoverStatRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    label: requiredText(read(row, 'label', 'displayLabel'), `itemStats[${index}].label`),
    displayValue: requiredText(read(row, 'displayValue'), `itemStats[${index}].displayValue`),
    displayTone: displayTone(read(row, 'displayTone')),
    displaySegments: mapStatValueSegments(
      read(row, 'displaySegments', 'displayValueSegments', 'valueParts'),
      `itemStats[${index}].displaySegments`,
    ),
  }));
}

function mapStatValueSegments(
  value: Json | undefined,
  field: string,
): ItemDetailPopoverStatValueSegment[] {
  return mapJsonArray(value, (segment) => segment).map((segment, index) => ({
    text: requiredText(
      read(segment, 'text') ?? read(segment, 'displayValue'),
      `${field}[${index}].text`,
    ),
    tone: displayTone(read(segment, 'tone')),
  }));
}

function mapModifierRows(value: Json | undefined): ItemDetailPopoverModifierRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    label: optionalText(read(row, 'label'))
      ?? optionalText(read(row, 'displayLabel'))
      ?? requiredText(read(row, 'targetLabel'), `bonusRows[${index}].targetLabel`),
    displayValue: requiredText(read(row, 'displayValue'), `bonusRows[${index}].displayValue`),
    displayTone: displayTone(read(row, 'displayTone')),
  }));
}

function mapRequirementRows(value: Json | undefined): ItemDetailPopoverRequirementRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    isMet: optionalBoolean(read(row, 'isMet')) ?? null,
    displayLabel: optionalText(read(row, 'displayLabel'))
      ?? optionalText(read(row, 'displayText'))
      ?? requiredText(read(row, 'shortDisplayText'), `requirements[${index}].displayLabel`),
    requiredDisplayValue: optionalText(read(row, 'requiredDisplayValue'))
      ?? optionalText(read(row, 'requiredValueLabel'))
      ?? optionalText(read(row, 'requiredDisplayText'))
      ?? null,
    currentDisplayValue: optionalText(read(row, 'currentDisplayValue'))
      ?? optionalText(read(row, 'currentValueLabel'))
      ?? optionalText(read(row, 'currentDisplayText')),
    compactDisplay: mapCompactDisplay(read(row, 'compactDisplay')),
    currentDisplayText: optionalText(read(row, 'currentDisplayText')),
    currentValueLabel: optionalText(read(row, 'currentValueLabel')),
  }));
}

function mapRequirementStatus(
  status: JsonRecord | null,
  bonusesJson: JsonRecord | null,
  itemDetail: JsonRecord,
): ItemDetailPopoverRequirementStatus {
  return {
    meetsRequirements: optionalBoolean(read(status, 'meetsRequirements'))
      ?? optionalBoolean(read(bonusesJson, 'meetsRequirements'))
      ?? optionalBoolean(read(itemDetail, 'meetsRequirements')),
    requirementCount: optionalNumber(read(status, 'requirementCount'))
      ?? optionalNumber(read(bonusesJson, 'requirementCount'))
      ?? optionalNumber(read(itemDetail, 'requirementCount')),
    unmetCount: optionalNumber(read(status, 'unmetCount'))
      ?? optionalNumber(read(bonusesJson, 'unmetCount'))
      ?? optionalNumber(read(itemDetail, 'unmetCount')),
  };
}

function mapCompactDisplay(value: Json | undefined) {
  const row = jsonRecord(value);

  return row
    ? {
        label: optionalText(read(row, 'label')) ?? '',
        requiredValue: optionalText(read(row, 'requiredValue')) ?? '',
        currentValue: optionalText(read(row, 'currentValue')),
      }
    : null;
}

function mapValueDisplay(value: Json | undefined): PlayerItemDisplayCoreValueDisplay | null {
  const row = jsonRecord(value);

  return row
    ? {
        displayLabel: requiredText(read(row, 'displayLabel'), 'valueDisplay.displayLabel'),
        displayValue: requiredText(read(row, 'displayValue'), 'valueDisplay.displayValue'),
      }
    : null;
}

function displayTone(value: Json | undefined): ItemDetailPopoverDisplayTone {
  return optionalText(value) ?? 'neutral';
}
