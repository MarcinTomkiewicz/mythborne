import {
  ItemDetailPopoverAccess,
  ItemDetailPopoverDetailReadModel,
  ItemDetailPopoverDisplayTone,
  ItemDetailPopoverModifierRow,
  ItemDetailPopoverRequirementRow,
  ItemDetailPopoverRequirementStatus,
  ItemDetailPopoverStatRow,
} from '../domain/item/item-detail-popover-detail.model';
import { PlayerItemDisplayCoreValueDisplay } from '../domain/item/player-item-display-core.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonValue,
  mapJsonArray,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredBoolean,
  requiredRecord,
  requiredText,
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

  const access = mapAccess(requiredRecord(read(root, 'access'), `${fieldPath}.access`));
  const itemDetail = requiredRecord(read(root, 'itemDetail'), `${fieldPath}.itemDetail`);
  const bonusesJson = optionalRecord(read(itemDetail, 'bonuses_json', 'bonusesJson'));
  const displayMetaSource = optionalRecord(read(itemDetail, 'displayMeta'))
    ?? optionalRecord(read(bonusesJson, 'displayMeta'));
  const displayMeta = mapDisplayMeta(
    displayMetaSource,
    itemDetail,
    `${fieldPath}.itemDetail`,
  );
  const valueDisplay = mapValueDisplay(
    read(itemDetail, 'valueDisplay')
    ?? read(bonusesJson, 'valueDisplay')
    ?? read(displayMetaSource, 'valueDisplay'),
  );
  const requirements = mapRequirementRows(
    read(bonusesJson, 'requirementsJson')
    ?? read(bonusesJson, 'requirements')
    ?? read(itemDetail, 'requirementsJson')
    ?? read(itemDetail, 'requirements'),
  );
  const requirementStatus = mapRequirementStatus(
    optionalRecord(read(bonusesJson, 'requirementStatus'))
    ?? optionalRecord(read(itemDetail, 'requirementStatus')),
    bonusesJson,
    itemDetail,
  );

  return {
    contractVersion,
    access,
    source: access.accessKind,
    itemId: requiredText(read(itemDetail, 'item_id', 'itemId'), `${fieldPath}.itemDetail.item_id`),
    heroId: optionalText(read(itemDetail, 'hero_id', 'heroId')),
    displayMeta,
    valueDisplay,
    itemStats: mapStatRows(read(bonusesJson, 'itemStats')),
    modifierRows: mapModifierRows(
      read(bonusesJson, 'displayBonusRows')
      ?? read(bonusesJson, 'bonusRows')
      ?? read(bonusesJson, 'bonuses')
      ?? read(bonusesJson, 'modifierRows'),
    ),
    bonuses: mapModifierRows(read(bonusesJson, 'bonuses')),
    bonusRows: mapModifierRows(read(bonusesJson, 'bonusRows')),
    displayBonusRows: mapModifierRows(read(bonusesJson, 'displayBonusRows')),
    requirements,
    requirementsJson: mapRequirementRows(read(itemDetail, 'requirementsJson')),
    requirementStatus,
    meetsRequirements: requirementStatus.meetsRequirements,
    requirementCount: requirementStatus.requirementCount,
    unmetCount: requirementStatus.unmetCount,
    failuresJson: jsonValue(
      read(bonusesJson, 'failuresJson')
      ?? read(itemDetail, 'failuresJson'),
    ),
    metadata: jsonValue(read(bonusesJson, 'metadata')),
  };
}

function mapAccess(access: JsonRecord): ItemDetailPopoverAccess {
  return {
    accessKind: requiredText(read(access, 'accessKind'), 'access.accessKind'),
    sourceContext: optionalText(read(access, 'sourceContext')),
    isOwnedByViewer: requiredBoolean(read(access, 'isOwnedByViewer'), 'access.isOwnedByViewer'),
    isAuctionListing: requiredBoolean(read(access, 'isAuctionListing'), 'access.isAuctionListing'),
    isTradeOfferItem: requiredBoolean(read(access, 'isTradeOfferItem'), 'access.isTradeOfferItem'),
  };
}

