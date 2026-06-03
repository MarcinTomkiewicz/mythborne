import {
  ItemDetailPopoverDetailReadModel,
  ItemDetailPopoverDisplayTone,
  ItemDetailPopoverRequirementStatus,
} from '../domain/item/item-detail-popover-detail.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonValue,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapItemDetailPopoverDetail(
  value: Json,
  fieldPath = 'get_player_item_popover_detail',
): ItemDetailPopoverDetailReadModel {
  const detail = requiredRecord(value, fieldPath);
  const contractVersion = requiredText(
    read(detail, 'contractVersion'),
    `${fieldPath}.contractVersion`,
  );

  if (contractVersion !== 'player_item_popover_detail_v1') {
    throw new Error(
      `${fieldPath}.contractVersion must be player_item_popover_detail_v1.`,
    );
  }

  const requirementStatus = mapRequirementStatus(
    read(detail, 'requirementStatus'),
    `${fieldPath}.requirementStatus`,
  );

  return {
    contractVersion,
    source: optionalText(read(detail, 'source')),
    itemId: requiredText(read(detail, 'itemId'), `${fieldPath}.itemId`),
    heroId: optionalText(read(detail, 'heroId')),
    displayMeta: mapDisplayMeta(
      read(detail, 'displayMeta'),
      `${fieldPath}.displayMeta`,
    ),
    valueDisplay: mapValueDisplay(
      read(detail, 'valueDisplay'),
      `${fieldPath}.valueDisplay`,
    ),
    itemStats: requiredArray(
      read(detail, 'itemStats'),
      `${fieldPath}.itemStats`,
    ).map((row, index) =>
      mapValueRow(row, `${fieldPath}.itemStats[${index}]`),
    ),
    modifierRows: requiredArray(
      read(detail, 'modifierRows'),
      `${fieldPath}.modifierRows`,
    ).map((row, index) =>
      mapValueRow(row, `${fieldPath}.modifierRows[${index}]`),
    ),
    bonuses: optionalValueRows(read(detail, 'bonuses'), `${fieldPath}.bonuses`),
    bonusRows: optionalValueRows(
      read(detail, 'bonusRows'),
      `${fieldPath}.bonusRows`,
    ),
    displayBonusRows: optionalValueRows(
      read(detail, 'displayBonusRows'),
      `${fieldPath}.displayBonusRows`,
    ),
    requirements: requiredArray(
      read(detail, 'requirements'),
      `${fieldPath}.requirements`,
    ).map((row, index) =>
      mapRequirementRow(row, `${fieldPath}.requirements[${index}]`),
    ),
    requirementStatus,
    meetsRequirements: optionalBoolean(read(detail, 'meetsRequirements')),
    requirementCount: optionalNumber(read(detail, 'requirementCount')),
    unmetCount: optionalNumber(read(detail, 'unmetCount')),
    failuresJson: jsonValue(read(detail, 'failuresJson')),
    metadata: jsonValue(read(detail, 'metadata')),
  };
}

