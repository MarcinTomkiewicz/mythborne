import { JsonRecord } from '../../utils/json-read';
import type { EquipmentPreviewCopy } from '../equipment/equipment-preview.model';
import type { PlayerItemDisplayCore } from './player-item-display-core.model';

export interface PlayerArmoryPageContextReadModel {
  heroId: string;
  serverId: string;
  originKey: string | null;
  copyJson: PlayerArmoryPageCopyReadModel;
  readModel: PlayerArmoryReadModel;
  equipmentSlots: PlayerArmoryEquipmentSlotReadModel[];
  loadoutPresets: PlayerArmoryLoadoutPresetReadModel[];
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

export type PlayerArmoryItemDisplayCore = Omit<PlayerItemDisplayCore, 'drachmaValue'> & {
  valueDisplay: NonNullable<PlayerItemDisplayCore['valueDisplay']>;
};

export interface PlayerArmoryItemReadModel {
  itemId: string;
  heroId: string;
  serverId: string;
  itemName: string;
  lifecycleStatusKey: string;
  lifecycleStatusLabel: string | null;
  generationQualityKey: string | null;
  qualityMultiplier: number | null;
  qualityLabel: string | null;
  generationBaseId: string | null;
  baseKey: string | null;
  baseName: string | null;
  baseTypeKey: string | null;
  baseTypeLabel: string | null;
  prefixAffixId: string | null;
  prefixKey: string | null;
  prefixName: string | null;
  suffixAffixId: string | null;
  suffixKey: string | null;
  suffixName: string | null;
  armoryShelfPosition: number;
  drachmaValue: number | null;
  generatedAt: string | null;
  createdAt: string | null;
  storagePosition: number;
  storageSlotKey: string | null;
  shelfName: string | null;
  storageSlotName: string | null;
  isUnsorted: boolean;
  visibilityIndex: number;
  visibilityLimit: number;
  isVisible: boolean;
  itemCategoryKey: string | null;
  equipmentArea: string | null;
  primarySlotKey: string | null;
  primarySlotLabel: string | null;
  handUsageKey: string | null;
  handUsageLabel: string | null;
  allowedSlotKeys: string[];
  allowedSlotLabel: string | null;
  displayIconKey: string;
  meetsRequirements: boolean;
  requirementCount: number;
  unmetRequirementCount: number;
  requirementStatus: JsonRecord;
  displayCore: PlayerArmoryItemDisplayCore;
}

interface PlayerArmoryEquipmentSlotBaseReadModel {
  slotKey: string;
  slotLabel: string;
  slotSortOrder: number;
  itemDisplayName: string;
  itemDisplayStateLabel: string | null;
  itemStatusKey: string | null;
  equipmentArea: string | null;
  qualityLabel: string | null;
  baseName: string | null;
}

export type PlayerArmoryEquipmentSlotReadModel =
  | PlayerArmoryEmptyEquipmentSlotReadModel
  | PlayerArmoryEquippedEquipmentSlotReadModel;

export type PlayerArmoryEquippedEquipmentSlotReadModel =
  | PlayerArmoryFullEquipmentSlotReadModel
  | PlayerArmoryDegradedEquipmentSlotReadModel;

export interface PlayerArmoryEmptyEquipmentSlotReadModel
  extends PlayerArmoryEquipmentSlotBaseReadModel {
  hasItem: false;
  isEmpty: true;
  itemId: null;
  itemName: null;
  item: null;
}

export interface PlayerArmoryFullEquipmentSlotReadModel
  extends PlayerArmoryEquipmentSlotBaseReadModel {
  hasItem: true;
  isEmpty: false;
  itemId: string;
  itemName: string;
  item: PlayerArmoryItemReadModel;
}

export interface PlayerArmoryDegradedEquipmentSlotReadModel
  extends PlayerArmoryEquipmentSlotBaseReadModel {
  hasItem: true;
  isEmpty: false;
  itemId: string;
  itemName: string;
  item: null;
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
