import {
  AntiAbuseCaseStatus,
  AntiAbuseSanctionStatus,
  PlayerAbuseReportStatus,
  PlayerRelationshipDeclarationStatus,
} from '../domain/anti-abuse/anti-abuse-decision.model';

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