function mapDisplayMeta(
  displayMeta: JsonRecord | null,
  itemDetail: JsonRecord,
  fieldPath: string,
) {
  return {
    itemId: requiredText(read(itemDetail, 'item_id', 'itemId'), `${fieldPath}.item_id`),
    itemName: requiredText(
      read(displayMeta, 'itemName') ?? read(itemDetail, 'item_name', 'itemName'),
      `${fieldPath}.item_name`,
    ),
    lifecycleStatusKey: optionalText(
      read(displayMeta, 'lifecycleStatusKey') ?? read(itemDetail, 'item_status', 'itemStatus'),
    ),
    lifecycleStatusLabel: optionalText(read(displayMeta, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(
      read(displayMeta, 'generationQualityKey')
      ?? read(itemDetail, 'generation_quality_key', 'generationQualityKey'),
    ),
    displayIconKey: optionalText(read(displayMeta, 'displayIconKey')) ?? 'box',
    qualityLabel: optionalText(read(displayMeta, 'qualityLabel')),
    baseKey: optionalText(read(displayMeta, 'baseKey') ?? read(itemDetail, 'base_key', 'baseKey')),
    baseName: optionalText(read(displayMeta, 'baseName') ?? read(itemDetail, 'base_name', 'baseName')),
    baseTypeKey: optionalText(
      read(displayMeta, 'baseTypeKey') ?? read(itemDetail, 'base_type_key', 'baseTypeKey'),
    ),
    baseTypeLabel: optionalText(read(displayMeta, 'baseTypeLabel')),
    drachmaValue: optionalText(read(displayMeta, 'drachmaValue'))
      ?? textFromNumber(read(itemDetail, 'drachma_value', 'drachmaValue')),
    allowedSlotLabel: optionalText(read(displayMeta, 'allowedSlotLabel')),
    valueDisplay: mapValueDisplay(read(displayMeta, 'valueDisplay')),
    equipmentArea: optionalText(read(displayMeta, 'equipmentArea')),
    handUsageKey: optionalText(read(displayMeta, 'handUsageKey')),
    handUsageLabel: optionalText(read(displayMeta, 'handUsageLabel')),
    primarySlotKey: optionalText(read(displayMeta, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(displayMeta, 'primarySlotLabel')),
    allowedSlotKeys: Array.isArray(read(displayMeta, 'allowedSlotKeys'))
      ? (read(displayMeta, 'allowedSlotKeys') as Json[])
          .filter((entry): entry is string => typeof entry === 'string')
      : [],
  };
}

function mapStatRows(value: Json | undefined): ItemDetailPopoverStatRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    displaySection: 'item_stats',
    isPrimaryItemStat: true,
    label: requiredText(read(row, 'label'), `itemStats[${index}].label`),
    displayValue: requiredText(read(row, 'displayValue'), `itemStats[${index}].displayValue`),
    displayTone: displayTone(read(row, 'displayTone')),
    statKey: optionalText(read(row, 'statKey')) ?? `stat-${index}`,
    source: null,
    contract: null,
    isMeaningful: null,
    value: optionalNumber(read(row, 'value')),
    minDamage: optionalNumber(read(row, 'minDamage')),
    maxDamage: optionalNumber(read(row, 'maxDamage')),
    rawValue: optionalNumber(read(row, 'rawValue')),
    baseValue: optionalNumber(read(row, 'baseValue')),
    rawBaseValue: null,
    modifierValue: optionalNumber(read(row, 'modifierValue')),
    rawMinDamage: null,
    rawMaxDamage: null,
    baseMinDamage: optionalNumber(read(row, 'baseMinDamage')),
    baseMaxDamage: optionalNumber(read(row, 'baseMaxDamage')),
    rawBaseMinDamage: null,
    rawBaseMaxDamage: null,
    modifierMinDamage: optionalNumber(read(row, 'modifierMinDamage')),
    modifierMaxDamage: optionalNumber(read(row, 'modifierMaxDamage')),
    modifierDamageTotal: null,
    baseDisplayValue: null,
    modifierDisplayValue: null,
    damageRangeClamped: null,
    baseDamageRangeClamped: null,
  }));
}

function mapModifierRows(value: Json | undefined): ItemDetailPopoverModifierRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    displaySection: 'bonuses',
    isPrimaryItemStat: false,
    rowKind: optionalText(read(row, 'rowKind')) ?? 'bonus',
    aggregated: optionalBoolean(read(row, 'aggregated')) ?? false,
    label: optionalText(read(row, 'label'))
      ?? requiredText(read(row, 'targetLabel'), `bonusRows[${index}].targetLabel`),
    targetLabel: optionalText(read(row, 'targetLabel')),
    targetKey: optionalText(read(row, 'targetKey')) ?? '',
    displayValue: requiredText(read(row, 'displayValue'), `bonusRows[${index}].displayValue`),
    displayTone: displayTone(read(row, 'displayTone')),
    typeKey: optionalText(read(row, 'typeKey')),
    scopeKey: optionalText(read(row, 'scopeKey')),
    valueKind: optionalText(read(row, 'valueKind')),
    rawValue: optionalNumber(read(row, 'rawValue')),
    effectiveValue: optionalNumber(read(row, 'effectiveValue')),
    sortOrder: optionalNumber(read(row, 'sortOrder')),
    sourceCount: optionalNumber(read(row, 'sourceCount')),
    sourceRows: [],
    metadata: jsonValue(read(row, 'metadata')),
  }));
}

