import { ARMORY_RING_SLOT_FILTER_VALUE } from '../constants/armory-inventory-filter.const';
import { classifyItemDisplay } from '../domain/equipment/equipment-preview.mapper';
import { EQUIPMENT_PREVIEW_SLOT_KEYS } from '../domain/equipment/equipment-preview-icons.config';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  EquipmentSlot,
} from '../domain/item/item-equipment.model';
import { ArmoryInventoryFilters } from '../types/armory-inventory-filter.types';
import { SelectOption } from '../types/select-option.types';
import { projectArmoryShelvesByItemIds } from './armory-shelf-display';
import { uniqueSorted } from './collection';
import { normalizeKeyText, normalizeSearchText } from './normalize-text';

export function armorySlotFilterOptions(
  slots: readonly EquipmentSlot[],
): Array<SelectOption<string>> {
  const sortedSlots = [...slots].sort((left, right) =>
    left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
  );
  const hasRingSlot = sortedSlots.some((slot) => isRingSlotKey(slot.slotKey));

  return [
    { label: 'All slots', value: 'all' },
    ...sortedSlots
      .filter((slot) => !isRingSlotKey(slot.slotKey))
      .map((slot) => ({
        label: slot.label,
        value: slot.slotKey,
      })),
    ...(hasRingSlot ? [{ label: 'Pierścień', value: ARMORY_RING_SLOT_FILTER_VALUE }] : []),
  ];
}

export function filterArmoryItems(
  items: readonly ArmoryItemSummary[],
  filters: ArmoryInventoryFilters,
): ArmoryItemSummary[] {
  return items.filter((item) =>
    (
      !filters.searchTerm
      || armoryItemSearchTokens(item)
        .some((token) => normalizeSearchText(token).includes(filters.searchTerm))
    )
    && matchesArmorySlotFilter(item, filters.slotKey)
    && (filters.availability === 'all' || item.lifecycleStatus === filters.availability),
  );
}

export function filteredArmoryShelves(
  shelves: readonly ArmoryShelfReadModel[],
  filteredItems: readonly ArmoryItemSummary[],
): ArmoryShelfReadModel[] {
  return projectArmoryShelvesByItemIds(
    shelves,
    new Set(filteredItems.map((item) => item.itemId)),
  ).filter((shelf) => shelf.visibleItems.length > 0);
}

export function armoryItemMetadata(
  item: ArmoryItemSummary,
): string {
  const display = armoryItemDisplay(item);
  const metadata = [display.kindLabel, display.slotLabel]
    .filter(Boolean)
    .join(' · ');

  return metadata || item.baseName || 'Item';
}

export function matchesArmorySlotFilter(
  item: ArmoryItemSummary,
  slotFilter: string,
): boolean {
  if (slotFilter === 'all') {
    return true;
  }

  if (slotFilter === ARMORY_RING_SLOT_FILTER_VALUE) {
    return armoryItemSlotKeys(item).has(EQUIPMENT_PREVIEW_SLOT_KEYS.ring1)
      || armoryItemSlotKeys(item).has(EQUIPMENT_PREVIEW_SLOT_KEYS.ring2);
  }

  return armoryItemSlotKeys(item).has(slotFilter);
}

function armoryItemSearchTokens(item: ArmoryItemSummary): string[] {
  return uniqueSorted([
    item.name,
    armoryItemMetadata(item),
  ].filter((token): token is string => Boolean(token?.trim())));
}

function armoryItemDisplay(item: ArmoryItemSummary) {
  return classifyItemDisplay({
    baseTypeKey: item.baseTypeKey,
    handUsageKey: item.handUsageKey,
    primarySlotKey: item.primarySlotKey,
    allowedSlotKeys: item.allowedSlotKeys,
  });
}

function armoryItemSlotKeys(item: ArmoryItemSummary): Set<string> {
  const keys = new Set(
    [item.primarySlotKey, ...(item.allowedSlotKeys ?? [])]
      .filter((key): key is string => Boolean(key?.trim())),
  );
  const normalizedSignals = [
    item.baseTypeKey,
    item.itemCategoryKey,
    item.equipmentArea,
    item.handUsageKey,
  ].map(normalizeKeyText);

  if (normalizedSignals.some((signal) => signal.includes('shield'))) {
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.offHand);
  }

  if (normalizedSignals.some((signal) => signal.includes('one_hand'))) {
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand);
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.offHand);
  }

  if (normalizedSignals.some((signal) =>
    signal.includes('two_hand') || signal.includes('ranged')
  )) {
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand);
  }

  if (normalizedSignals.some((signal) => signal === 'ring' || signal.includes('jewelry'))) {
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.ring1);
    keys.add(EQUIPMENT_PREVIEW_SLOT_KEYS.ring2);
  }

  for (const slotKey of Object.values(EQUIPMENT_PREVIEW_SLOT_KEYS)) {
    if (normalizedSignals.some((signal) => signal === normalizeKeyText(slotKey))) {
      keys.add(slotKey);
    }
  }

  return keys;
}

function isRingSlotKey(slotKey: string): boolean {
  return slotKey === EQUIPMENT_PREVIEW_SLOT_KEYS.ring1
    || slotKey === EQUIPMENT_PREVIEW_SLOT_KEYS.ring2;
}
