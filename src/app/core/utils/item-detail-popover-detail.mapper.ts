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
  optionalJson,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredInteger,
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
    source: requiredText(read(detail, 'source'), `${fieldPath}.source`),
    itemId: requiredText(read(detail, 'itemId'), `${fieldPath}.itemId`),
    heroId: requiredText(read(detail, 'heroId'), `${fieldPath}.heroId`),
    displayMeta: mapDisplayMeta(
      read(detail, 'displayMeta'),
      `${fieldPath}.displayMeta`,
    ),
    valueDisplay: mapRequiredValueDisplay(
      read(detail, 'valueDisplay'),
      `${fieldPath}.valueDisplay`,
    ),
    itemStats: requiredArray(
      read(detail, 'itemStats'),
      `${fieldPath}.itemStats`,
    ).map((row, index) =>
      mapStatRow(row, `${fieldPath}.itemStats[${index}]`),
    ),
    modifierRows: requiredArray(
      read(detail, 'modifierRows'),
      `${fieldPath}.modifierRows`,
    ).map((row, index) =>
      mapModifierRow(row, `${fieldPath}.modifierRows[${index}]`),
    ),
    bonuses: optionalModifierRows(read(detail, 'bonuses'), `${fieldPath}.bonuses`),
    bonusRows: optionalModifierRows(
      read(detail, 'bonusRows'),
      `${fieldPath}.bonusRows`,
    ),
    displayBonusRows: optionalModifierRows(
      read(detail, 'displayBonusRows'),
      `${fieldPath}.displayBonusRows`,
    ),
    requirements: requiredArray(
      read(detail, 'requirements'),
      `${fieldPath}.requirements`,
    ).map((row, index) =>
      mapRequirementRow(row, `${fieldPath}.requirements[${index}]`),
    ),
    requirementsJson: optionalRequirementRows(
      read(detail, 'requirementsJson'),
      `${fieldPath}.requirementsJson`,
    ),
    requirementStatus,
    meetsRequirements: requiredBoolean(
      read(detail, 'meetsRequirements'),
      `${fieldPath}.meetsRequirements`,
    ),
    requirementCount: requiredInteger(
      read(detail, 'requirementCount'),
      `${fieldPath}.requirementCount`,
    ),
    unmetCount: requiredInteger(read(detail, 'unmetCount'), `${fieldPath}.unmetCount`),
    failuresJson: jsonValue(read(detail, 'failuresJson')),
    metadata: jsonValue(read(detail, 'metadata')),
  };
}

