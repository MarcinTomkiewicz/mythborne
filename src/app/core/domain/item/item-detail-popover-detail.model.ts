import type { Json } from '../../types/database.types';
import type { PlayerItemDisplayCoreValueDisplay } from './player-item-display-core.model';

export type ItemDetailPopoverDetailContractVersion = 'item_detail_popover_detail_v1';
export type ItemDetailPopoverDisplayTone = string;

// Canonical viewer-authorized item popover payload. It can represent Armory,
// Trade, Auction, Report or other visible items; it is not owned-player-item specific.
export interface ItemDetailPopoverDetailReadModel {
  contractVersion: ItemDetailPopoverDetailContractVersion;
  access: ItemDetailPopoverAccess;
  source: string;
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
  requirementsJson: ItemDetailPopoverRequirementRow[];
  requirementStatus: ItemDetailPopoverRequirementStatus;
  meetsRequirements: boolean | null;
  requirementCount: number | null;
  unmetCount: number | null;
  failuresJson: Json;
  metadata: Json;
}

export interface ItemDetailPopoverAccess {
  accessKind: string;
  sourceContext: string | null;
  isOwnedByViewer: boolean;
  isAuctionListing: boolean;
  isTradeOfferItem: boolean;
}

export interface ItemDetailPopoverDisplayMeta {
  itemId: string;
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
  allowedSlotKeys: string[];
}

export interface ItemDetailPopoverStatRow {
  displaySection: 'item_stats';
  isPrimaryItemStat: true;
  label: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  statKey: string;
  source: string | null;
  contract: string | null;
  isMeaningful: boolean | null;
  value: number | null;
  minDamage: number | null;
  maxDamage: number | null;
  rawValue: number | null;
  baseValue: number | null;
  rawBaseValue: number | null;
  modifierValue: number | null;
  rawMinDamage: number | null;
  rawMaxDamage: number | null;
  baseMinDamage: number | null;
  baseMaxDamage: number | null;
  rawBaseMinDamage: number | null;
  rawBaseMaxDamage: number | null;
  modifierMinDamage: number | null;
  modifierMaxDamage: number | null;
  modifierDamageTotal: number | null;
  baseDisplayValue: string | null;
  modifierDisplayValue: string | null;
  damageRangeClamped: boolean | null;
  baseDamageRangeClamped: boolean | null;
}

export interface ItemDetailPopoverModifierRow {
  displaySection: 'bonuses';
  isPrimaryItemStat: false;
  rowKind: string;
  aggregated: boolean;
  label: string;
  targetLabel: string | null;
  targetKey: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  typeKey: string | null;
  scopeKey: string | null;
  valueKind: string | null;
  rawValue: number | null;
  effectiveValue: number | null;
  sortOrder: number | null;
  sourceCount: number | null;
  sourceRows: ItemDetailPopoverModifierSourceRow[];
  metadata: Json;
}

export interface ItemDetailPopoverModifierSourceRow {
  itemId: string | null;
  label: string;
  targetLabel: string | null;
  targetKey: string;
  displayValue: string;
  displayTone: ItemDetailPopoverDisplayTone;
  typeKey: string | null;
  valueKind: string | null;
  rawValue: number | null;
  effectiveValue: number | null;
  sourceKey: string | null;
  sourceLabel: string | null;
  sourceLayer: string | null;
  entityBonusId: string | null;
  sourceEntityId: string | null;
  sourceEntityType: string | null;
  bonusTemplateId: string | null;
  bonusTemplateKey: string | null;
  bonusTemplateLabel: string | null;
  qualityMultiplier: number | null;
  qualityScalesValue: boolean | null;
  sortOrder: number | null;
  displayBonusSourceJsonKey: string | null;
  metadata: Json;
}

export interface ItemDetailPopoverRequirementRow {
  displaySection: 'requirements';
  displayTone: ItemDetailPopoverDisplayTone;
  isMet: boolean;
  displayLabel: string;
  requiredDisplayValue: string | null;
  currentDisplayValue: string | null;
  missingDisplayValue: string | null;
  failureCompactText: string | null;
  compactDisplay: ItemDetailPopoverRequirementCompactDisplay | null;
  source: string | null;
  authority: string | null;
  displayText: string;
  shortDisplayText: string | null;
  requiredDisplayText: string | null;
  currentDisplayText: string | null;
  currentValueLabel: string | null;
  currentValueRaw: string | null;
  requiredValueLabel: string | null;
  requiredValueRaw: string | null;
  missingValueLabel: string | null;
  missingValueRaw: string | null;
  missingDisplayText: string | null;
  failureDisplayText: string | null;
  failureReasonKey: string | null;
  failureReasonLabel: string | null;
  requirementDefinitionKey: string;
  requirementLabel: string | null;
  requiredStatKey: string | null;
  requiredStatLabel: string | null;
  requiredBuildingKey: string | null;
  requiredDistrictCode: string | null;
  requiredResourceType: string | null;
  requiredResourceLabel: string | null;
  requiredValue: number | null;
  currentValue: number | null;
  missingValue: number | null;
  failureRow: Json | null;
  effectiveRequirementRow: Json | null;
}

export interface ItemDetailPopoverRequirementCompactDisplay {
  label: string;
  requiredValue: string;
  currentValue: string | null;
  missingValue: string | null;
  failureText: string | null;
  tone: ItemDetailPopoverDisplayTone;
}

export interface ItemDetailPopoverRequirementStatus {
  meetsRequirements: boolean | null;
  requirementCount: number | null;
  unmetCount: number | null;
  failuresJson: Json;
  checkJson: Json | null;
}
