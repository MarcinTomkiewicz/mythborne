import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';
import type { PlayerArmoryReadModel } from './player-armory-page-context.model';

export type ItemLifecycleStatus = Row<'items'>['status'];
export type EquipmentSlotKey = string;
export type LoadoutPresetNumber = number;

export const RUNTIME_USABLE_EQUIPPED_ITEM_STATUSES: readonly ItemLifecycleStatus[] = [
  'active',
  'locked_trade',
  'locked_auction',
];

export interface EquipmentSlot {
  slotKey: EquipmentSlotKey;
  label: string;
  sortOrder: number;
  equipmentArea: string;
  equipmentSlotGroup: string;
}

export interface EquippedItemSummary {
  itemId: string;
  heroId: string;
  ownerHeroId: string | null;
  itemName: string;
  lifecycleStatus: ItemLifecycleStatus;
  generationBaseId: string | null;
  generationQualityKey: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  slotKey: EquipmentSlotKey;
  slotLabel: string;
  slotSortOrder: number;
  equipmentArea: string;
  equipmentSlotGroup: string;
  equippedAt: string;
  baseKey: string | null;
  baseName: string | null;
  baseTypeKey: string | null;
  handUsage: string | null;
  qualityLabel: string | null;
  qualityMultiplier: number | null;
  prefixKey: string | null;
  prefixName: string | null;
  suffixKey: string | null;
  suffixName: string | null;
  isRuntimeUsable: boolean;
}

export interface CurrentEquipmentLoadout {
  heroId: string;
  slots: EquippedItemSummary[];
}

export type EquipmentOperationAction =
  | 'equipped'
  | 'shifted'
  | 'unequipped'
  | 'failed'
  | 'skipped';

export const EQUIPMENT_OPERATION_ACTIONS: readonly EquipmentOperationAction[] = [
  'equipped',
  'shifted',
  'unequipped',
  'failed',
  'skipped',
];

export interface EquipmentOperationJournalEntry {
  action: EquipmentOperationAction;
  itemId: string | null;
  slotKey: EquipmentSlotKey | null;
  reason: string | null;
  message: string | null;
  success: boolean;
  detailsJson: Json | null;
}

export interface EquipmentOperationJournal {
  requestId: string | null;
  success: boolean;
  equipped: EquipmentOperationJournalEntry[];
  shifted: EquipmentOperationJournalEntry[];
  unequipped: EquipmentOperationJournalEntry[];
  failed: EquipmentOperationJournalEntry[];
  skipped: EquipmentOperationJournalEntry[];
  finalEquipment: CurrentEquipmentLoadout | null;
  diagnostics: Json | null;
  visibleArmoryItemsJson: Json | null;
  armoryStateJson: Json | null;
}

export type HeroArmoryReadModel = PlayerArmoryReadModel;

export interface LoadoutPreset {
  presetId: string;
  heroId: string;
  presetNumber: LoadoutPresetNumber;
  name: string;
  slotCount: number;
  savedAt: string | null;
  clearedAt: string | null;
  updatedAt: string;
}

export interface SaveLoadoutPresetResult {
  heroId: string;
  presetId: string;
  presetNumber: LoadoutPresetNumber;
  name: string;
  savedSlotCount: number;
  requestId: string | null;
  slotsJson: Json;
}

export interface RenameLoadoutPresetResult {
  heroId: string;
  presetId: string;
  presetNumber: LoadoutPresetNumber;
  name: string;
  requestId: string | null;
  updatedAt: string;
}

export interface ClearLoadoutPresetResult {
  heroId: string;
  presetId: string;
  presetNumber: LoadoutPresetNumber;
  name: string;
  clearedSlotCount: number;
  requestId: string | null;
}

export interface LoadoutPresetSlotItem {
  presetId: string;
  presetNumber: LoadoutPresetNumber;
  slotKey: EquipmentSlotKey;
  slotLabel: string;
  slotSortOrder: number;
  savedItemId: string;
  savedItemNameSnapshot: string | null;
  currentItemName: string | null;
  currentOwnerHeroId: string | null;
  lifecycleStatus: ItemLifecycleStatus | null;
  isOwnedByHero: boolean;
  isRuntimeUsable: boolean;
  previewStatus: string;
  statusMessage: string | null;
}

export interface LoadoutPresetPreview {
  preset: LoadoutPreset;
  slotItems: LoadoutPresetSlotItem[];
}
