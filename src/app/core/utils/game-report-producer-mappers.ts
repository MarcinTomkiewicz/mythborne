import {
  AttachedRewardDropItemReference,
  AttachRewardDropItemToReportInput,
  CreateCombatGameReportInput,
  CreatedCombatGameReport,
} from '../domain/reports/game-report.model';
import {
  AttachRewardDropItemToGameReportRpcArgs,
  AttachRewardDropItemToGameReportRpcRow,
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
    auditLogId: trimText(row.audit_log_id) || null,
  };
}

export function toAttachRewardDropItemToGameReportRpcArgs(
  input: AttachRewardDropItemToReportInput,
): AttachRewardDropItemToGameReportRpcArgs {
  const args: AttachRewardDropItemToGameReportRpcArgs = {
    p_report_id: requiredText(
      input.reportId,
      'reportId',
      'game report item attachment',
    ),
    p_item_id: requiredText(
      input.itemId,
      'itemId',
      'game report item attachment',
    ),
  };

  const sortOrder = optionalInteger(input.sortOrder, 'sortOrder');
  const reason = trimText(input.reason);
  const requestId = trimText(input.requestId);

  if (sortOrder !== null) {
    args.p_sort_order = sortOrder;
  }

  if (reason) {
    args.p_reason = reason;
  }

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function mapAttachedRewardDropItemReference(
  row: AttachRewardDropItemToGameReportRpcRow,
): AttachedRewardDropItemReference {
  return {
    reportId: requiredText(row.report_id, 'reportId'),
    itemReferenceId: requiredText(row.item_reference_id, 'itemReferenceId'),
    sourceItemId: requiredText(row.source_item_id, 'sourceItemId'),
    displayName: requiredText(row.display_name_fallback, 'displayName'),
    qualityKey: requiredText(row.quality_key, 'qualityKey'),
    sortOrder: row.sort_order,
    auditLogId: requiredText(row.audit_log_id, 'auditLogId'),
  };
}

function requiredText(
  value: string | null | undefined,
  field: string,
  operation = 'combat game report creation',
): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for ${operation}.`);
  }

  return normalized;
}

function optionalInteger(
  value: number | null | undefined,
  field: string,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer for game report item attachment.`);
  }

  return value;
}
