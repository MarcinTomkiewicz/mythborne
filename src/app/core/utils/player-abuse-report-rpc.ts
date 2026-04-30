import {
  CreatePlayerAbuseReportInput,
  CreatedPlayerAbuseReport,
} from '../domain/anti-abuse/player-abuse-report-submit.model';
import {
  CreatePlayerAbuseReportRpcArgs,
  CreatePlayerAbuseReportRpcRow,
} from '../types/anti-abuse-decision-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toCreatePlayerAbuseReportRpcArgs(
  input: CreatePlayerAbuseReportInput,
): CreatePlayerAbuseReportRpcArgs {
  const args: CreatePlayerAbuseReportRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_report_type_key: requiredText(input.reportTypeKey, 'reportTypeKey'),
    p_title: requiredText(input.title, 'title'),
    p_description: requiredText(input.description, 'description'),
    p_reporting_hero_id: requiredText(input.reportingHeroId, 'reportingHeroId'),
  };

  addOptionalText(args, 'p_accused_hero_id', input.accusedHeroId);
  addOptionalText(args, 'p_related_item_id', input.relatedItemId);
  addOptionalText(args, 'p_related_trade_id', input.relatedTradeId);
  addOptionalText(args, 'p_related_trade_reference', input.relatedTradeReference);

  return args;
}

export function mapCreatedPlayerAbuseReport(
  row: CreatePlayerAbuseReportRpcRow,
): CreatedPlayerAbuseReport {
  return {
    reportId: requiredText(row.report_id, 'reportId'),
    caseId: requiredText(row.case_id, 'caseId'),
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for abuse report submission.`);
  }

  return normalized;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}
