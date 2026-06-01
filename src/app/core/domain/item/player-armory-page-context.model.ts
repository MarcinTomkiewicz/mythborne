import { Json } from '../../types/database.types';
import { JsonRecord } from '../../utils/json-read';
import { ItemLifecycleStatus } from './item-equipment.model';

export interface PlayerArmoryPageContextReadModel {
  heroId: string;
  serverId: string;
  originKey: string | null;
  copyJson: JsonRecord;
  readModel: PlayerArmoryReadModel;
  equipmentSlots: PlayerArmoryEquipmentSlotReadModel[];
  loadoutPresets: PlayerArmoryLoadoutPresetReadModel[];
  runtimeDerivedStats: Json | null;
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
  lifecycleStatus: ItemLifecycleStatus;
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
