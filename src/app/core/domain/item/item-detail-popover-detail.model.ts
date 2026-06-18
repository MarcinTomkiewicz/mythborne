import type { PlayerItemDisplayCoreValueDisplay } from './player-item-display-core.model';

export type ItemDetailPopoverDetailContractVersion = 'item_detail_popover_detail_v1';
export type ItemDetailPopoverDisplayTone = string;

// Canonical viewer-authorized item popover payload. It can represent Armory,
// Trade, Auction, Report or other visible items; it is not owned-player-item specific.
export interface ItemDetailPopoverDetailReadModel {
  contractVersion: ItemDetailPopoverDetailContractVersion;
  itemId: string | null;
  displayMeta: ItemDetailPopoverDisplayMeta;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  itemStats: ItemDetailPopoverStatRow[];
  modifierRows: ItemDetailPopoverModifierRow[];
  requirements: ItemDetailPopoverRequirementRow[];
  requirementStatus: ItemDetailPopoverRequirementStatus;
}

export interface ItemDetailPopoverDisplayMeta {
  itemName: string;
  displayIconKey: string;
  qualityLabel: string | null;
  baseTypeLabel: string | null;
  allowedSlotLabel: string | null;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
}

export interface ItemDetailPopoverStatRow {
  label: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  displaySegments: ItemDetailPopoverStatValueSegment[];
}

export interface ItemDetailPopoverStatValueSegment {
  text: string;
  tone: ItemDetailPopoverDisplayTone;
}

export interface ItemDetailPopoverModifierRow {
  label: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
}

export interface ItemDetailPopoverRequirementRow {
  isMet: boolean | null;
  displayLabel: string;
  requiredDisplayValue: string | null;
  currentDisplayValue: string | null;
  compactDisplay: ItemDetailPopoverRequirementCompactDisplay | null;
  currentDisplayText: string | null;
  currentValueLabel: string | null;
}

export interface ItemDetailPopoverRequirementCompactDisplay {
  label: string;
  requiredValue: string;
  currentValue: string | null;
}

export interface ItemDetailPopoverRequirementStatus {
  meetsRequirements: boolean | null;
  requirementCount: number | null;
  unmetCount: number | null;
}
