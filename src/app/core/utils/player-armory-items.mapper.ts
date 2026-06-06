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
    meetsRequirements: mapMeetsRequirements(row),
    displayCore: mapArmoryItemDisplayCore(row, itemId, itemName),
  };
}

function mapMeetsRequirements(row: JsonRecord): boolean | null {
  const directValue = optionalBoolean(read(row, 'meetsRequirements', 'meets_requirements'));

  if (directValue !== null) {
    return directValue;
  }

  const directCountValue = requirementStatusFromCounts(row)
    ?? requirementStatusFromRows(read(row, 'requirementsJson', 'requirements_json', 'requirements'))
    ?? requirementStatusFromFailures(read(row, 'failuresJson', 'failures_json', 'failures'));

  if (directCountValue !== null) {
    return directCountValue;
  }

  return [
    read(row, 'requirementPreview', 'requirement_preview'),
    read(row, 'requirementStatus', 'requirement_status'),
    read(row, 'bonusesJson', 'bonuses_json'),
    read(row, 'checkJson', 'check_json'),
  ].reduce<boolean | null>((currentStatus, value) =>
    currentStatus ?? requirementStatusFromPreview(value),
  null);
}

function requirementStatusFromPreview(value: Json | undefined): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  const preview = requiredRecord(value, 'items.requirementPreview');
  const directValue = optionalBoolean(read(preview, 'meetsRequirements', 'meets_requirements'));

  return directValue
    ?? requirementStatusFromCounts(preview)
    ?? requirementStatusFromRows(read(preview, 'requirementsJson', 'requirements_json', 'requirements'))
    ?? requirementStatusFromFailures(read(preview, 'failuresJson', 'failures_json', 'failures'))
    ?? [
      read(preview, 'requirementStatus', 'requirement_status'),
      read(preview, 'requirementPreview', 'requirement_preview'),
      read(preview, 'checkJson', 'check_json'),
    ].reduce<boolean | null>((currentStatus, value) =>
      currentStatus ?? requirementStatusFromPreview(value),
    null);
}

function requirementStatusFromCounts(record: JsonRecord): boolean | null {
  const unmetCount = optionalNumber(read(record, 'unmetCount', 'unmet_count'));

  if (unmetCount !== null) {
    return unmetCount === 0;
  }

  return null;
}

function requirementStatusFromRows(value: Json | undefined): boolean | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const statuses: boolean[] = [];

  for (const [index, entry] of value.entries()) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      return null;
    }

    const row = entry as JsonRecord;
    const rawStatus = read(row, 'isMet', 'is_met');

    if (rawStatus === null || rawStatus === undefined) {
      return null;
    }

    const isMet = optionalBoolean(rawStatus);

    if (isMet === null) {
      throw new Error(`items.requirements[${index}].isMet must be a boolean when present.`);
    }

    statuses.push(isMet);
  }

  return statuses.length ? statuses.every(Boolean) : null;
}

function requirementStatusFromFailures(value: Json | undefined): boolean | null {
  return Array.isArray(value) ? value.length === 0 : null;
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
