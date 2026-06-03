import type { Json } from '../../types/database.types';
import type { PlayerItemDisplayCoreValueDisplay } from './player-item-display-core.model';

export type ItemDetailPopoverDetailContractVersion = 'player_item_popover_detail_v1';
export type ItemDetailPopoverDisplayTone = 'positive' | 'negative' | 'neutral';

// Canonical viewer-authorized item popover payload. It can represent Armory,
// Trade, Auction, Report or other visible items; it is not owned-player-item specific.
export interface ItemDetailPopoverDetailReadModel {
  contractVersion: ItemDetailPopoverDetailContractVersion;
  source: string | null;
  itemId: string;
  heroId: string | null;
  displayMeta: ItemDetailPopoverDisplayMeta;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  itemStats: ItemDetailPopoverStatRow[];
  modifierRows: ItemDetailPopoverModifierRow[];
  bonuses: ItemDetailPopoverModifierRow[];
  bonusRows: ItemDetailPopoverModifierRow[];
  displayBonusRows: ItemDetailPopoverModifierRow[];
  requirements: ItemDetailPopoverRequirementRow[];
  requirementStatus: ItemDetailPopoverRequirementStatus;
  meetsRequirements: boolean | null;
  requirementCount: number | null;
  unmetCount: number | null;
  failuresJson: Json;
  metadata: Json;
}

export interface ItemDetailPopoverDisplayMeta {
  itemId: string;
  heroId: string | null;
  serverId: string | null;
  itemName: string;
  lifecycleStatusKey: string | null;
  lifecycleStatusLabel: string | null;
  generationQualityKey: string | null;
  displayIconKey: string;
  qualityLabel: string | null;
  baseKey: string | null;
  baseName: string | null;
  baseTypeKey: string | null;
  baseTypeLabel: string | null;
  drachmaValue: string | null;
  allowedSlotLabel: string | null;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  equipmentArea: string | null;
  handUsageKey: string | null;
  handUsageLabel: string | null;
  primarySlotKey: string | null;
  primarySlotLabel: string | null;
  equipmentSlotKey: string | null;
  equipmentSlotLabel: string | null;
  allowedSlotKeys: string[];
  equipTarget: Json | null;
  metadata: Json;
}

export interface ItemDetailPopoverStatRow {
  key: string | null;
  label: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  targetKey: string | null;
  sourceKey: string | null;
  sourceLabel: string | null;
  sortOrder: number | null;
  metadata: Json;
  sourceRows: Json;
}

export interface ItemDetailPopoverModifierRow {
  key: string | null;
  label: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  targetKey: string | null;
  sourceKey: string | null;
  sourceLabel: string | null;
  sortOrder: number | null;
  metadata: Json;
  sourceRows: Json;
}

export interface ItemDetailPopoverRequirementRow {
  key: string | null;
  requirementDefinitionKey: string | null;
  requiredStatKey: string | null;
  displayText: string;
  requiredDisplayText: string | null;
  currentDisplayText: string | null;
  failureDisplayText: string | null;
  failureReasonLabel: string | null;
  isMet: boolean | null;
  requiredValue: number | null;
  currentValue: number | null;
  missingValue: number | null;
  metadata: Json;
  rawRequirement: Json;
}

export interface ItemDetailPopoverRequirementStatus {
  meetsRequirements: boolean | null;
  requirementCount: number | null;
  unmetCount: number | null;
  failuresJson: Json;
  checkJson: Json | null;
}
