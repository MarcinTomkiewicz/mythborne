import { EquippedItemSummary } from '../domain/item/item-equipment.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryEquippedEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
} from '../domain/item/player-armory-page-context.model';

export function equippedArmorySlotsByItemIds(
  slots: readonly PlayerArmoryEquipmentSlotReadModel[],
  itemIds: readonly string[],
): PlayerArmoryEquippedEquipmentSlotReadModel[] {
  const requestedItemIds = new Set(itemIds);

  return slots.filter(
    (slot): slot is PlayerArmoryEquippedEquipmentSlotReadModel =>
      slot.hasItem && requestedItemIds.has(slot.itemId),
  );
}

export function mapArmoryEquipmentSlotsFromLoadout(
  slots: readonly PlayerArmoryEquipmentSlotReadModel[],
  loadout: { slots: EquippedItemSummary[] },
  visibleItems: readonly PlayerArmoryItemReadModel[],
): PlayerArmoryEquipmentSlotReadModel[] {
  const equippedBySlot = new Map(
    loadout.slots.map((item) => [item.slotKey, item]),
  );
  const itemsById = new Map([
    ...visibleItems.map((item) => [item.itemId, item] as const),
    ...slots.flatMap((slot) =>
      slot.hasItem && slot.item ? [[slot.itemId, slot.item] as const] : [],
    ),
  ]);

  return slots.map((slot) =>
    mapEquipmentSlotFromLoadoutItem(
      slot,
      equippedBySlot.get(slot.slotKey),
      itemsById,
    ),
  );
}

function mapEquipmentSlotFromLoadoutItem(
  slot: PlayerArmoryEquipmentSlotReadModel,
  item: EquippedItemSummary | undefined,
  itemsById: ReadonlyMap<string, PlayerArmoryItemReadModel>,
): PlayerArmoryEquipmentSlotReadModel {
  if (!item) {
    return {
      ...slot,
      hasItem: false,
      isEmpty: true,
      itemDisplayName: '',
      itemDisplayStateLabel: null,
      itemStatusKey: null,
      itemId: null,
      itemName: null,
      item: null,
      qualityLabel: null,
      baseName: null,
    };
  }
  const itemReadModel = itemsById.get(item.itemId) ?? null;

  return {
    ...slot,
    slotLabel: item.slotLabel,
    slotSortOrder: item.slotSortOrder,
    hasItem: true,
    isEmpty: false,
    itemDisplayName: item.itemName,
    itemDisplayStateLabel: null,
    itemStatusKey: item.lifecycleStatus,
    equipmentArea: item.equipmentArea,
    itemId: item.itemId,
    itemName: item.itemName,
    item: itemReadModel,
    qualityLabel: item.qualityLabel,
    baseName: item.baseName,
  };
}
