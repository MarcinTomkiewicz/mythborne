import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryItemValueDisplay,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../domain/item/player-armory-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';

const REQUIRED_COPY_SECTIONS = [
  'page',
  'sections',
  'summary',
  'empty',
  'storage',
  'actions',
  'confirmations',
  'filters',
  'search',
  'inventory',
  'loadoutPresets',
  'itemDetail',
  'equipmentPreview',
] as const;

export function mapPlayerArmoryPageContext(
  value: Json,
): PlayerArmoryPageContextReadModel {
  const root = requiredRecord(value, 'get_player_armory_page_context');
  const hero = requiredRecord(read(root, 'hero'), 'hero');
  const heroId = requiredText(read(hero, 'id'), 'hero.id');
  const copyJson = mapCopyJson(read(root, 'copyJson'));
  const storageSlots = mapStorageSlots(
    heroId,
    requiredArray(read(root, 'storageSlots'), 'storageSlots'),
  );
  const unsortedStorageSlot = mapUnsortedStorageSlot(
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

  return {
    heroId,
    serverId: requiredText(read(hero, 'server_id'), 'hero.server_id'),
    originKey: optionalText(read(hero, 'origin_key')),
    copyJson,
    readModel: mapReadModel(
      heroId,
      requiredRecord(read(root, 'visibilityState'), 'visibilityState'),
      shelves,
      items,
    ),
    equipmentSlots: requiredArray(read(root, 'equipmentSlots'), 'equipmentSlots')
      .map(mapEquipmentSlot),
    loadoutPresets: requiredArray(read(root, 'loadoutPresets'), 'loadoutPresets')
      .map(mapLoadoutPreset),
    runtimeDerivedStats: read(root, 'runtimeDerivedStats') ?? null,
  };
}

function mapCopyJson(value: Json | undefined): JsonRecord {
  const copyJson = requiredRecord(value, 'copyJson');

  for (const section of REQUIRED_COPY_SECTIONS) {
    requiredRecord(read(copyJson, section), `copyJson.${section}`);
  }

  return copyJson;
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

function mapStorageSlots(
  heroId: string,
  rows: readonly JsonRecord[],
): PlayerArmoryStorageSlotReadModel[] {
  return rows
    .map((row) => mapStorageSlot(heroId, row, 'storageSlots', false));
}

function mapUnsortedStorageSlot(
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
      : requiredText(read(row, 'storageSlotKey'), `${fieldPath}.storageSlotKey`),
    heroId,
    position: requiredNonNegativeInteger(
      read(row, 'storagePosition'),
      `${fieldPath}.storagePosition`,
    ),
    name: displayName,
    displayName,
    displayLabel: requiredText(read(row, 'displayLabel'), `${fieldPath}.displayLabel`),
    displayValue: isUnsortedDropArea
      ? optionalText(read(row, 'displayValue'))
      : requiredText(read(row, 'displayValue'), `${fieldPath}.displayValue`),
    visibleItemCount: requiredNonNegativeInteger(
      read(row, 'visibleItemCount'),
      `${fieldPath}.visibleItemCount`,
    ),
    itemCount: requiredNonNegativeInteger(read(row, 'itemCount'), `${fieldPath}.itemCount`),
    sortOrder: requiredNonNegativeInteger(read(row, 'sortOrder'), `${fieldPath}.sortOrder`),
    isPersisted: !isUnsortedDropArea,
    isUnsortedDropArea,
    visibleItems: [],
  };
}

function mapArmoryPageItemRows(
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
  const shelf = shelves.find((entry) =>
    entry.position === shelfPosition
    && entry.isUnsortedDropArea === isUnsorted,
  );

  if (!shelf) {
    throw new Error(
      isUnsorted
        ? `items.is_unsorted item ${itemName} references missing unsortedStorageSlot at armory_shelf_position ${shelfPosition}.`
        : `items.armory_shelf_position ${shelfPosition} references missing storageSlots entry for ${itemName}.`,
    );
  }

  return {
    itemId: requiredText(read(row, 'item_id'), 'items.item_id'),
    ownerHeroId: requiredText(read(row, 'hero_id'), 'items.hero_id'),
    serverId: requiredText(read(row, 'server_id'), 'items.server_id'),
    name: itemName,
    lifecycleStatus: requiredText(read(row, 'item_status'), 'items.item_status') as PlayerArmoryItemReadModel['lifecycleStatus'],
    generationBaseId: optionalText(read(row, 'generation_base_id')),
    generationQualityKey: optionalText(read(row, 'generation_quality_key')),
    prefixAffixId: optionalText(read(row, 'prefix_affix_id')),
    suffixAffixId: optionalText(read(row, 'suffix_affix_id')),
    armoryShelfPosition: shelf.position,
    drachmaValue: optionalNumber(read(row, 'drachma_value')),
    shelfPosition: shelf.position,
    shelfName: optionalText(read(row, 'shelf_name')),
    baseName: optionalText(read(row, 'base_name')),
    baseTypeLabel: optionalText(read(row, 'baseTypeLabel')),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    primarySlotKey: optionalText(read(row, 'primary_slot_key')),
    primarySlotLabel: optionalText(read(row, 'primarySlotLabel')),
    valueDisplay: mapValueDisplay(read(row, 'valueDisplay')),
  };
}

function mapValueDisplay(value: Json | undefined): PlayerArmoryItemValueDisplay | null {
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

function mapEquipmentSlot(row: JsonRecord): PlayerArmoryEquipmentSlotReadModel {
  const hasItem = requiredBoolean(read(row, 'hasItem'), 'equipmentSlots.hasItem');

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

function mapLoadoutPreset(row: JsonRecord): PlayerArmoryLoadoutPresetReadModel {
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
    updatedAt: requiredText(read(row, 'updated_at'), 'loadoutPresets.updated_at'),
  };
}
