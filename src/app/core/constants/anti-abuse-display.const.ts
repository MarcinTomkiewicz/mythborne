import {
  AntiAbuseCaseSource,
} from '../domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
  AntiAbuseSanctionStatus,
  PlayerAbuseReportStatus,
  PlayerRelationshipDeclarationStatus,
} from '../domain/anti-abuse/anti-abuse-decision.model';
import { SelectOption } from '../types/select-option.types';

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS: Record<
  AntiAbuseCaseStatus,
  string
> = {
  open: 'Open',
  in_review: 'In review',
  waiting_for_player: 'Waiting for player',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const ANTI_ABUSE_CASE_SOURCE_FALLBACK_LABELS: Record<
  AntiAbuseCaseSource,
  string
> = {
  system_signal: 'System signal',
  player_report: 'Player report',
  manual: 'Manual',
};

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const ANTI_ABUSE_CASE_VERDICT_FALLBACK_LABELS: Record<
  AntiAbuseCaseVerdict,
  string
> = {
  no_abuse: 'No abuse',
  insufficient_evidence: 'Insufficient evidence',
  abuse_confirmed: 'Abuse confirmed',
  resolved_by_voluntary_return: 'Voluntary return',
};

export const ANTI_ABUSE_CASE_SOURCE_OPTIONS: SelectOption<AntiAbuseCaseSource>[] =
  Object.entries(ANTI_ABUSE_CASE_SOURCE_FALLBACK_LABELS).map(([value, label]) => ({
    label,
    value: value as AntiAbuseCaseSource,
  }));

export const ANTI_ABUSE_CASE_VERDICT_OPTIONS: SelectOption<AntiAbuseCaseVerdict>[] =
  Object.entries(ANTI_ABUSE_CASE_VERDICT_FALLBACK_LABELS).map(([value, label]) => ({
    label,
    value: value as AntiAbuseCaseVerdict,
  }));

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const ANTI_ABUSE_SANCTION_STATUS_FALLBACK_LABELS: Record<
  AntiAbuseSanctionStatus,
  string
> = {
  pending: 'Pending',
  applied: 'Applied',
  completed: 'Completed',
  cancelled: 'Cancelled',
  forgiven: 'Forgiven',
  failed: 'Failed',
};

export const ANTI_ABUSE_SANCTION_STATUS_OPTIONS: SelectOption<AntiAbuseSanctionStatus>[] =
  Object.entries(ANTI_ABUSE_SANCTION_STATUS_FALLBACK_LABELS).map(
    ([value, label]) => ({ label, value: value as AntiAbuseSanctionStatus }),
  );

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const PLAYER_ABUSE_REPORT_STATUS_FALLBACK_LABELS: Record<
  PlayerAbuseReportStatus,
  string
> = {
  submitted: 'Submitted',
  linked_to_case: 'Linked to case',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
};

// Fallback enum labels only. Dictionary-backed type labels/descriptions come from DB.
export const PLAYER_RELATIONSHIP_DECLARATION_STATUS_FALLBACK_LABELS: Record<
  PlayerRelationshipDeclarationStatus,
  string
> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  revoked: 'Revoked',
  expired: 'Expired',
  completed: 'Completed',
};
