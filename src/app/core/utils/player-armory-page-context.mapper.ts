import {
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
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
  const equipmentSlots = requiredArray(
    read(root, 'equipmentSlots'),
    'equipmentSlots',
  ).map(mapArmoryEquipmentSlot);
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
      requiredRecord(read(root, 'visibilityState'), 'visibilityState'),
      shelves,
      inventoryItems,
    ),
    equipmentSlots,
    loadoutPresets: requiredArray(
      read(root, 'loadoutPresets'),
      'loadoutPresets',
    ).map(mapArmoryLoadoutPreset),
    runtimeDerivedStats: read(root, 'runtimeDerivedStats') ?? null,
  };
}

function mapReadModel(
  heroId: string,
  visibilityState: JsonRecord,
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  items: readonly PlayerArmoryItemReadModel[],
): PlayerArmoryReadModel {
  const itemsByShelf = new Map<number, PlayerArmoryItemReadModel[]>();

  for (const item of items) {
    const shelfItems = itemsByShelf.get(item.shelfPosition) ?? [];
    itemsByShelf.set(item.shelfPosition, [...shelfItems, item]);
  }

  return {
    heroId,
    shelves: shelves.map((shelf) => ({
      ...shelf,
      visibleItems: itemsByShelf.get(shelf.position) ?? [],
    })),
    visibleItems: [...items],
    visibility: {
      visibleItemCount: requiredNonNegativeInteger(
        read(visibilityState, 'visible_item_count'),
        'visibilityState.visible_item_count',
      ),
      totalOwnedItemCount: requiredNonNegativeInteger(
        read(visibilityState, 'total_owned_item_count'),
        'visibilityState.total_owned_item_count',
      ),
      hiddenItemCount: requiredNonNegativeInteger(
        read(visibilityState, 'hidden_item_count'),
        'visibilityState.hidden_item_count',
      ),
      visibilityLimit: requiredNonNegativeInteger(
        read(visibilityState, 'visibility_limit'),
        'visibilityState.visibility_limit',
      ),
    },
  };
}
