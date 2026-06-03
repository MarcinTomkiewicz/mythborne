import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryItemValueDisplay,
  PlayerArmoryPageCopyAvailabilityOption,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageCopyReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
  PlayerArmorySellItemMessageParts,
  PlayerArmorySellSelectedItemLineParts,
  PlayerArmorySellSelectedMessageParts,
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
    equipmentSlots: requiredArray(
      read(root, 'equipmentSlots'),
      'equipmentSlots',
    ).map(mapEquipmentSlot),
    loadoutPresets: requiredArray(
      read(root, 'loadoutPresets'),
      'loadoutPresets',
    ).map(mapLoadoutPreset),
    runtimeDerivedStats: read(root, 'runtimeDerivedStats') ?? null,
  };
}

function mapCopyJson(value: Json | undefined): PlayerArmoryPageCopyReadModel {
  const copyJson = requiredRecord(value, 'copyJson');

  return {
    page: mapCopyPage(requiredRecord(read(copyJson, 'page'), 'copyJson.page')),
    sections: mapCopySections(requiredRecord(read(copyJson, 'sections'), 'copyJson.sections')),
    summary: mapCopySummary(requiredRecord(read(copyJson, 'summary'), 'copyJson.summary')),
    empty: requiredRecord(read(copyJson, 'empty'), 'copyJson.empty'),
    storage: requiredRecord(read(copyJson, 'storage'), 'copyJson.storage'),
    actions: mapCopyActions(requiredRecord(read(copyJson, 'actions'), 'copyJson.actions')),
    confirmations: mapCopyConfirmations(
      requiredRecord(read(copyJson, 'confirmations'), 'copyJson.confirmations'),
    ),
    filters: mapCopyFilters(requiredRecord(read(copyJson, 'filters'), 'copyJson.filters')),
    search: mapCopySearch(requiredRecord(read(copyJson, 'search'), 'copyJson.search')),
    inventory: mapCopyInventory(requiredRecord(read(copyJson, 'inventory'), 'copyJson.inventory')),
    loadoutPresets: mapCopyLoadoutPresets(
      requiredRecord(read(copyJson, 'loadoutPresets'), 'copyJson.loadoutPresets'),
    ),
    itemDetail: requiredRecord(read(copyJson, 'itemDetail'), 'copyJson.itemDetail'),
    equipmentPreview: mapCopyEquipmentPreview(
      requiredRecord(read(copyJson, 'equipmentPreview'), 'copyJson.equipmentPreview'),
    ),
  };
}

function mapCopyPage(page: JsonRecord): PlayerArmoryPageCopyReadModel['page'] {
  return {
    title: requiredText(read(page, 'title'), 'copyJson.page.title'),
    loadingLabel: requiredText(read(page, 'loadingLabel'), 'copyJson.page.loadingLabel'),
    errorTitle: requiredText(read(page, 'errorTitle'), 'copyJson.page.errorTitle'),
  };
}

function mapCopySections(sections: JsonRecord): PlayerArmoryPageCopyReadModel['sections'] {
  return {
    inventory: requiredText(read(sections, 'inventory'), 'copyJson.sections.inventory'),
    equipmentPreview: requiredText(
      read(sections, 'equipmentPreview'),
      'copyJson.sections.equipmentPreview',
    ),
    loadoutPresets: requiredText(
      read(sections, 'loadoutPresets'),
      'copyJson.sections.loadoutPresets',
    ),
  };
}

function mapCopySummary(summary: JsonRecord): PlayerArmoryPageCopyReadModel['summary'] {
  return {
    capacity: requiredText(read(summary, 'capacity'), 'copyJson.summary.capacity'),
    allItems: requiredText(read(summary, 'allItems'), 'copyJson.summary.allItems'),
    equippedItems: requiredText(
      read(summary, 'equippedItems'),
      'copyJson.summary.equippedItems',
    ),
    savedSets: requiredText(read(summary, 'savedSets'), 'copyJson.summary.savedSets'),
  };
}

function mapCopyActions(actions: JsonRecord): PlayerArmoryPageCopyReadModel['actions'] {
  return {
    equipItem: requiredText(read(actions, 'equipItem'), 'copyJson.actions.equipItem'),
    equipSelected: requiredText(
      read(actions, 'equipSelected'),
      'copyJson.actions.equipSelected',
    ),
    sellItem: requiredText(read(actions, 'sellItem'), 'copyJson.actions.sellItem'),
    sellSelected: requiredText(
      read(actions, 'sellSelected'),
      'copyJson.actions.sellSelected',
    ),
    renameStorageSlot: requiredText(
      read(actions, 'renameStorageSlot'),
      'copyJson.actions.renameStorageSlot',
    ),
    savePreset: requiredText(read(actions, 'savePreset'), 'copyJson.actions.savePreset'),
    renamePreset: requiredText(read(actions, 'renamePreset'), 'copyJson.actions.renamePreset'),
    unequipSelected: requiredText(read(actions, 'unequipSelected'), 'copyJson.actions.unequipSelected'),
    unequipAll: requiredText(read(actions, 'unequipAll'), 'copyJson.actions.unequipAll'),
  };
}

