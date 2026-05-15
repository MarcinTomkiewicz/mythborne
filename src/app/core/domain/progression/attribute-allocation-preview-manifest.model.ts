export interface AttributeAllocationPreviewManifest {
  contractVersion: string | null;
  oneShotManifest: boolean;
  perClickRpcPreviewRequired: boolean;
  frontendMayEvaluateLocally: boolean;
  baseStatInputs: Record<string, AttributeAllocationBaseStatInput>;
  rows: AttributeAllocationPreviewRow[];
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
  descriptor: AttributeAllocationPreviewDescriptor | null;
  draftDependencies: string[];
  draftDependencyScales: Record<string, number>;
}