function mapDisplayMeta(value: Json | undefined, fieldPath: string) {
  const displayMeta = requiredRecord(value, fieldPath);

  return {
    itemId: requiredText(read(displayMeta, 'itemId'), `${fieldPath}.itemId`),
    itemName: requiredText(read(displayMeta, 'itemName'), `${fieldPath}.itemName`),
    lifecycleStatusKey: requiredText(
      read(displayMeta, 'lifecycleStatusKey'),
      `${fieldPath}.lifecycleStatusKey`,
    ),
    lifecycleStatusLabel: requiredText(
      read(displayMeta, 'lifecycleStatusLabel'),
      `${fieldPath}.lifecycleStatusLabel`,
    ),
    generationQualityKey: requiredText(
      read(displayMeta, 'generationQualityKey'),
      `${fieldPath}.generationQualityKey`,
    ),
    displayIconKey: requiredText(
      read(displayMeta, 'displayIconKey'),
      `${fieldPath}.displayIconKey`,
    ),
    qualityLabel: requiredText(read(displayMeta, 'qualityLabel'), `${fieldPath}.qualityLabel`),
    baseKey: requiredText(read(displayMeta, 'baseKey'), `${fieldPath}.baseKey`),
    baseName: requiredText(read(displayMeta, 'baseName'), `${fieldPath}.baseName`),
    baseTypeKey: requiredText(read(displayMeta, 'baseTypeKey'), `${fieldPath}.baseTypeKey`),
    baseTypeLabel: requiredText(
      read(displayMeta, 'baseTypeLabel'),
      `${fieldPath}.baseTypeLabel`,
    ),
    drachmaValue: requiredText(read(displayMeta, 'drachmaValue'), `${fieldPath}.drachmaValue`),
    allowedSlotLabel: optionalText(read(displayMeta, 'allowedSlotLabel')),
    valueDisplay: mapRequiredValueDisplay(
      read(displayMeta, 'valueDisplay'),
      `${fieldPath}.valueDisplay`,
    ),
    equipmentArea: optionalText(read(displayMeta, 'equipmentArea')),
    handUsageKey: optionalText(read(displayMeta, 'handUsageKey')),
    handUsageLabel: optionalText(read(displayMeta, 'handUsageLabel')),
    primarySlotKey: optionalText(read(displayMeta, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(displayMeta, 'primarySlotLabel')),
    allowedSlotKeys: requiredTextArray(
      read(displayMeta, 'allowedSlotKeys'),
      `${fieldPath}.allowedSlotKeys`,
    ),
  };
}

function mapRequiredValueDisplay(value: Json | undefined, fieldPath: string) {
  const record = requiredRecord(value, fieldPath);

  return {
    displayLabel: requiredText(read(record, 'displayLabel'), `${fieldPath}.displayLabel`),
    displayValue: requiredText(read(record, 'displayValue'), `${fieldPath}.displayValue`),
  };
}

function mapStatRow(row: JsonRecord, fieldPath: string) {
  const displaySection = requiredText(read(row, 'displaySection'), `${fieldPath}.displaySection`);
  const isPrimaryItemStat = requiredBoolean(
    read(row, 'isPrimaryItemStat'),
    `${fieldPath}.isPrimaryItemStat`,
  );

  if (displaySection !== 'item_stats') {
    throw new Error(`${fieldPath}.displaySection must be item_stats.`);
  }

  if (isPrimaryItemStat !== true) {
    throw new Error(`${fieldPath}.isPrimaryItemStat must be true.`);
  }

  return {
    displaySection: 'item_stats' as const,
    isPrimaryItemStat: true as const,
    label: requiredText(read(row, 'label'), `${fieldPath}.label`),
    displayValue: requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    displayTone: displayTone(
      requiredText(read(row, 'displayTone'), `${fieldPath}.displayTone`),
      `${fieldPath}.displayTone`,
    ),
    statKey: requiredText(read(row, 'statKey'), `${fieldPath}.statKey`),
    source: optionalText(read(row, 'source')),
    contract: optionalText(read(row, 'contract')),
    isMeaningful: optionalBoolean(read(row, 'isMeaningful')),
    value: optionalNumber(read(row, 'value')),
    minDamage: optionalNumber(read(row, 'minDamage')),
    maxDamage: optionalNumber(read(row, 'maxDamage')),
    rawValue: optionalNumber(read(row, 'rawValue')),
    baseValue: optionalNumber(read(row, 'baseValue')),
    rawBaseValue: optionalNumber(read(row, 'rawBaseValue')),
    modifierValue: optionalNumber(read(row, 'modifierValue')),
    rawMinDamage: optionalNumber(read(row, 'rawMinDamage')),
    rawMaxDamage: optionalNumber(read(row, 'rawMaxDamage')),
    baseMinDamage: optionalNumber(read(row, 'baseMinDamage')),
    baseMaxDamage: optionalNumber(read(row, 'baseMaxDamage')),
    rawBaseMinDamage: optionalNumber(read(row, 'rawBaseMinDamage')),
    rawBaseMaxDamage: optionalNumber(read(row, 'rawBaseMaxDamage')),
    modifierMinDamage: optionalNumber(read(row, 'modifierMinDamage')),
    modifierMaxDamage: optionalNumber(read(row, 'modifierMaxDamage')),
    modifierDamageTotal: optionalNumber(read(row, 'modifierDamageTotal')),
    baseDisplayValue: optionalText(read(row, 'baseDisplayValue')),
    modifierDisplayValue: optionalText(read(row, 'modifierDisplayValue')),
    damageRangeClamped: optionalBoolean(read(row, 'damageRangeClamped')),
    baseDamageRangeClamped: optionalBoolean(read(row, 'baseDamageRangeClamped')),
  };
}

function mapModifierRow(row: JsonRecord, fieldPath: string) {
  const displaySection = requiredText(read(row, 'displaySection'), `${fieldPath}.displaySection`);
  const isPrimaryItemStat = requiredBoolean(
    read(row, 'isPrimaryItemStat'),
    `${fieldPath}.isPrimaryItemStat`,
  );

  if (displaySection !== 'bonuses') {
    throw new Error(`${fieldPath}.displaySection must be bonuses.`);
  }

  if (isPrimaryItemStat !== false) {
    throw new Error(`${fieldPath}.isPrimaryItemStat must be false.`);
  }

  return {
    displaySection: 'bonuses' as const,
    isPrimaryItemStat: false as const,
    rowKind: requiredText(read(row, 'rowKind'), `${fieldPath}.rowKind`),
    aggregated: requiredBoolean(read(row, 'aggregated'), `${fieldPath}.aggregated`),
    label: requiredText(read(row, 'label'), `${fieldPath}.label`),
    targetLabel: optionalText(read(row, 'targetLabel')),
    targetKey: requiredText(read(row, 'targetKey'), `${fieldPath}.targetKey`),
    displayValue: requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    displayTone: displayTone(
      requiredText(read(row, 'displayTone'), `${fieldPath}.displayTone`),
      `${fieldPath}.displayTone`,
    ),
    typeKey: optionalText(read(row, 'typeKey')),
    scopeKey: optionalText(read(row, 'scopeKey')),
    valueKind: optionalText(read(row, 'valueKind')),
    rawValue: optionalNumber(read(row, 'rawValue')),
    effectiveValue: optionalNumber(read(row, 'effectiveValue')),
    sortOrder: optionalNumber(read(row, 'sortOrder')),
    sourceCount: optionalNumber(read(row, 'sourceCount')),
    sourceRows: requiredArray(read(row, 'sourceRows'), `${fieldPath}.sourceRows`)
      .map((sourceRow, index) =>
        mapModifierSourceRow(sourceRow, `${fieldPath}.sourceRows[${index}]`),
      ),
    metadata: jsonValue(read(row, 'metadata')),
  };
}

function mapModifierSourceRow(row: JsonRecord, fieldPath: string) {
  return {
    itemId: optionalText(read(row, 'itemId')),
    label: requiredText(read(row, 'label'), `${fieldPath}.label`),
    targetLabel: optionalText(read(row, 'targetLabel')),
    targetKey: requiredText(read(row, 'targetKey'), `${fieldPath}.targetKey`),
    displayValue: requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    displayTone: displayTone(
      requiredText(read(row, 'displayTone'), `${fieldPath}.displayTone`),
      `${fieldPath}.displayTone`,
    ),
    typeKey: optionalText(read(row, 'typeKey')),
    valueKind: optionalText(read(row, 'valueKind')),
    rawValue: optionalNumber(read(row, 'rawValue')),
    effectiveValue: optionalNumber(read(row, 'effectiveValue')),
    sourceKey: optionalText(read(row, 'sourceKey')),
    sourceLabel: optionalText(read(row, 'sourceLabel')),
    sourceLayer: optionalText(read(row, 'sourceLayer')),
    entityBonusId: optionalText(read(row, 'entityBonusId')),
    sourceEntityId: optionalText(read(row, 'sourceEntityId')),
    sourceEntityType: optionalText(read(row, 'sourceEntityType')),
    bonusTemplateId: optionalText(read(row, 'bonusTemplateId')),
    bonusTemplateKey: optionalText(read(row, 'bonusTemplateKey')),
    bonusTemplateLabel: optionalText(read(row, 'bonusTemplateLabel')),
    qualityMultiplier: optionalNumber(read(row, 'qualityMultiplier')),
    qualityScalesValue: optionalBoolean(read(row, 'qualityScalesValue')),
    sortOrder: optionalNumber(read(row, 'sortOrder')),
    displayBonusSourceJsonKey: optionalText(read(row, 'displayBonusSourceJsonKey')),
    metadata: jsonValue(read(row, 'metadata')),
  };
}

function mapRequirementRow(row: JsonRecord, fieldPath: string) {
  const displaySection = requiredText(read(row, 'displaySection'), `${fieldPath}.displaySection`);

  if (displaySection !== 'requirements') {
    throw new Error(`${fieldPath}.displaySection must be requirements.`);
  }

  return {
    displaySection: 'requirements' as const,
    displayTone: displayTone(
      requiredText(read(row, 'displayTone'), `${fieldPath}.displayTone`),
      `${fieldPath}.displayTone`,
    ),
    isMet: requiredBoolean(read(row, 'isMet'), `${fieldPath}.isMet`),
    displayLabel: requiredText(read(row, 'displayLabel'), `${fieldPath}.displayLabel`),
    requiredDisplayValue: requiredText(
      read(row, 'requiredDisplayValue'),
      `${fieldPath}.requiredDisplayValue`,
    ),
    currentDisplayValue: optionalText(read(row, 'currentDisplayValue')),
    missingDisplayValue: optionalText(read(row, 'missingDisplayValue')),
    failureCompactText: optionalText(read(row, 'failureCompactText')),
    compactDisplay: mapCompactDisplay(
      read(row, 'compactDisplay'),
      `${fieldPath}.compactDisplay`,
    ),
    source: optionalText(read(row, 'source')),
    authority: optionalText(read(row, 'authority')),
    displayText: requiredText(read(row, 'displayText'), `${fieldPath}.displayText`),
    shortDisplayText: optionalText(read(row, 'shortDisplayText')),
    requiredDisplayText: optionalText(read(row, 'requiredDisplayText')),
    currentDisplayText: optionalText(read(row, 'currentDisplayText')),
    currentValueLabel: optionalText(read(row, 'currentValueLabel')),
    currentValueRaw: optionalText(read(row, 'currentValueRaw')),
    requiredValueLabel: optionalText(read(row, 'requiredValueLabel')),
    requiredValueRaw: optionalText(read(row, 'requiredValueRaw')),
    missingValueLabel: optionalText(read(row, 'missingValueLabel')),
    missingValueRaw: optionalText(read(row, 'missingValueRaw')),
    missingDisplayText: optionalText(read(row, 'missingDisplayText')),
    failureDisplayText: optionalText(read(row, 'failureDisplayText')),
    failureReasonKey: optionalText(read(row, 'failureReasonKey')),
    failureReasonLabel: optionalText(read(row, 'failureReasonLabel')),
    requirementDefinitionKey: requiredText(
      read(row, 'requirementDefinitionKey'),
      `${fieldPath}.requirementDefinitionKey`,
    ),
    requirementLabel: optionalText(read(row, 'requirementLabel')),
    requiredStatKey: optionalText(read(row, 'requiredStatKey')),
    requiredStatLabel: optionalText(read(row, 'requiredStatLabel')),
    requiredBuildingKey: optionalText(read(row, 'requiredBuildingKey')),
    requiredDistrictCode: optionalText(read(row, 'requiredDistrictCode')),
    requiredResourceType: optionalText(read(row, 'requiredResourceType')),
    requiredResourceLabel: optionalText(read(row, 'requiredResourceLabel')),
    requiredValue: optionalNumber(read(row, 'requiredValue')),
    currentValue: optionalNumber(read(row, 'currentValue')),
    missingValue: optionalNumber(read(row, 'missingValue')),
    failureRow: optionalJson(read(row, 'failureRow')),
    effectiveRequirementRow: optionalJson(read(row, 'effectiveRequirementRow')),
  };
}

function mapCompactDisplay(value: Json | undefined, fieldPath: string) {
  if (value === null || value === undefined) {
    return null;
  }

  const compactDisplay = requiredRecord(value, fieldPath);

  return {
    label: requiredText(read(compactDisplay, 'label'), `${fieldPath}.label`),
    requiredValue: requiredText(
      read(compactDisplay, 'requiredValue'),
      `${fieldPath}.requiredValue`,
    ),
    currentValue: optionalText(read(compactDisplay, 'currentValue')),
    missingValue: optionalText(read(compactDisplay, 'missingValue')),
    failureText: optionalText(read(compactDisplay, 'failureText')),
    tone: displayTone(
      requiredText(read(compactDisplay, 'tone'), `${fieldPath}.tone`),
      `${fieldPath}.tone`,
    ),
  };
}

function mapRequirementStatus(
  value: Json | undefined,
  fieldPath: string,
): ItemDetailPopoverRequirementStatus {
  const status = requiredRecord(value, fieldPath);

  return {
    meetsRequirements: requiredBoolean(
      read(status, 'meetsRequirements'),
      `${fieldPath}.meetsRequirements`,
    ),
    requirementCount: requiredInteger(
      read(status, 'requirementCount'),
      `${fieldPath}.requirementCount`,
    ),
    unmetCount: requiredInteger(read(status, 'unmetCount'), `${fieldPath}.unmetCount`),
    failuresJson: jsonValue(read(status, 'failuresJson')),
    checkJson: optionalJson(read(status, 'checkJson')),
  };
}

function optionalModifierRows(value: Json | undefined, fieldPath: string) {
  if (value === null || value === undefined) {
    return [];
  }

  return requiredArray(value, fieldPath).map((row, index) =>
    mapModifierRow(row, `${fieldPath}[${index}]`),
  );
}

function optionalRequirementRows(value: Json | undefined, fieldPath: string) {
  if (value === null || value === undefined) {
    return [];
  }

  return requiredArray(value, fieldPath).map((row, index) =>
    mapRequirementRow(row, `${fieldPath}[${index}]`),
  );
}

function displayTone(value: string, fieldPath: string): ItemDetailPopoverDisplayTone {
  if (value === 'positive' || value === 'negative' || value === 'neutral') {
    return value;
  }

  throw new Error(`${fieldPath} must be positive, negative or neutral.`);
}
