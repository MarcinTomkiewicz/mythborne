import type {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalText,
  read,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapArmoryStorageSlots(
  heroId: string,
  rows: readonly JsonRecord[],
): PlayerArmoryStorageSlotReadModel[] {
  return rows.map((row) => mapStorageSlot(heroId, row, 'storageSlots', false));
}

export function mapArmoryUnsortedStorageSlot(
  heroId: string,
  value: Json | undefined,
): PlayerArmoryStorageSlotReadModel | null {
  if (value === null || value === undefined) {
    return null;
  }

  return mapStorageSlot(
    heroId,
    requiredRecord(value, 'unsortedStorageSlot'),
    'unsortedStorageSlot',
    true,
  );
}

export function mapArmoryEquipmentSlot(
  row: JsonRecord,
): PlayerArmoryEquipmentSlotReadModel {
  const hasItem = requiredBoolean(
    read(row, 'hasItem'),
    'equipmentSlots.hasItem',
  );

  return {
    slotKey: requiredText(read(row, 'slotKey'), 'equipmentSlots.slotKey'),
    slotLabel: requiredText(read(row, 'slotLabel'), 'equipmentSlots.slotLabel'),
    slotSortOrder: requiredNonNegativeInteger(
      read(row, 'slotSortOrder'),
      'equipmentSlots.slotSortOrder',
    ),
    hasItem,
    isEmpty: requiredBoolean(read(row, 'isEmpty'), 'equipmentSlots.isEmpty'),
    itemDisplayName: requiredText(
      read(row, 'itemDisplayName'),
      'equipmentSlots.itemDisplayName',
    ),
    itemDisplayStateLabel: optionalText(read(row, 'itemDisplayStateLabel')),
    itemStatusKey: optionalText(read(row, 'itemStatusKey')),
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    itemId: hasItem
      ? requiredText(read(row, 'itemId'), 'equipmentSlots.itemId')
      : null,
    itemName: hasItem
      ? requiredText(read(row, 'itemName'), 'equipmentSlots.itemName')
      : null,
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    baseName: optionalText(read(row, 'baseName')),
  };
}

export function mapArmoryLoadoutPreset(
  row: JsonRecord,
): PlayerArmoryLoadoutPresetReadModel {
  return {
    presetId: requiredText(read(row, 'preset_id'), 'loadoutPresets.preset_id'),
    heroId: optionalText(read(row, 'hero_id')),
    presetNumber: requiredNonNegativeInteger(
      read(row, 'preset_number'),
      'loadoutPresets.preset_number',
    ),
    name: requiredText(read(row, 'name'), 'loadoutPresets.name'),
    slotCount: requiredNonNegativeInteger(
      read(row, 'slot_count'),
      'loadoutPresets.slot_count',
    ),
    savedAt: optionalText(read(row, 'saved_at')),
    clearedAt: optionalText(read(row, 'cleared_at')),
    createdAt: optionalText(read(row, 'created_at')),
    updatedAt: requiredText(
      read(row, 'updated_at'),
      'loadoutPresets.updated_at',
    ),
  };
}

function mapStorageSlot(
  heroId: string,
  row: JsonRecord,
  fieldPath: 'storageSlots' | 'unsortedStorageSlot',
  isUnsortedDropArea: boolean,
): PlayerArmoryStorageSlotReadModel {
  const displayName = requiredText(
    read(row, 'displayName'),
    `${fieldPath}.displayName`,
  );

  return {
    storageSlotId: isUnsortedDropArea
      ? null
      : optionalText(read(row, 'storageSlotId')),
    storageSlotKey: isUnsortedDropArea
      ? optionalText(read(row, 'storageSlotKey'))
      : requiredText(
          read(row, 'storageSlotKey'),
          `${fieldPath}.storageSlotKey`,
        ),
    heroId,
    position: requiredNonNegativeInteger(
      read(row, 'storagePosition'),
      `${fieldPath}.storagePosition`,
    ),
    name: displayName,
    displayName,
    displayLabel: requiredText(
      read(row, 'displayLabel'),
      `${fieldPath}.displayLabel`,
    ),
    displayValue: isUnsortedDropArea
      ? optionalText(read(row, 'displayValue'))
      : requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    visibleItemCount: requiredNonNegativeInteger(
      read(row, 'visibleItemCount'),
      `${fieldPath}.visibleItemCount`,
    ),
    itemCount: requiredNonNegativeInteger(
      read(row, 'itemCount'),
      `${fieldPath}.itemCount`,
    ),
    sortOrder: requiredNonNegativeInteger(
      read(row, 'sortOrder'),
      `${fieldPath}.sortOrder`,
    ),
    isPersisted: isUnsortedDropArea
      ? false
      : requiredBoolean(read(row, 'existsInDb'), `${fieldPath}.existsInDb`),
    isUnsortedDropArea,
    visibleItems: [],
  };
}
