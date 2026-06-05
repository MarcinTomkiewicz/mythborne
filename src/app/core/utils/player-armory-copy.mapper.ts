import {
  PlayerArmoryPageCopyAvailabilityOption,
  PlayerArmoryPageCopyReadModel,
  PlayerArmorySellItemMessageParts,
  PlayerArmorySellSelectedItemLineParts,
  PlayerArmorySellSelectedMessageParts,
} from '../domain/item/player-armory-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredArray,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapArmoryCopyJson(
  value: Json | undefined,
): PlayerArmoryPageCopyReadModel {
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
