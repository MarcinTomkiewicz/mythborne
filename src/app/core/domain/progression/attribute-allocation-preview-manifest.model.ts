export interface AttributeAllocationPreviewManifest {
  contractVersion: string | null;
  oneShotManifest: boolean;
  perClickRpcPreviewRequired: boolean;
  frontendMayEvaluateLocally: boolean;
  frontendEvaluationPolicy: Record<string, unknown> | null;
  baseStatInputs: Record<string, AttributeAllocationBaseStatInput>;
  rows: AttributeAllocationPreviewRow[];
}

export interface AttributeAllocationModel {
  contractVersion: string;
  statRows: AttributeAllocationModelStatRow[];
  initialDraftSummary: AttributeAllocationDraftSummary;
  saveEligibility: AttributeAllocationSaveEligibility;
  draftEvaluationPolicy: Record<string, unknown>;
}

export interface AttributeAllocationModelStatRow {
  statKey: string;
  label: string;
  description: string | null;
  currentAllocatedValue: number;
  currentEffectiveValue: number;
  draftValue: number;
  draftEffectiveValue: number;
  nextLevelCost: number | null;
  maxAllocatedValue: number;
  canIncrease: boolean;
  canDecrease: boolean;
  increaseBlockerReasonKey: string | null;
  increaseBlockerMessage: string | null;
  decreaseBlockerReasonKey: string | null;
  decreaseBlockerMessage: string | null;
  costSteps: AttributeAllocationCostStep[];
}

export interface AttributeAllocationCostStep {
  sourceAllocatedValue: number;
  targetAllocatedValue: number;
  cost: number;
  cumulativeCostFromCurrent: number;
}

export interface AttributeAllocationDraftSummary {
  totalDraftCost: number;
  remainingCharacterPoints: number;
  canSave: boolean;
  saveBlockerReasonKey: string | null;
  saveBlockerMessage: string | null;
}

export interface AttributeAllocationSaveEligibility {
  canSave: boolean;
  blockerReasonKey: string | null;
  blockerMessage: string | null;
}

export interface AttributeAllocationBaseStatInput {
  currentAllocatedValue: number | null;
  currentEffectiveValue: number | null;
  additiveContextDelta: number;
}

export interface AttributeAllocationPreviewDescriptor {
  kind: string;
  input: string | null;
  constant: number;
  scale: number;
  min: number | null;
  terms: AttributeAllocationPreviewTerm[];
}

export interface AttributeAllocationPreviewTerm {
  input: string;
  scale: number;
  offset: number;
}

export type AttributeAllocationPreviewTone = 'neutral' | 'positive' | 'negative';

export interface AttributeAllocationPreviewRow {
  key: string;
  label: string;
  currentDisplay: string;
  draftDisplay: string | null;
  deltaDisplay: string | null;
  tone: AttributeAllocationPreviewTone;
  supported: boolean;
  currentValue: number | null;
  currentMin: number | null;
  currentMax: number | null;
  currentStrength: number | null;
  strengthVariable: string | null;
  uiPolicy: string | null;
  descriptor: AttributeAllocationPreviewDescriptor | null;
  draftDependencies: string[];
  draftDependencyScales: Record<string, number>;
}
