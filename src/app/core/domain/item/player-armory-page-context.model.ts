import { Json } from '../../types/database.types';
import { JsonRecord } from '../../utils/json-read';

export interface PlayerArmoryPageContextReadModel {
  heroId: string;
  serverId: string;
  originKey: string | null;
  copyJson: PlayerArmoryPageCopyReadModel;
  readModel: PlayerArmoryReadModel;
  equipmentSlots: PlayerArmoryEquipmentSlotReadModel[];
  loadoutPresets: PlayerArmoryLoadoutPresetReadModel[];
  runtimeDerivedStats: Json | null;
}

export interface PlayerArmoryPageCopyReadModel {
  page: PlayerArmoryPageCopyPage;
  sections: PlayerArmoryPageCopySections;
  summary: PlayerArmoryPageCopySummary;
  empty: JsonRecord;
  storage: JsonRecord;
  actions: PlayerArmoryPageCopyActions;
  confirmations: PlayerArmoryPageCopyConfirmations;
  filters: PlayerArmoryPageCopyFilters;
  search: PlayerArmoryPageCopySearch;
  inventory: PlayerArmoryPageCopyInventory;
  loadoutPresets: PlayerArmoryPageCopyLoadoutPresets;
  itemDetail: JsonRecord;
  equipmentPreview: PlayerArmoryPageCopyEquipmentPreview;
}

export interface PlayerArmoryPageCopyPage {
  title: string;
  loadingLabel: string;
  errorTitle: string;
}

export interface PlayerArmoryPageCopySections {
  inventory: string;
  equipmentPreview: string;
  loadoutPresets: string;
}

export interface PlayerArmoryPageCopySummary {
  capacity: string;
  allItems: string;
  equippedItems: string;
  savedSets: string;
}

export interface PlayerArmoryPageCopyActions {
  savePreset: string;
  renamePreset: string;
  unequipSelected: string;
  unequipAll: string;
}

export interface PlayerArmoryPageCopyConfirmations {
  cancelLabel: string;
}

export interface PlayerArmoryPageCopyFilters {
  allSlots: string;
  allAvailability: string;
  allStorageSlots: string;
  storageSlotPlaceholder: string;
  availabilityOptions: PlayerArmoryPageCopyAvailabilityOption[];
}

export interface PlayerArmoryPageCopyAvailabilityOption {
  key: string;
  label: string;
  sortOrder: number;
}

export interface PlayerArmoryPageCopySearch {
  placeholder: string;
}

export interface PlayerArmoryPageCopyInventory {
  clearFiltersLabel: string;
  noFilterResultsLabel: string;
}

export interface PlayerArmoryPageCopyLoadoutPresets {
  renameLabel: string;
  applyLabel: string;
  clearLabel: string;
  loadingLabel: string;
  emptyLabel: string;
}

export interface PlayerArmoryPageCopyEquipmentPreview {
  title: string;
  emptyLabel: string;
  emptySlotLabel: string;
  emptySlotDetail: string;
  loadingLabel: string;
  unavailableLabel: string;
  armoryLabel: string;
}

export interface PlayerArmoryReadModel {
  heroId: string;
  shelves: PlayerArmoryStorageSlotReadModel[];
  visibleItems: PlayerArmoryItemReadModel[];
  visibility: PlayerArmoryVisibilityReadModel;
}

export interface PlayerArmoryVisibilityReadModel {
  visibleItemCount: number;
  totalOwnedItemCount: number;
  hiddenItemCount: number;
  visibilityLimit: number;
}

export interface PlayerArmoryStorageSlotReadModel {
  storageSlotId: string | null;
  storageSlotKey: string | null;
  heroId: string;
  position: number;
  name: string;
  displayName: string;
  displayLabel: string;
  displayValue: string | null;
  visibleItemCount: number;
  itemCount: number;
  sortOrder: number;
  isPersisted: boolean;
  isUnsortedDropArea: boolean;
  visibleItems: PlayerArmoryItemReadModel[];
}

export interface PlayerArmoryItemReadModel {
  itemId: string;
  ownerHeroId: string;
  serverId: string;
  name: string;
  lifecycleStatusKey: string;
  lifecycleStatusLabel: string;
  generationBaseId: string | null;
  generationQualityKey: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  armoryShelfPosition: number;
  drachmaValue: number | null;
  shelfPosition: number;
  shelfName: string | null;
  baseName: string | null;
  baseTypeLabel: string | null;
  qualityLabel: string | null;
  primarySlotKey: string | null;
  primarySlotLabel: string | null;
  valueDisplay: PlayerArmoryItemValueDisplay | null;
}

export interface PlayerArmoryItemValueDisplay {
  displayLabel: string;
  displayValue: string;
}

export interface PlayerArmoryEquipmentSlotReadModel {
  slotKey: string;
  slotLabel: string;
  slotSortOrder: number;
  hasItem: boolean;
  isEmpty: boolean;
  itemDisplayName: string;
  itemDisplayStateLabel: string | null;
  itemStatusKey: string | null;
  equipmentArea: string | null;
  itemId: string | null;
  itemName: string | null;
  qualityLabel: string | null;
  baseName: string | null;
}

export interface PlayerArmoryLoadoutPresetReadModel {
  presetId: string;
  heroId: string | null;
  presetNumber: number;
  name: string;
  slotCount: number;
  savedAt: string | null;
  clearedAt: string | null;
  createdAt: string | null;
  updatedAt: string;
}
