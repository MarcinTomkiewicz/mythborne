import {
  AntiAbuseCaseStatus,
  PlayerAbuseReportStatus,
} from './anti-abuse-decision.model';

export interface PlayerAbuseReportLinkedCaseView {
  id: string;
  status: AntiAbuseCaseStatus;
  statusLabel: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface PlayerAbuseReportListItem {
  id: string;
  serverId: string;
  reportTypeKey: string;
  reportTypeLabel: string;
  title: string;
  description: string;
  status: PlayerAbuseReportStatus;
  statusLabel: string;
  playerStatusMessage: string | null;
  accusedHeroId: string | null;
  relatedItemId: string | null;
  relatedTradeId: string | null;
  relatedTradeReference: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  linkedCase: PlayerAbuseReportLinkedCaseView | null;
}

export interface PlayerAbuseReportListInput {
  serverId: string;
  heroId: string;
  userId: string;
}
