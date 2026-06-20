import type {
  PlayerArmoryItemDisplayCore,
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import type { PlayerItemDisplayCoreValueDisplay } from '../domain/item/player-item-display-core.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalText,
  read,
  requiredBoolean,
  requiredNullableNumber,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapArmoryPageItemRows(
  rows: readonly JsonRecord[],
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
): PlayerArmoryItemReadModel[] {
  return rows.map((row) => mapArmoryPageItemRow(row, shelves));
}

function mapArmoryPageItemRow(
  row: JsonRecord,
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
): PlayerArmoryItemReadModel {
  const itemName = requiredText(read(row, 'itemName'), 'items.itemName');
  const storagePosition = requiredNonNegativeInteger(
    read(row, 'storagePosition'),
    'items.storagePosition',
  );
  const isUnsorted = requiredBoolean(read(row, 'isUnsorted'), 'items.isUnsorted');
  const storageSlotKey = optionalText(read(row, 'storageSlotKey'));
  const shelf = shelves.find((entry) =>
    entry.position === storagePosition
    && entry.isUnsortedDropArea === isUnsorted
    && (
      isUnsorted
      || entry.storageSlotKey === storageSlotKey
    ),
  );

  if (!shelf) {
    throw new Error(
      isUnsorted
        ? `items.isUnsorted item ${itemName} references missing unsortedStorageSlot at storagePosition ${storagePosition}.`
        : `items.storagePosition ${storagePosition} references missing storageSlots entry for ${itemName}.`,
    );
  }

  const itemId = requiredText(read(row, 'itemId'), 'items.itemId');
  const drachmaValue = requiredNullableNumber(read(row, 'drachmaValue'), 'items.drachmaValue');
  const valueDisplay = mapValueDisplay(read(row, 'valueDisplay'));
  const allowedSlotKeys = requiredTextArray(
    read(row, 'allowedSlotKeys'),
    'items.allowedSlotKeys',
  );
  const displayIconKey = requiredText(read(row, 'displayIconKey'), 'items.displayIconKey');

  return {
    itemId,
    heroId: requiredText(read(row, 'heroId'), 'items.heroId'),
    serverId: requiredText(read(row, 'serverId'), 'items.serverId'),
    itemName,
    lifecycleStatusKey: requiredText(
      read(row, 'lifecycleStatusKey'),
      'items.lifecycleStatusKey',
    ),
    lifecycleStatusLabel: optionalText(read(row, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(read(row, 'generationQualityKey')),
    qualityMultiplier: requiredNullableNumber(
      read(row, 'qualityMultiplier'),
      'items.qualityMultiplier',
    ),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    generationBaseId: optionalText(read(row, 'generationBaseId')),
    baseKey: optionalText(read(row, 'baseKey')),
    baseName: optionalText(read(row, 'baseName')),
    baseTypeKey: optionalText(read(row, 'baseTypeKey')),
    baseTypeLabel: optionalText(read(row, 'baseTypeLabel')),
    prefixAffixId: optionalText(read(row, 'prefixAffixId')),
    prefixKey: optionalText(read(row, 'prefixKey')),
    prefixName: optionalText(read(row, 'prefixName')),
    suffixAffixId: optionalText(read(row, 'suffixAffixId')),
    suffixKey: optionalText(read(row, 'suffixKey')),
    suffixName: optionalText(read(row, 'suffixName')),
    armoryShelfPosition: requiredNonNegativeInteger(
      read(row, 'armoryShelfPosition'),
      'items.armoryShelfPosition',
    ),
    drachmaValue,
    generatedAt: optionalText(read(row, 'generatedAt')),
    createdAt: optionalText(read(row, 'createdAt')),
    storagePosition: shelf.position,
    storageSlotKey,
    shelfName: optionalText(read(row, 'shelfName')),
    storageSlotName: optionalText(read(row, 'storageSlotName')),
    isUnsorted,
    visibilityIndex: requiredNonNegativeInteger(
      read(row, 'visibilityIndex'),
      'items.visibilityIndex',
    ),
    visibilityLimit: requiredNonNegativeInteger(
      read(row, 'visibilityLimit'),
      'items.visibilityLimit',
    ),
    isVisible: requiredBoolean(read(row, 'isVisible'), 'items.isVisible'),
    itemCategoryKey: optionalText(read(row, 'itemCategoryKey')),
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    primarySlotKey: optionalText(read(row, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(row, 'primarySlotLabel')),
    handUsageKey: optionalText(read(row, 'handUsageKey')),
    handUsageLabel: optionalText(read(row, 'handUsageLabel')),
    allowedSlotKeys,
    allowedSlotLabel: optionalText(read(row, 'allowedSlotLabel')),
    displayIconKey,
    meetsRequirements: requiredBoolean(
      read(row, 'meetsRequirements'),
      'items.meetsRequirements',
    ),
    requirementCount: requiredNonNegativeInteger(
      read(row, 'requirementCount'),
      'items.requirementCount',
    ),
    unmetRequirementCount: requiredNonNegativeInteger(
      read(row, 'unmetRequirementCount'),
      'items.unmetRequirementCount',
    ),
    requirementStatus: requiredRecord(
      read(row, 'requirementStatus'),
      'items.requirementStatus',
    ),
    displayCore: mapArmoryItemDisplayCore(
      row,
      itemId,
      itemName,
      valueDisplay,
      allowedSlotKeys,
      displayIconKey,
    ),
  };
}

function mapArmoryItemDisplayCore(
  row: JsonRecord,
  itemId: string,
  itemName: string,
  valueDisplay: PlayerArmoryItemDisplayCore['valueDisplay'],
  allowedSlotKeys: string[],
  displayIconKey: string,
): PlayerArmoryItemDisplayCore {
  return {
    itemId,
    itemName,
    lifecycleStatusKey: optionalText(read(row, 'lifecycleStatusKey')),
    lifecycleStatusLabel: optionalText(read(row, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(read(row, 'generationQualityKey')),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    baseKey: optionalText(read(row, 'baseKey')),
    baseName: optionalText(read(row, 'baseName')),
    baseTypeKey: optionalText(read(row, 'baseTypeKey')),
    baseTypeLabel: optionalText(read(row, 'baseTypeLabel')),
    valueDisplay,
    displayIconKey,
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    handUsageKey: optionalText(read(row, 'handUsageKey')),
    handUsageLabel: optionalText(read(row, 'handUsageLabel')),
    primarySlotKey: optionalText(read(row, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(row, 'primarySlotLabel')),
    equipmentSlotKey: optionalText(read(row, 'equipmentSlotKey')),
    equipmentSlotLabel: optionalText(read(row, 'equipmentSlotLabel')),
    allowedSlotKeys,
    allowedSlotLabel: optionalText(read(row, 'allowedSlotLabel')),
  };
}

function mapValueDisplay(value: Json | undefined): PlayerItemDisplayCoreValueDisplay {
  const record = requiredRecord(value, 'items.valueDisplay');

  return {
    displayLabel: requiredText(
      read(record, 'displayLabel'),
      'items.valueDisplay.displayLabel',
    ),
    displayValue: requiredText(
      read(record, 'displayValue'),
      'items.valueDisplay.displayValue',
    ),
  };
}
