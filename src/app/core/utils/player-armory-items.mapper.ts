import type {
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import type { PlayerItemDisplayCore } from '../domain/item/player-item-display-core.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';
import { mapPlayerItemDisplayCore } from './player-item-display-core.mapper';

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
  const itemName = requiredText(read(row, 'item_name'), 'items.item_name');
  const shelfPosition = requiredNonNegativeInteger(
    read(row, 'armory_shelf_position'),
    'items.armory_shelf_position',
  );
  const isUnsorted = optionalBoolean(read(row, 'is_unsorted')) ?? false;
  const shelf = shelves.find(
    (entry) =>
      entry.position === shelfPosition &&
      entry.isUnsortedDropArea === isUnsorted,
  );

  if (!shelf) {
    throw new Error(
      isUnsorted
        ? `items.is_unsorted item ${itemName} references missing unsortedStorageSlot at armory_shelf_position ${shelfPosition}.`
        : `items.armory_shelf_position ${shelfPosition} references missing storageSlots entry for ${itemName}.`,
    );
  }

  const itemId = requiredText(read(row, 'item_id'), 'items.item_id');

  return {
    itemId,
    ownerHeroId: requiredText(read(row, 'hero_id'), 'items.hero_id'),
    serverId: requiredText(read(row, 'server_id'), 'items.server_id'),
    name: itemName,
    lifecycleStatusKey: requiredText(
      read(row, 'lifecycleStatusKey'),
      'items.lifecycleStatusKey',
    ),
    armoryShelfPosition: shelf.position,
    drachmaValue: optionalNumber(read(row, 'drachma_value')),
    shelfPosition: shelf.position,
    shelfName: optionalText(read(row, 'shelf_name')),
    allowedSlotKeys: requiredTextArray(
      read(row, 'allowedSlotKeys'),
      'items.allowedSlotKeys',
    ),
    meetsRequirements: requiredBoolean(
      read(row, 'meetsRequirements'),
      'items.meetsRequirements',
    ),
    requirementStatusKey: requiredText(
      read(row, 'requirementStatusKey'),
      'items.requirementStatusKey',
    ),
    requirementStatusAvailable: requiredBoolean(
      read(row, 'requirementStatusAvailable'),
      'items.requirementStatusAvailable',
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
    displayCore: mapArmoryItemDisplayCore(row, itemId, itemName),
  };
}

function mapArmoryItemDisplayCore(
  row: JsonRecord,
  itemId: string,
  itemName: string,
): PlayerItemDisplayCore {
  const displayCore = read(row, 'displayCore');

  if (displayCore !== null && displayCore !== undefined) {
    return mapPlayerItemDisplayCore(displayCore, 'items.displayCore');
  }

  return {
    itemId,
    itemName,
    lifecycleStatusKey: optionalText(read(row, 'lifecycleStatusKey')),
    lifecycleStatusLabel: optionalText(read(row, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(read(row, 'generation_quality_key')),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    baseKey: optionalText(read(row, 'base_key')),
    baseName: optionalText(read(row, 'base_name')),
    baseTypeKey: optionalText(read(row, 'baseTypeKey')),
    baseTypeLabel: optionalText(read(row, 'baseTypeLabel')),
    drachmaValue: optionalText(read(row, 'drachmaValue')),
    valueDisplay: mapValueDisplay(read(row, 'valueDisplay')),
    displayIconKey: requiredText(read(row, 'displayIconKey'), 'items.displayIconKey'),
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    handUsageKey: optionalText(read(row, 'handUsageKey')),
    handUsageLabel: optionalText(read(row, 'handUsageLabel')),
    primarySlotKey: optionalText(read(row, 'primary_slot_key')),
    primarySlotLabel: optionalText(read(row, 'primarySlotLabel')),
    equipmentSlotKey: optionalText(read(row, 'equipmentSlotKey')),
    equipmentSlotLabel: optionalText(read(row, 'equipmentSlotLabel')),
    allowedSlotKeys: requiredTextArray(
      read(row, 'allowedSlotKeys'),
      'items.allowedSlotKeys',
    ),
    allowedSlotLabel: optionalText(read(row, 'allowedSlotLabel')),
  };
}

function mapValueDisplay(value: Json | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

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
