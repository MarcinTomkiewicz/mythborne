import {
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
  PlayerArmoryVisibilityReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalText,
  read,
  requiredArray,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapArmoryCopyJson } from './player-armory-copy.mapper';
import { mapArmoryPageItemRows } from './player-armory-items.mapper';
import {
  mapArmoryEquipmentSlot,
  mapArmoryLoadoutPreset,
  mapArmoryStorageSlots,
  mapArmoryUnsortedStorageSlot,
} from './player-armory-storage.mapper';

export function mapPlayerArmoryPageContext(
  value: Json,
): PlayerArmoryPageContextReadModel {
  const root = requiredRecord(value, 'get_player_armory_page_context');
  const hero = requiredRecord(read(root, 'hero'), 'hero');
  const heroId = requiredText(read(hero, 'id'), 'hero.id');
  const copyJson = mapArmoryCopyJson(read(root, 'copyJson'));
  const storageSlots = mapArmoryStorageSlots(
    heroId,
    requiredArray(read(root, 'storageSlots'), 'storageSlots'),
  );
  const unsortedStorageSlot = mapArmoryUnsortedStorageSlot(
    heroId,
    read(root, 'unsortedStorageSlot'),
  );
  const shelves = [
    ...storageSlots,
    ...(unsortedStorageSlot ? [unsortedStorageSlot] : []),
  ];
  const items = mapArmoryPageItemRows(
    requiredArray(read(root, 'items'), 'items'),
    shelves,
  );
  const itemsById = new Map(items.map((item) => [item.itemId, item]));
  const equipmentSlots = requiredArray(
    read(root, 'equipmentSlots'),
    'equipmentSlots',
  ).map((row) => mapArmoryEquipmentSlot(row, itemsById));
  const equippedItemIds = new Set(
    equipmentSlots.flatMap((slot) => slot.itemId ? [slot.itemId] : []),
  );
  const inventoryItems = items.filter((item) => !equippedItemIds.has(item.itemId));

  return {
    heroId,
    serverId: requiredText(read(hero, 'server_id'), 'hero.server_id'),
    originKey: optionalText(read(hero, 'origin_key')),
    copyJson,
    readModel: mapReadModel(
      heroId,
      mapArmoryVisibilityState(
        requiredRecord(read(root, 'visibilityState'), 'visibilityState'),
        'visibilityState',
      ),
      shelves,
      inventoryItems,
    ),
    equipmentSlots,
    loadoutPresets: requiredArray(
      read(root, 'loadoutPresets'),
      'loadoutPresets',
    ).map(mapArmoryLoadoutPreset),
  };
}

export function mapArmoryMutationReadModel(
  currentReadModel: PlayerArmoryReadModel,
  visibleItemsJson: Json,
  armoryStateJson: Json,
): PlayerArmoryReadModel {
  return mapReadModel(
    currentReadModel.heroId,
    mapArmoryVisibilityState(
      requiredRecord(armoryStateJson, 'armory_state_json'),
      'armory_state_json',
    ),
    currentReadModel.shelves,
    mapArmoryPageItemRows(
      requiredArray(visibleItemsJson, 'visible_items_json'),
      currentReadModel.shelves,
    ),
  );
}

function mapReadModel(
  heroId: string,
  visibility: PlayerArmoryVisibilityReadModel,
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  items: readonly PlayerArmoryItemReadModel[],
): PlayerArmoryReadModel {
  const itemsByShelf = new Map<string, PlayerArmoryItemReadModel[]>();

  for (const item of items) {
    const shelfKey = itemStorageSlotKey(item);
    const shelfItems = itemsByShelf.get(shelfKey);

    if (shelfItems) {
      shelfItems.push(item);
    } else {
      itemsByShelf.set(shelfKey, [item]);
    }
  }

  return {
    heroId,
    shelves: shelves.map((shelf) => ({
      ...shelf,
      visibleItems: itemsByShelf.get(storageSlotKey(shelf)) ?? [],
    })),
    visibleItems: [...items],
    visibility,
  };
}

function itemStorageSlotKey(item: PlayerArmoryItemReadModel): string {
  return item.storageSlotKey
    ? `slot:${item.storageSlotKey}:${item.storagePosition}`
    : `unsorted:${item.storagePosition}`;
}

function storageSlotKey(shelf: PlayerArmoryStorageSlotReadModel): string {
  return shelf.storageSlotKey
    ? `slot:${shelf.storageSlotKey}:${shelf.position}`
    : `unsorted:${shelf.position}`;
}

function mapArmoryVisibilityState(
  value: JsonRecord,
  fieldPath: 'visibilityState' | 'armory_state_json',
): PlayerArmoryVisibilityReadModel {
  return {
    visibleItemCount: requiredNonNegativeInteger(
      read(value, 'visible_item_count'),
      `${fieldPath}.visible_item_count`,
    ),
    totalOwnedItemCount: requiredNonNegativeInteger(
      read(value, 'total_owned_item_count'),
      `${fieldPath}.total_owned_item_count`,
    ),
    hiddenItemCount: requiredNonNegativeInteger(
      read(value, 'hidden_item_count'),
      `${fieldPath}.hidden_item_count`,
    ),
    visibilityLimit: requiredNonNegativeInteger(
      read(value, 'visibility_limit'),
      `${fieldPath}.visibility_limit`,
    ),
  };
}
