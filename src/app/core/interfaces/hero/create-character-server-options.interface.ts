import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import { AccountEntrySummaryRow } from '../account-entry-summary-row.interface';

export interface CreateCharacterServerOption {
  id: string;
  label: string;
  availability: StartFlowServerAvailability;
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
  summaryRows: AccountEntrySummaryRow[];
  sideRows: AccountEntrySummaryRow[];
  footerTitle: string;
  footerCopy: string;
  ctaLabel: string;
  canContinue: boolean;
  disabledReason: string | null;
}
