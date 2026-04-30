import { PlayerAbuseReportTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  PlayerAbuseReportLinkedCaseView,
  PlayerAbuseReportListItem,
} from '../domain/anti-abuse/player-abuse-report-view.model';
import { Row } from '../types/supabase.types';
import {
  antiAbuseCaseStatusLabel,
  playerAbuseReportStatusLabel,
} from './anti-abuse-decision-display';

export function mapPlayerAbuseReportListItem(
  row: Row<'player_abuse_reports'>,
  links: {
    reportTypes: readonly PlayerAbuseReportTypeEntry[];
    linkedCase: PlayerAbuseReportLinkedCaseView | null;
  },
): PlayerAbuseReportListItem {
  const reportType = links.reportTypes.find((entry) => entry.key === row.report_type_key);

  return {
    id: row.id,
    serverId: row.server_id,
    reportTypeKey: row.report_type_key,
    reportTypeLabel: reportType?.label ?? row.report_type_key,
    title: row.title,
    description: row.description,
    status: row.status,
    statusLabel: playerAbuseReportStatusLabel(row.status),
    playerStatusMessage: row.player_notes,
    accusedHeroId: row.accused_hero_id,
    relatedItemId: row.related_item_id,
    relatedTradeId: row.related_trade_id,
    relatedTradeReference: row.related_trade_reference,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    linkedCase: links.linkedCase,
  };
}

export function mapPlayerAbuseReportLinkedCase(
  row: Row<'anti_abuse_cases'>,
): PlayerAbuseReportLinkedCaseView {
  return {
    id: row.id,
    status: row.status,
    statusLabel: antiAbuseCaseStatusLabel(row.status),
    resolvedAt: row.resolved_at,
    updatedAt: row.updated_at,
  };
}
