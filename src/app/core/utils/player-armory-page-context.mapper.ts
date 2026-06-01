import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryItemValueDisplay,
  PlayerArmoryPageCopyAvailabilityOption,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageCopyReadModel,
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

function mapCopyJson(value: Json | undefined): PlayerArmoryPageCopyReadModel {
  const copyJson = requiredRecord(value, 'copyJson');
  const page = requiredRecord(read(copyJson, 'page'), 'copyJson.page');
  const sections = requiredRecord(read(copyJson, 'sections'), 'copyJson.sections');
  const summary = requiredRecord(read(copyJson, 'summary'), 'copyJson.summary');
  const actions = requiredRecord(read(copyJson, 'actions'), 'copyJson.actions');
  const confirmations = requiredRecord(
    read(copyJson, 'confirmations'),
    'copyJson.confirmations',
  );
  const filters = requiredRecord(read(copyJson, 'filters'), 'copyJson.filters');
  const search = requiredRecord(read(copyJson, 'search'), 'copyJson.search');
  const inventory = requiredRecord(read(copyJson, 'inventory'), 'copyJson.inventory');
  const loadoutPresets = requiredRecord(
    read(copyJson, 'loadoutPresets'),
    'copyJson.loadoutPresets',
  );
  const equipmentPreview = requiredRecord(
    read(copyJson, 'equipmentPreview'),
    'copyJson.equipmentPreview',
  );

  return {
    page: {
      title: requiredText(read(page, 'title'), 'copyJson.page.title'),
      loadingLabel: requiredText(read(page, 'loadingLabel'), 'copyJson.page.loadingLabel'),
      errorTitle: requiredText(read(page, 'errorTitle'), 'copyJson.page.errorTitle'),
    },
    sections: {
      inventory: requiredText(read(sections, 'inventory'), 'copyJson.sections.inventory'),
      equipmentPreview: requiredText(
        read(sections, 'equipmentPreview'),
        'copyJson.sections.equipmentPreview',
      ),
      loadoutPresets: requiredText(
        read(sections, 'loadoutPresets'),
        'copyJson.sections.loadoutPresets',
      ),
    },
    summary: {
      capacity: requiredText(read(summary, 'capacity'), 'copyJson.summary.capacity'),
      allItems: requiredText(read(summary, 'allItems'), 'copyJson.summary.allItems'),
      equippedItems: requiredText(
        read(summary, 'equippedItems'),
        'copyJson.summary.equippedItems',
      ),
      savedSets: requiredText(read(summary, 'savedSets'), 'copyJson.summary.savedSets'),
    },
    empty: requiredRecord(read(copyJson, 'empty'), 'copyJson.empty'),
    storage: requiredRecord(read(copyJson, 'storage'), 'copyJson.storage'),
    actions: {
      savePreset: requiredText(read(actions, 'savePreset'), 'copyJson.actions.savePreset'),
      renamePreset: requiredText(read(actions, 'renamePreset'), 'copyJson.actions.renamePreset'),
      unequipSelected: requiredText(
        read(actions, 'unequipSelected'),
        'copyJson.actions.unequipSelected',
      ),
      unequipAll: requiredText(read(actions, 'unequipAll'), 'copyJson.actions.unequipAll'),
    },
    confirmations: {
      cancelLabel: requiredText(
        read(confirmations, 'cancelLabel'),
        'copyJson.confirmations.cancelLabel',
      ),
    },
    filters: {
      allSlots: requiredText(read(filters, 'allSlots'), 'copyJson.filters.allSlots'),
      allAvailability: requiredText(
        read(filters, 'allAvailability'),
        'copyJson.filters.allAvailability',
      ),
      allStorageSlots: requiredText(
        read(filters, 'allStorageSlots'),
        'copyJson.filters.allStorageSlots',
      ),
      storageSlotPlaceholder: requiredText(
        read(filters, 'storageSlotPlaceholder'),
        'copyJson.filters.storageSlotPlaceholder',
      ),
      availabilityOptions: mapAvailabilityOptions(
        requiredArray(
          read(filters, 'availabilityOptions'),
          'copyJson.filters.availabilityOptions',
        ),
      ),
    },
    search: {
      placeholder: requiredText(read(search, 'placeholder'), 'copyJson.search.placeholder'),
    },
    inventory: {
      clearFiltersLabel: requiredText(
        read(inventory, 'clearFiltersLabel'),
        'copyJson.inventory.clearFiltersLabel',
      ),
      noFilterResultsLabel: requiredText(
        read(inventory, 'noFilterResultsLabel'),
        'copyJson.inventory.noFilterResultsLabel',
      ),
    },
    loadoutPresets: {
      renameLabel: requiredText(
        read(loadoutPresets, 'renameLabel'),
        'copyJson.loadoutPresets.renameLabel',
      ),
      applyLabel: requiredText(
        read(loadoutPresets, 'applyLabel'),
        'copyJson.loadoutPresets.applyLabel',
      ),
      clearLabel: requiredText(
        read(loadoutPresets, 'clearLabel'),
        'copyJson.loadoutPresets.clearLabel',
      ),
      loadingLabel: requiredText(
        read(loadoutPresets, 'loadingLabel'),
        'copyJson.loadoutPresets.loadingLabel',
      ),
      emptyLabel: requiredText(
        read(loadoutPresets, 'emptyLabel'),
        'copyJson.loadoutPresets.emptyLabel',
      ),
    },
    itemDetail: requiredRecord(read(copyJson, 'itemDetail'), 'copyJson.itemDetail'),
    equipmentPreview: {
      title: requiredText(read(equipmentPreview, 'title'), 'copyJson.equipmentPreview.title'),
      emptyLabel: requiredText(
        read(equipmentPreview, 'emptyLabel'),
        'copyJson.equipmentPreview.emptyLabel',
      ),
      emptySlotLabel: requiredText(
        read(equipmentPreview, 'emptySlotLabel'),
        'copyJson.equipmentPreview.emptySlotLabel',
      ),
      emptySlotDetail: requiredText(
        read(equipmentPreview, 'emptySlotDetail'),
        'copyJson.equipmentPreview.emptySlotDetail',
      ),
      loadingLabel: requiredText(
        read(equipmentPreview, 'loadingLabel'),
        'copyJson.equipmentPreview.loadingLabel',
      ),
      unavailableLabel: requiredText(
        read(equipmentPreview, 'unavailableLabel'),
        'copyJson.equipmentPreview.unavailableLabel',
      ),
      armoryLabel: requiredText(
        read(equipmentPreview, 'armoryLabel'),
        'copyJson.equipmentPreview.armoryLabel',
      ),
    },
  };
}