function mapCopyConfirmations(
  confirmations: JsonRecord,
): PlayerArmoryPageCopyReadModel['confirmations'] {
  return {
    cancelLabel: requiredText(read(confirmations, 'cancelLabel'), 'copyJson.confirmations.cancelLabel'),
    confirmLabel: requiredText(read(confirmations, 'confirmLabel'), 'copyJson.confirmations.confirmLabel'),
    sellItemTitle: requiredText(read(confirmations, 'sellItemTitle'), 'copyJson.confirmations.sellItemTitle'),
    sellItemMessageParts: mapSellItemMessageParts(
      requiredRecord(
        read(confirmations, 'sellItemMessageParts'),
        'copyJson.confirmations.sellItemMessageParts',
      ),
    ),
    sellItemHighlightFields: requiredTextArray(
      read(confirmations, 'sellItemHighlightFields'),
      'copyJson.confirmations.sellItemHighlightFields',
    ),
    sellSelectedMessageParts: mapSellSelectedMessageParts(
      requiredRecord(
        read(confirmations, 'sellSelectedMessageParts'),
        'copyJson.confirmations.sellSelectedMessageParts',
      ),
    ),
    sellSelectedHighlightFields: requiredTextArray(
      read(confirmations, 'sellSelectedHighlightFields'),
      'copyJson.confirmations.sellSelectedHighlightFields',
    ),
  };
}

function mapSellItemMessageParts(
  parts: JsonRecord,
): PlayerArmorySellItemMessageParts {
  return {
    prefix: requiredText(
      read(parts, 'prefix'),
      'copyJson.confirmations.sellItemMessageParts.prefix',
    ),
    itemNameToken: requiredText(
      read(parts, 'itemNameToken'),
      'copyJson.confirmations.sellItemMessageParts.itemNameToken',
    ),
    middle: requiredText(
      read(parts, 'middle'),
      'copyJson.confirmations.sellItemMessageParts.middle',
    ),
    drachmaValueToken: requiredText(
      read(parts, 'drachmaValueToken'),
      'copyJson.confirmations.sellItemMessageParts.drachmaValueToken',
    ),
    suffix: requiredText(
      read(parts, 'suffix'),
      'copyJson.confirmations.sellItemMessageParts.suffix',
    ),
  };
}

function mapCopyFilters(filters: JsonRecord): PlayerArmoryPageCopyReadModel['filters'] {
  return {
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
  };
}

function mapCopySearch(search: JsonRecord): PlayerArmoryPageCopyReadModel['search'] {
  return {
    placeholder: requiredText(read(search, 'placeholder'), 'copyJson.search.placeholder'),
  };
}

function mapCopyInventory(inventory: JsonRecord): PlayerArmoryPageCopyReadModel['inventory'] {
  return {
    actionBusyLabel: requiredText(
      read(inventory, 'actionBusyLabel'),
      'copyJson.inventory.actionBusyLabel',
    ),
    clearFiltersLabel: requiredText(
      read(inventory, 'clearFiltersLabel'),
      'copyJson.inventory.clearFiltersLabel',
    ),
    moveSelectedLabel: requiredText(
      read(inventory, 'moveSelectedLabel'),
      'copyJson.inventory.moveSelectedLabel',
    ),
    moveTargetPlaceholder: requiredText(
      read(inventory, 'moveTargetPlaceholder'),
      'copyJson.inventory.moveTargetPlaceholder',
    ),
    noFilterResultsLabel: requiredText(
      read(inventory, 'noFilterResultsLabel'),
      'copyJson.inventory.noFilterResultsLabel',
    ),
    selectedCountLabel: requiredText(
      read(inventory, 'selectedCountLabel'),
      'copyJson.inventory.selectedCountLabel',
    ),
    selectedValueLabel: requiredText(
      read(inventory, 'selectedValueLabel'),
      'copyJson.inventory.selectedValueLabel',
    ),
    shelfCount: mapCopyShelfCount(
      requiredRecord(read(inventory, 'shelfCount'), 'copyJson.inventory.shelfCount'),
    ),
  };
}

function mapCopyShelfCount(
  shelfCount: JsonRecord,
): PlayerArmoryPageCopyReadModel['inventory']['shelfCount'] {
  return {
    emptyLabel: requiredText(
      read(shelfCount, 'emptyLabel'),
      'copyJson.inventory.shelfCount.emptyLabel',
    ),
    oneTemplate: requiredText(
      read(shelfCount, 'oneTemplate'),
      'copyJson.inventory.shelfCount.oneTemplate',
    ),
    fewTemplate: requiredText(
      read(shelfCount, 'fewTemplate'),
      'copyJson.inventory.shelfCount.fewTemplate',
    ),
    manyTemplate: requiredText(
      read(shelfCount, 'manyTemplate'),
      'copyJson.inventory.shelfCount.manyTemplate',
    ),
  };
}

