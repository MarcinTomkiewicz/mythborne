import type { PlayerItemDisplayCoreValueDisplay } from './player-item-display-core.model';

export type ItemDetailPopoverRequirementKind =
  | 'met'
  | 'not_met'
  | 'not_applicable'
  | 'unknown';

export interface ItemDetailPopoverValueRow {
  key: string;
  label: string;
  displayValue: string;
  valueParts: ItemDetailPopoverValuePart[];
  sourceLabel: string | null;
  isBoosted: boolean;
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
  failureReason: string | null;
}

export interface ItemDetailPopoverRequirementState {
  kind: ItemDetailPopoverRequirementKind;
  label: string | null;
  details: string | null;
}

export interface ItemDetailPopoverContext {
  kind: 'current';
  label: string | null;
  capturedAt: string | null;
  sourceLabel: string | null;
}

export type ItemPopoverContextKey =
  | 'armory'
  | 'equipment_preview'
  | 'auction'
  | 'trade'
  | 'exploration'
  | 'public_report'
  | string;

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
  description: string | null;
  statusLabel: string | null;
  headerMetaLabels: string[];
  iconClass: string;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  itemStats: ItemDetailPopoverValueRow[];
  modifierRows: ItemDetailPopoverValueRow[];
  requirementRows: ItemDetailPopoverRequirementRow[];
  requirementState: ItemDetailPopoverRequirementState | null;
  context: ItemDetailPopoverContext;
  isLoading: boolean;
  error: string | null;
}
