import { Json } from '../../types/database.types';
import { JsonRecord } from '../../utils/json-read';
import type { EquipmentPreviewCopy } from '../equipment/equipment-preview.model';
import type { ItemDetailPopoverCopy } from './item-detail-popover.model';
import type { PlayerItemDisplayCore } from './player-item-display-core.model';

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
  itemDetail: ItemDetailPopoverCopy;
  equipmentPreview: EquipmentPreviewCopy;
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
  equipItem: string;
  equipSelected: string;
  sellItem: string;
  sellSelected: string;
  renameStorageSlot: string;
  savePreset: string;
  renamePreset: string;
  unequipSelected: string;
  unequipAll: string;
}

export interface PlayerArmoryPageCopyConfirmations {
  cancelLabel: string;
  confirmLabel: string;
  sellItemTitle: string;
  sellItemMessageParts: PlayerArmorySellItemMessageParts;
  sellItemHighlightFields: string[];
  sellSelectedMessageParts: PlayerArmorySellSelectedMessageParts;
  sellSelectedHighlightFields: string[];
}

export interface PlayerArmorySellItemMessageParts {
  prefix: string;
  itemNameToken: string;
  middle: string;
  drachmaValueToken: string;
  suffix: string;
}

export interface PlayerArmorySellSelectedMessageParts {
  intro: string;
  itemsIntro: string;
  itemLineParts: PlayerArmorySellSelectedItemLineParts;
  totalPrefix: string;
  totalValueToken: string;
  totalSuffix: string;
}

export interface PlayerArmorySellSelectedItemLineParts {
  itemNameToken: string;
  middle: string;
  drachmaValueToken: string;
  suffix: string;
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
  actionBusyLabel: string;
  clearFiltersLabel: string;
  moveSelectedLabel: string;
  moveTargetPlaceholder: string;
  noFilterResultsLabel: string;
  selectedCountLabel: string;
  selectedValueLabel: string;
  shelfCount: PlayerArmoryPageCopyShelfCount;
}

export interface PlayerArmoryPageCopyShelfCount {
  emptyLabel: string;
  oneTemplate: string;
  fewTemplate: string;
  manyTemplate: string;
}

export interface PlayerArmoryPageCopyLoadoutPresets {
  renameLabel: string;
  applyLabel: string;
  clearLabel: string;
  loadingLabel: string;
  emptyLabel: string;
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
  armoryShelfPosition: number;
  drachmaValue: number | null;
  shelfPosition: number;
  shelfName: string | null;
  allowedSlotKeys: string[];
  meetsRequirements?: boolean | null;
  displayCore: PlayerItemDisplayCore;
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