function mapSellSelectedMessageParts(
  parts: JsonRecord,
): PlayerArmorySellSelectedMessageParts {
  return {
    intro: requiredText(
      read(parts, 'intro'),
      'copyJson.confirmations.sellSelectedMessageParts.intro',
    ),
    itemsIntro: requiredText(
      read(parts, 'itemsIntro'),
      'copyJson.confirmations.sellSelectedMessageParts.itemsIntro',
    ),
    itemLineParts: mapSellSelectedItemLineParts(
      requiredRecord(
        read(parts, 'itemLineParts'),
        'copyJson.confirmations.sellSelectedMessageParts.itemLineParts',
      ),
    ),
    totalPrefix: requiredText(
      read(parts, 'totalPrefix'),
      'copyJson.confirmations.sellSelectedMessageParts.totalPrefix',
    ),
    totalValueToken: requiredText(
      read(parts, 'totalValueToken'),
      'copyJson.confirmations.sellSelectedMessageParts.totalValueToken',
    ),
    totalSuffix: requiredText(
      read(parts, 'totalSuffix'),
      'copyJson.confirmations.sellSelectedMessageParts.totalSuffix',
    ),
  };
}

function mapSellSelectedItemLineParts(
  parts: JsonRecord,
): PlayerArmorySellSelectedItemLineParts {
  return {
    itemNameToken: requiredText(
      read(parts, 'itemNameToken'),
      'copyJson.confirmations.sellSelectedMessageParts.itemLineParts.itemNameToken',
    ),
    middle: requiredText(
      read(parts, 'middle'),
      'copyJson.confirmations.sellSelectedMessageParts.itemLineParts.middle',
    ),
    drachmaValueToken: requiredText(
      read(parts, 'drachmaValueToken'),
      'copyJson.confirmations.sellSelectedMessageParts.itemLineParts.drachmaValueToken',
    ),
    suffix: requiredText(
      read(parts, 'suffix'),
      'copyJson.confirmations.sellSelectedMessageParts.itemLineParts.suffix',
    ),
  };
}

function mapCopyLoadoutPresets(
  loadoutPresets: JsonRecord,
): PlayerArmoryPageCopyReadModel['loadoutPresets'] {
  return {
    renameLabel: requiredText(read(loadoutPresets, 'renameLabel'), 'copyJson.loadoutPresets.renameLabel'),
    applyLabel: requiredText(read(loadoutPresets, 'applyLabel'), 'copyJson.loadoutPresets.applyLabel'),
    clearLabel: requiredText(read(loadoutPresets, 'clearLabel'), 'copyJson.loadoutPresets.clearLabel'),
    loadingLabel: requiredText(read(loadoutPresets, 'loadingLabel'), 'copyJson.loadoutPresets.loadingLabel'),
    emptyLabel: requiredText(read(loadoutPresets, 'emptyLabel'), 'copyJson.loadoutPresets.emptyLabel'),
  };
}

function mapCopyEquipmentPreview(
  equipmentPreview: JsonRecord,
): PlayerArmoryPageCopyReadModel['equipmentPreview'] {
  return {
    title: requiredText(read(equipmentPreview, 'title'), 'copyJson.equipmentPreview.title'),
    emptyLabel: requiredText(read(equipmentPreview, 'emptyLabel'), 'copyJson.equipmentPreview.emptyLabel'),
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
    unavailableLabel: requiredText(read(equipmentPreview, 'unavailableLabel'), 'copyJson.equipmentPreview.unavailableLabel'),
    armoryLabel: requiredText(read(equipmentPreview, 'armoryLabel'), 'copyJson.equipmentPreview.armoryLabel'),
  };
}

function mapAvailabilityOptions(
  rows: readonly JsonRecord[],
): PlayerArmoryPageCopyAvailabilityOption[] {
  return rows.map((row) => ({
    key: requiredText(
      read(row, 'key'),
      'copyJson.filters.availabilityOptions.key',
    ),
    label: requiredText(
      read(row, 'label'),
      'copyJson.filters.availabilityOptions.label',
    ),
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
  return rows.map((row) => mapStorageSlot(heroId, row, 'storageSlots', false));
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
    allowedSlotKeys: requiredTextArray(
      read(row, 'allowedSlotKeys'),
      'items.allowedSlotKeys',
    ),
    allowedSlotLabel: optionalText(read(row, 'allowedSlotLabel')),
    displayIconKey: optionalText(read(row, 'displayIconKey')),
    valueDisplay: mapValueDisplay(read(row, 'valueDisplay')),
  };
}

function requiredTextArray(value: Json | undefined, fieldPath: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an array.`);
  }

  return value.map((entry, index) =>
    requiredText(entry, `${fieldPath}[${index}]`),
  );
}

function mapValueDisplay(
  value: Json | undefined,
): PlayerArmoryItemValueDisplay | null {
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
    updatedAt: requiredText(
      read(row, 'updated_at'),
      'loadoutPresets.updated_at',
    ),
  };
}
