export type ItemDetailPopoverSnapshotKind =
  | 'current'
  | 'trade_snapshot'
  | 'auction_snapshot'
  | 'report_reference'
  | 'reward_item'
  | 'safe_partial';

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
  valueTone: 'positive' | 'negative' | 'neutral';
}

export interface ItemDetailPopoverValuePart {
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
}

export interface ItemDetailPopoverRequirementRow {
  key: string;
  label: string;
  requiredValue: string;
  currentValue: string | null;
  isMet: boolean | null;
  failureReason: string | null;
}

export interface ItemDetailPopoverRequirementState {
  kind: ItemDetailPopoverRequirementKind;
  label: string;
  details: string | null;
}

export interface ItemDetailPopoverContext {
  kind: ItemDetailPopoverSnapshotKind;
  label: string;
  capturedAt: string | null;
  sourceLabel: string | null;
}

export interface ItemDetailPopoverViewModel {
  itemId: string | null;
  name: string;
  description: string | null;
  statusLabel: string | null;
  qualityLabel: string | null;
  kindLabel: string | null;
  slotLabel: string | null;
  iconClass: string;
  drachmaValue: number | null;
  nativeStats: ItemDetailPopoverValueRow[];
  bonusRows: ItemDetailPopoverValueRow[];
  requirementRows: ItemDetailPopoverRequirementRow[];
  requirementState: ItemDetailPopoverRequirementState | null;
  context: ItemDetailPopoverContext;
  isLoading: boolean;
  error: string | null;
}