function mapDisplayMeta(value: Json | undefined, fieldPath: string) {
  const displayMeta = requiredRecord(value, fieldPath);

  return {
    itemId: requiredText(read(displayMeta, 'itemId'), `${fieldPath}.itemId`),
    heroId: optionalText(read(displayMeta, 'heroId')),
    serverId: optionalText(read(displayMeta, 'serverId')),
    itemName: requiredText(read(displayMeta, 'itemName'), `${fieldPath}.itemName`),
    lifecycleStatusKey: optionalText(read(displayMeta, 'lifecycleStatusKey')),
    lifecycleStatusLabel: optionalText(read(displayMeta, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(read(displayMeta, 'generationQualityKey')),
    displayIconKey: requiredText(
      read(displayMeta, 'displayIconKey'),
      `${fieldPath}.displayIconKey`,
    ),
    qualityLabel: optionalText(read(displayMeta, 'qualityLabel')),
    baseKey: optionalText(read(displayMeta, 'baseKey')),
    baseName: optionalText(read(displayMeta, 'baseName')),
    baseTypeKey: optionalText(read(displayMeta, 'baseTypeKey')),
    baseTypeLabel: optionalText(read(displayMeta, 'baseTypeLabel')),
    drachmaValue: optionalText(read(displayMeta, 'drachmaValue')),
    allowedSlotLabel: optionalText(read(displayMeta, 'allowedSlotLabel')),
    valueDisplay: mapValueDisplay(
      read(displayMeta, 'valueDisplay'),
      `${fieldPath}.valueDisplay`,
    ),
    equipmentArea: optionalText(read(displayMeta, 'equipmentArea')),
    handUsageKey: optionalText(read(displayMeta, 'handUsageKey')),
    handUsageLabel: optionalText(read(displayMeta, 'handUsageLabel')),
    primarySlotKey: optionalText(read(displayMeta, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(displayMeta, 'primarySlotLabel')),
    equipmentSlotKey: optionalText(read(displayMeta, 'equipmentSlotKey')),
    equipmentSlotLabel: optionalText(read(displayMeta, 'equipmentSlotLabel')),
    allowedSlotKeys: optionalTextArray(
      read(displayMeta, 'allowedSlotKeys'),
      `${fieldPath}.allowedSlotKeys`,
    ),
    equipTarget: read(displayMeta, 'equipTarget') ?? null,
    metadata: jsonValue(read(displayMeta, 'metadata')),
  };
}

function mapValueDisplay(value: Json | undefined, fieldPath: string) {
  if (value === null || value === undefined) {
    return null;
  }

  const record = requiredRecord(value, fieldPath);

  return {
    displayLabel: requiredText(read(record, 'displayLabel'), `${fieldPath}.displayLabel`),
    displayValue: requiredText(read(record, 'displayValue'), `${fieldPath}.displayValue`),
  };
}

function mapValueRow(row: JsonRecord, fieldPath: string) {
  return {
    key: optionalText(read(row, 'key')),
    label: requiredText(read(row, 'label'), `${fieldPath}.label`),
    displayValue: requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    displayTone: displayTone(
      requiredText(read(row, 'displayTone'), `${fieldPath}.displayTone`),
      `${fieldPath}.displayTone`,
    ),
    targetKey: optionalText(read(row, 'targetKey')),
    sourceKey: optionalText(read(row, 'sourceKey')),
    sourceLabel: optionalText(read(row, 'sourceLabel')),
    sortOrder: optionalNumber(read(row, 'sortOrder')),
    metadata: jsonValue(read(row, 'metadata')),
    sourceRows: jsonValue(read(row, 'sourceRows')),
  };
}

function mapRequirementRow(row: JsonRecord, fieldPath: string) {
  return {
    key: optionalText(read(row, 'key')),
    requirementDefinitionKey: optionalText(read(row, 'requirementDefinitionKey')),
    requiredStatKey: optionalText(read(row, 'requiredStatKey')),
    displayText: requiredText(read(row, 'displayText'), `${fieldPath}.displayText`),
    requiredDisplayText: optionalText(read(row, 'requiredDisplayText')),
    currentDisplayText: optionalText(read(row, 'currentDisplayText')),
    failureDisplayText: optionalText(read(row, 'failureDisplayText')),
    failureReasonLabel: optionalText(read(row, 'failureReasonLabel')),
    isMet: optionalBoolean(read(row, 'isMet')),
    requiredValue: optionalNumber(read(row, 'requiredValue')),
    currentValue: optionalNumber(read(row, 'currentValue')),
    missingValue: optionalNumber(read(row, 'missingValue')),
    metadata: jsonValue(read(row, 'metadata')),
    rawRequirement: jsonValue(read(row, 'rawRequirement')),
  };
}

function mapRequirementStatus(
  value: Json | undefined,
  fieldPath: string,
): ItemDetailPopoverRequirementStatus {
  const status = requiredRecord(value, fieldPath);

  return {
    meetsRequirements: optionalBoolean(read(status, 'meetsRequirements')),
    requirementCount: optionalNumber(read(status, 'requirementCount')),
    unmetCount: optionalNumber(read(status, 'unmetCount')),
    failuresJson: jsonValue(read(status, 'failuresJson')),
    checkJson: optionalJson(read(status, 'checkJson')),
  };
}

function optionalValueRows(value: Json | undefined, fieldPath: string) {
  if (value === null || value === undefined) {
    return [];
  }

  return requiredArray(value, fieldPath).map((row, index) =>
    mapValueRow(row, `${fieldPath}[${index}]`),
  );
}

function optionalTextArray(value: Json | undefined, fieldPath: string): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  return requiredTextArray(value, fieldPath);
}

function optionalJson(value: Json | undefined): Json | null {
  return value === undefined ? null : value;
}

function displayTone(value: string, fieldPath: string): ItemDetailPopoverDisplayTone {
  if (value === 'positive' || value === 'negative' || value === 'neutral') {
    return value;
  }

  throw new Error(`${fieldPath} must be positive, negative or neutral.`);
}
