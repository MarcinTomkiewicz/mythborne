import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';

export interface CreateCharacterServerOption {
  id: string;
  label: string;
  availability: StartFlowServerAvailability;
}

export interface CreateCharacterSummaryRow {
  label: string;
  value: string;
  tone?: 'default' | 'danger';
  multiline?: boolean;
  primary?: boolean;
}

export interface CreateCharacterServerBadge {
  label: string;
  tone: 'muted' | 'success' | 'danger';
}

export interface CreateCharacterCreationGate {
  availability: StartFlowServerAvailability | null;
  canCreate: boolean;
  blocker: string | null;
  reason: string;
}

export interface CreateCharacterServerDetails {
  title: string;
  description: string;
  badges: CreateCharacterServerBadge[];
  summaryRows: CreateCharacterSummaryRow[];
  sideRows: CreateCharacterSummaryRow[];
  footerTitle: string;
  footerCopy: string;
  ctaLabel: string;
  canContinue: boolean;
  disabledReason: string | null;
}
