import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type ItemLifecycleStatus = Row<'items'>['status'];
export type ItemRequirementValueType = Row<'requirement_definitions'>['value_type'];
export type EquipmentSlotKey = string;
export type ArmoryShelfPosition = number;
export type LoadoutPresetNumber = number;

export const RUNTIME_USABLE_EQUIPPED_ITEM_STATUSES: readonly ItemLifecycleStatus[] = [
  'active',
  'locked_trade',
  'locked_auction',
];

export interface ItemSummary {
  itemId: string;
  ownerHeroId: string;
  serverId: string;
  name: string;
  description: string | null;
  lifecycleStatus: ItemLifecycleStatus;
  generationBaseId: string | null;
  generationQualityKey: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  armoryShelfPosition: ArmoryShelfPosition;
  drachmaValue: number | null;
}

export interface ItemLifecycleState {
  itemId: string;
  status: ItemLifecycleStatus;
  isRuntimeUsableWhenEquipped: boolean;
  scrappedAt: string | null;
  recoverableUntil: string | null;
}

export interface EquipmentSlot {
  slotKey: EquipmentSlotKey;
  label: string;
  sortOrder: number;
  equipmentArea: string;
  equipmentSlotGroup: string;
}

export interface EquippedItemSummary extends ItemSummary {
  slotKey: EquipmentSlotKey;
  slotLabel: string;
  slotSortOrder: number;
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
}

export interface ItemRequirementComponent {
  requirementId: string;
  requirementDefinitionKey: string;
  valueType: ItemRequirementValueType | null;
  requiredKey: string | null;
  requiredValue: number | string | boolean | null;
  requiredStatKey: string | null;
  rawRequiredValue: number | null;
  appliesFromLevel: number;
  sourceEntityType: string;
  sourceEntityId: string;
  sourceLayer: string;
  sourceKey: string;
  sourceLabel: string;
  sourceSortOrder: number;
  requirementSortOrder: number;
}

export interface ItemEffectiveRequirement {
  requirementDefinitionKey: string;
  valueType: ItemRequirementValueType | null;
  requiredKey: string | null;
  requiredStatKey: string | null;
  requiredValue: number;
  finalDecimalValue: number;
  highestComponentValue: number;
  additionalComponentValue: number;
  additionalRequirementFraction: number;
  preQualityValue: number;
  qualityRequirementMultiplier: number;
  roundingMode: string;
  componentCount: number;
}

export interface ItemRequirementPreview {
  itemId: string;
  heroId: string | null;
  meetsRequirements: boolean | null;
  components: ItemRequirementComponent[];
  effectiveRequirements: ItemEffectiveRequirement[];
}

export interface ArmoryShelf {
  shelfId: string;
  heroId: string;
  position: ArmoryShelfPosition;
  name: string;
  updatedAt: string;
}

export interface ArmoryItemSummary extends ItemSummary {
  shelfPosition: ArmoryShelfPosition;
  shelfName: string | null;
  requirementPreview: ItemRequirementPreview | null;
}

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
