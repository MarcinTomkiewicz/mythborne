import {
  PlayerArmoryPageCopyAvailabilityOption,
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import { SelectOption } from '../types/select-option.types';
import { normalizeSearchText } from './normalize-text';

export const ARMORY_INVENTORY_ALL_FILTER_VALUE = 'all';

export interface PlayerArmoryInventoryFilters {
  searchTerm: string;
  slotKey: string;
  availabilityKey: string;
  storageSlotPosition: string;
}

export function armorySlotFilterOptions(
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  allSlotsLabel: string,
): Array<SelectOption<string>> {
  const options: Array<SelectOption<string>> = [
    { label: allSlotsLabel, value: ARMORY_INVENTORY_ALL_FILTER_VALUE },
  ];
  const seenValues = new Set<string>([ARMORY_INVENTORY_ALL_FILTER_VALUE]);

  for (const item of shelves.flatMap((shelf) => shelf.visibleItems)) {
    const value = item.primarySlotKey?.trim() || item.primarySlotLabel?.trim();
    const label = item.primarySlotLabel?.trim();

    if (value && label && !seenValues.has(value)) {
      seenValues.add(value);
      options.push({ label, value });
    }
  }

  return options;
}

export function armoryAvailabilityFilterOptions(
  allAvailabilityLabel: string,
  options: readonly PlayerArmoryPageCopyAvailabilityOption[],
): Array<SelectOption<string>> {
  return [
    {
      label: allAvailabilityLabel,
      value: ARMORY_INVENTORY_ALL_FILTER_VALUE,
    },
    ...options.map((option) => ({
      label: option.label,
      value: option.key,
    })),
  ];
}

export function armoryStorageSlotFilterOptions(
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  allStorageSlotsLabel: string,
): Array<SelectOption<string>> {
  return [
    {
      label: allStorageSlotsLabel,
      value: ARMORY_INVENTORY_ALL_FILTER_VALUE,
    },
    ...shelves.map((shelf) => ({
      label: armoryStorageSlotLabel(shelf),
      value: String(shelf.position),
    })),
  ];
}

export function filterArmoryShelves(
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  filters: PlayerArmoryInventoryFilters,
): PlayerArmoryStorageSlotReadModel[] {
  return shelves
    .filter((shelf) =>
      filters.storageSlotPosition === ARMORY_INVENTORY_ALL_FILTER_VALUE
      || String(shelf.position) === filters.storageSlotPosition,
    )
    .map((shelf) => ({
      ...shelf,
      visibleItems: shelf.visibleItems.filter((item) =>
        matchesSearch(item, filters.searchTerm)
        && matchesSlot(item, filters.slotKey)
        && matchesAvailability(item, filters.availabilityKey),
      ),
    }))
    .filter((shelf) => shelf.visibleItems.length > 0);
}

export function armoryStorageSlotLabel(
  shelf: PlayerArmoryStorageSlotReadModel,
): string {
  const displayName = shelf.displayName.trim();

  if (displayName.length) {
    return displayName;
  }

  return shelf.displayValue
    ? `${shelf.displayLabel} ${shelf.displayValue}`
    : shelf.displayLabel;
}

export function armoryItemMetadata(item: {
  qualityLabel?: string | null;
  baseTypeLabel?: string | null;
  primarySlotLabel?: string | null;
}): string {
  return uniqueDisplayParts([
    item.qualityLabel ?? null,
    item.baseTypeLabel ?? null,
    item.primarySlotLabel ?? null,
  ]).join(' · ');
}

function matchesSearch(
  item: PlayerArmoryItemReadModel,
  searchTerm: string,
): boolean {
  return !searchTerm
    || itemSearchTokens(item)
      .some((token) => normalizeSearchText(token).includes(searchTerm));
}

function matchesSlot(
  item: PlayerArmoryItemReadModel,
  slotKey: string,
): boolean {
  if (slotKey === ARMORY_INVENTORY_ALL_FILTER_VALUE) {
    return true;
  }

  return item.primarySlotKey === slotKey || item.primarySlotLabel === slotKey;
}

function matchesAvailability(
  item: PlayerArmoryItemReadModel,
  availabilityKey: string,
): boolean {
  if (availabilityKey === ARMORY_INVENTORY_ALL_FILTER_VALUE) {
    return true;
  }

  return item.lifecycleStatusKey === availabilityKey;
}

function itemSearchTokens(item: PlayerArmoryItemReadModel): string[] {
  return uniqueDisplayParts([
    item.name,
    item.qualityLabel,
    item.baseTypeLabel,
    item.primarySlotLabel,
    item.valueDisplay?.displayValue ?? null,
  ]);
}

function uniqueDisplayParts(parts: readonly (string | null)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const value = part?.trim();

    if (value && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}
