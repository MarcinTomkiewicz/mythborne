import {
  CreateCombatGameReportInput,
  CreatedCombatGameReport,
} from '../domain/reports/game-report.model';
import {
  CreateGameReportFromCombatResultRpcArgs,
  CreateGameReportFromCombatResultRpcRow,
} from '../types/game-report-rpc.types';
import { trimText } from './normalize-text';

export function toCreateGameReportFromCombatResultRpcArgs(
  input: CreateCombatGameReportInput,
): CreateGameReportFromCombatResultRpcArgs {
  const args: CreateGameReportFromCombatResultRpcArgs = {
    p_combat_result_id: requiredText(input.combatResultId, 'combatResultId'),
  };

  const ownerHeroId = trimText(input.ownerHeroId);
  const reason = trimText(input.reason);
  const requestId = trimText(input.requestId);

  if (ownerHeroId) {
    args.p_owner_hero_id = ownerHeroId;
  }

  if (reason) {
    args.p_reason = reason;
  }

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function mapCreatedCombatGameReport(
  row: CreateGameReportFromCombatResultRpcRow,
): CreatedCombatGameReport {
  return {
    reportId: requiredText(row.report_id, 'reportId'),
    reportTypeKey: requiredText(row.report_type_key, 'reportTypeKey'),
    publicToken: requiredText(row.public_token, 'publicToken'),
    combatResultId: requiredText(row.combat_result_id, 'combatResultId'),
    serverId: requiredText(row.server_id, 'serverId'),
    participantsCreated: row.participants_created,
    accessRowsCreated: row.access_rows_created,
    auditLogId: requiredText(row.audit_log_id, 'auditLogId'),
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for combat game report creation.`);
  }

  return normalized;
}
