import type {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
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
  itemsById: ReadonlyMap<string, PlayerArmoryItemReadModel>,
): PlayerArmoryEquipmentSlotReadModel {
  const hasItem = requiredBoolean(
    read(row, 'hasItem'),
    'equipmentSlots.hasItem',
  );
  const base = {
    slotKey: requiredText(read(row, 'slotKey'), 'equipmentSlots.slotKey'),
    slotLabel: requiredText(read(row, 'slotLabel'), 'equipmentSlots.slotLabel'),
    slotSortOrder: requiredNonNegativeInteger(
      read(row, 'slotSortOrder'),
      'equipmentSlots.slotSortOrder',
    ),
    itemDisplayName: requiredText(
      read(row, 'itemDisplayName'),
      'equipmentSlots.itemDisplayName',
    ),
    itemDisplayStateLabel: optionalText(read(row, 'itemDisplayStateLabel')),
    itemStatusKey: optionalText(read(row, 'itemStatusKey')),
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    baseName: optionalText(read(row, 'baseName')),
  };

  if (!hasItem) {
    return {
      ...base,
      hasItem: false,
      isEmpty: true,
      itemId: null,
      itemName: null,
      item: null,
    };
  }

  const itemId = requiredText(read(row, 'itemId'), 'equipmentSlots.itemId');
  const item = itemsById.get(itemId) ?? null;

  return {
    ...base,
    hasItem: true,
    isEmpty: false,
    itemId,
    itemName: requiredText(read(row, 'itemName'), 'equipmentSlots.itemName'),
    item,
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
