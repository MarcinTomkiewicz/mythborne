import {
  PlayerArmoryPageCopyAvailabilityOption,
  PlayerArmoryPageCopyReadModel,
} from '../domain/item/player-armory-page-context.model';
import {
  JsonRecord,
  read,
  requiredArray,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapCopyFilters(filters: JsonRecord): PlayerArmoryPageCopyReadModel['filters'] {
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

export function mapCopySearch(search: JsonRecord): PlayerArmoryPageCopyReadModel['search'] {
  return {
    placeholder: requiredText(read(search, 'placeholder'), 'copyJson.search.placeholder'),
  };
}

export function mapCopyInventory(inventory: JsonRecord): PlayerArmoryPageCopyReadModel['inventory'] {
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

export function mapCopyLoadoutPresets(
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

export function mapCopyEquipmentPreview(
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