function mapRequirementRows(value: Json | undefined): ItemDetailPopoverRequirementRow[] {
  return mapJsonArray(value, (row) => row).map((row, index) => ({
    displaySection: 'requirements',
    displayTone: displayTone(read(row, 'displayTone')),
    isMet: requiredBoolean(read(row, 'isMet'), `requirements[${index}].isMet`),
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
    missingDisplayValue: optionalText(read(row, 'missingDisplayValue'))
      ?? optionalText(read(row, 'missingValueLabel'))
      ?? optionalText(read(row, 'missingDisplayText')),
    failureCompactText: optionalText(read(row, 'failureDisplayText'))
      ?? optionalText(read(row, 'failureReasonLabel')),
    compactDisplay: mapCompactDisplay(read(row, 'compactDisplay')),
    source: null,
    authority: null,
    displayText: optionalText(read(row, 'displayText'))
      ?? optionalText(read(row, 'shortDisplayText'))
      ?? '',
    shortDisplayText: optionalText(read(row, 'shortDisplayText')),
    requiredDisplayText: optionalText(read(row, 'requiredDisplayText')),
    currentDisplayText: optionalText(read(row, 'currentDisplayText')),
    currentValueLabel: optionalText(read(row, 'currentValueLabel')),
    currentValueRaw: null,
    requiredValueLabel: optionalText(read(row, 'requiredValueLabel')),
    requiredValueRaw: null,
    missingValueLabel: optionalText(read(row, 'missingValueLabel')),
    missingValueRaw: null,
    missingDisplayText: optionalText(read(row, 'missingDisplayText')),
    failureDisplayText: optionalText(read(row, 'failureDisplayText')),
    failureReasonKey: optionalText(read(row, 'failureReasonKey')),
    failureReasonLabel: optionalText(read(row, 'failureReasonLabel')),
    requirementDefinitionKey: optionalText(read(row, 'requirementDefinitionKey')) ?? `requirement-${index}`,
    requirementLabel: optionalText(read(row, 'requirementLabel')),
    requiredStatKey: null,
    requiredStatLabel: null,
    requiredBuildingKey: null,
    requiredDistrictCode: null,
    requiredResourceType: null,
    requiredResourceLabel: null,
    requiredValue: optionalNumber(read(row, 'requiredValue')),
    currentValue: optionalNumber(read(row, 'currentValue')),
    missingValue: optionalNumber(read(row, 'missingValue')),
    failureRow: null,
    effectiveRequirementRow: null,
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
    failuresJson: jsonValue(
      read(status, 'failuresJson')
      ?? read(bonusesJson, 'failuresJson')
      ?? read(itemDetail, 'failuresJson'),
    ),
    checkJson: jsonValue(read(status, 'checkJson')),
  };
}

function mapCompactDisplay(value: Json | undefined) {
  const row = optionalRecord(value);

  return row
    ? {
        label: optionalText(read(row, 'label')) ?? '',
        requiredValue: optionalText(read(row, 'requiredValue')) ?? '',
        currentValue: optionalText(read(row, 'currentValue')),
        missingValue: optionalText(read(row, 'missingValue')),
        failureText: optionalText(read(row, 'failureText')),
        tone: displayTone(read(row, 'tone')),
      }
    : null;
}

function mapValueDisplay(value: Json | undefined): PlayerItemDisplayCoreValueDisplay | null {
  const row = optionalRecord(value);

  return row
    ? {
        displayLabel: requiredText(read(row, 'displayLabel'), 'valueDisplay.displayLabel'),
        displayValue: requiredText(read(row, 'displayValue'), 'valueDisplay.displayValue'),
      }
    : null;
}

function optionalRecord(value: Json | undefined): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function displayTone(value: Json | undefined): ItemDetailPopoverDisplayTone {
  return optionalText(value) ?? 'neutral';
}

function textFromNumber(value: Json | undefined): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === 'string' ? value : null;
}
