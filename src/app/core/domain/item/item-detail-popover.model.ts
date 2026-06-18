import type { PlayerItemDisplayCoreValueDisplay } from './player-item-display-core.model';

export type ItemDetailPopoverRequirementKind =
  | 'met'
  | 'not_met'
  | 'unknown';

export interface ItemDetailPopoverValueRow {
  key: string;
  label: string;
  displayValue: string;
  valueParts: ItemDetailPopoverValuePart[];
  valueTone: string;
}

export interface ItemDetailPopoverValuePart {
  text: string;
  tone: string;
}

export interface ItemDetailPopoverRequirementRow {
  key: string;
  label: string;
  requiredValue: string | null;
  currentValue: string | null;
  isMet: boolean | null;
}

export interface ItemDetailPopoverRequirementState {
  kind: ItemDetailPopoverRequirementKind;
}

export type ItemPopoverContextKey =
  | 'armory'
  | 'equipment_preview'
  | 'auction'
  | 'trade'
  | 'exploration'
  | 'public_report';

export interface ItemDetailPopoverCopy {
  contractVersion: 'item_detail_popover_copy_v1';
  sections: ItemDetailPopoverCopySections;
  labels: ItemDetailPopoverCopyLabels;
  empty: ItemDetailPopoverCopyEmpty;
  access: ItemDetailPopoverCopyAccess;
}

export interface ItemDetailPopoverCopySections {
  overview: string;
  itemStats: string;
  bonuses: string;
  requirements: string;
  value: string;
}

export interface ItemDetailPopoverCopyLabels {
  quality: string;
  baseType: string;
  slot: string;
  handUsage: string;
  valueInDrachmas: string;
  status: string;
  source: string;
}

export interface ItemDetailPopoverCopyEmpty {
  itemStats: string;
  bonuses: string;
  requirements: string;
  value: string;
}

export interface ItemDetailPopoverCopyAccess {
  notFound: string;
  notReadable: string;
}

export interface ItemDetailPopoverViewModel {
  itemId: string | null;
  name: string;
  headerMetaLabels: string[];
  iconClass: string;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  itemStats: ItemDetailPopoverValueRow[];
  modifierRows: ItemDetailPopoverValueRow[];
  requirementRows: ItemDetailPopoverRequirementRow[];
  requirementState: ItemDetailPopoverRequirementState | null;
  isLoading: boolean;
  error: string | null;
}
