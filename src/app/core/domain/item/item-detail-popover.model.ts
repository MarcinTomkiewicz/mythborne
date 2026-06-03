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
  valueTone: 'positive' | 'negative' | 'neutral';
}

export interface ItemDetailPopoverValuePart {
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
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

export interface ItemDetailPopoverCopy {
  triggerLabel: string;
  triggerAriaLabelTemplate: string;
  loadingLabel: string;
  unavailableLabel: string;
  itemStatsSectionTitle: string;
  bonusesSectionTitle: string;
  noBonusesLabel: string;
  requirementsSectionTitle: string;
  currentValueLabel: string;
  noRequirementsLabel: string;
  requirementsUnavailableLabel: string;
  valueUnavailableLabel: string;
  currentItemContextLabel: string;
  currentEquippedItemContextLabel: string;
  sections: ItemDetailPopoverCopySections;
  empty: ItemDetailPopoverCopyEmpty;
}

export interface ItemDetailPopoverCopySections {
  itemStats: string;
  bonuses: string;
  requirements: string;
}

export interface ItemDetailPopoverCopyEmpty {
  noStats: string;
  noBonuses: string;
  noRequirements: string;
  requirementsUnavailable: string;
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
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  itemStats: ItemDetailPopoverValueRow[];
  modifierRows: ItemDetailPopoverValueRow[];
  requirementRows: ItemDetailPopoverRequirementRow[];
  requirementState: ItemDetailPopoverRequirementState | null;
  context: ItemDetailPopoverContext;
  isLoading: boolean;
  error: string | null;
}