function mapAvailabilityOptions(
  rows: readonly JsonRecord[],
): PlayerArmoryPageCopyAvailabilityOption[] {
  return rows.map((row) => ({
    key: requiredText(read(row, 'key'), 'copyJson.filters.availabilityOptions.key'),
    label: requiredText(read(row, 'label'), 'copyJson.filters.availabilityOptions.label'),
    sortOrder: requiredNonNegativeInteger(
      read(row, 'sortOrder'),
      'copyJson.filters.availabilityOptions.sortOrder',
    ),
  }));
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
    isPersisted: isUnsortedDropArea
      ? false
      : requiredBoolean(read(row, 'existsInDb'), `${fieldPath}.existsInDb`),
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

  const lifecycleStatusKey = requiredText(
    read(row, 'lifecycleStatusKey'),
    'items.lifecycleStatusKey',
  );

  return {
    itemId: requiredText(read(row, 'item_id'), 'items.item_id'),
    ownerHeroId: requiredText(read(row, 'hero_id'), 'items.hero_id'),
    serverId: requiredText(read(row, 'server_id'), 'items.server_id'),
    name: itemName,
    lifecycleStatusKey,
    lifecycleStatusLabel: requiredText(
      read(row, 'lifecycleStatusLabel'),
      'items.lifecycleStatusLabel',
    ),
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
