import {
  AddAntiAbuseSanctionItemInput,
  AntiAbuseCaseDecisionInput,
  AntiAbuseSanctionStatusInput,
  CharacterPointPenaltyStatusInput,
  CreateAntiAbuseSanctionInput,
  CreateCharacterPointPenaltyInput,
  PlayerAbuseReportDecisionInput,
  PlayerRelationshipDeclarationDecisionInput,
} from '../domain/anti-abuse/anti-abuse-decision.model';
import {
  AddAntiAbuseSanctionItemRpcArgs,
  CanManageAntiAbuseRpcArgs,
  CreateAntiAbuseSanctionRpcArgs,
  CreateCharacterPointPenaltyForSanctionRpcArgs,
  SetAntiAbuseCaseDecisionRpcArgs,
  SetAntiAbuseSanctionStatusRpcArgs,
  SetCharacterPointPenaltyStatusRpcArgs,
  SetPlayerAbuseReportDecisionRpcArgs,
  SetPlayerRelationshipDeclarationDecisionRpcArgs,
} from '../types/anti-abuse-decision-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toCanManageAntiAbuseRpcArgs(
  serverId: string,
): CanManageAntiAbuseRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
  };
}

export function toSetAntiAbuseCaseDecisionRpcArgs(
  input: AntiAbuseCaseDecisionInput,
): SetAntiAbuseCaseDecisionRpcArgs {
  const args: SetAntiAbuseCaseDecisionRpcArgs = {
    p_case_id: requiredText(input.caseId, 'caseId'),
    p_status: input.status,
    p_status_reason: requiredText(input.statusReason, 'statusReason'),
  };

  addOptionalText(args, 'p_verdict_reason', input.verdictReason);
  addOptionalText(args, 'p_no_sanction_reason', input.noSanctionReason);
  addOptionalText(args, 'p_operator_notes', input.operatorNotes);

  if (input.verdict) {
    args.p_verdict = input.verdict;
  }

  if (input.sanctionRequired !== null && input.sanctionRequired !== undefined) {
    args.p_sanction_required = input.sanctionRequired;
  }

  return args;
}

export function toSetPlayerRelationshipDeclarationDecisionRpcArgs(
  input: PlayerRelationshipDeclarationDecisionInput,
): SetPlayerRelationshipDeclarationDecisionRpcArgs {
  const args: SetPlayerRelationshipDeclarationDecisionRpcArgs = {
    p_declaration_id: requiredText(input.declarationId, 'declarationId'),
    p_status: input.status,
    p_status_reason: requiredText(input.statusReason, 'statusReason'),
  };

  addOptionalText(args, 'p_admin_notes', input.adminNotes);
  addOptionalText(args, 'p_player_notes', input.playerNotes);

  return args;
}

export function toSetPlayerAbuseReportDecisionRpcArgs(
  input: PlayerAbuseReportDecisionInput,
): SetPlayerAbuseReportDecisionRpcArgs {
  const args: SetPlayerAbuseReportDecisionRpcArgs = {
    p_report_id: requiredText(input.reportId, 'reportId'),
    p_status: input.status,
    p_status_reason: requiredText(input.statusReason, 'statusReason'),
  };

  addOptionalText(args, 'p_case_id', input.caseId);
  addOptionalText(args, 'p_admin_notes', input.adminNotes);
  addOptionalText(args, 'p_player_notes', input.playerNotes);

  return args;
}

export function toCreateAntiAbuseSanctionRpcArgs(
  input: CreateAntiAbuseSanctionInput,
): CreateAntiAbuseSanctionRpcArgs {
  const args: CreateAntiAbuseSanctionRpcArgs = {
    p_case_id: requiredText(input.caseId, 'caseId'),
    p_sanction_type_key: requiredText(input.sanctionTypeKey, 'sanctionTypeKey'),
    p_target_hero_id: requiredText(input.targetHeroId, 'targetHeroId'),
    p_target_user_id: requiredText(input.targetUserId, 'targetUserId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_operator_notes', input.operatorNotes);
  addOptionalText(args, 'p_source_hero_id', input.sourceHeroId);
  addOptionalText(args, 'p_destination_hero_id', input.destinationHeroId);
  addOptionalNumber(args, 'p_amount_character_points', input.amountCharacterPoints);
  addOptionalNumber(args, 'p_duration_days', input.durationDays);

  return args;
}

export function toSetAntiAbuseSanctionStatusRpcArgs(
  input: AntiAbuseSanctionStatusInput,
): SetAntiAbuseSanctionStatusRpcArgs {
  const args: SetAntiAbuseSanctionStatusRpcArgs = {
    p_sanction_id: requiredText(input.sanctionId, 'sanctionId'),
    p_status: input.status,
    p_status_reason: requiredText(input.statusReason, 'statusReason'),
  };

  return args;
}

export function toCreateCharacterPointPenaltyForSanctionRpcArgs(
  input: CreateCharacterPointPenaltyInput,
): CreateCharacterPointPenaltyForSanctionRpcArgs {
  const args: CreateCharacterPointPenaltyForSanctionRpcArgs = {
    p_sanction_id: requiredText(input.sanctionId, 'sanctionId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_operator_notes', input.operatorNotes);

  return args;
}

export function toSetCharacterPointPenaltyStatusRpcArgs(
  input: CharacterPointPenaltyStatusInput,
): SetCharacterPointPenaltyStatusRpcArgs {
  const args: SetCharacterPointPenaltyStatusRpcArgs = {
    p_penalty_id: requiredText(input.penaltyId, 'penaltyId'),
    p_status: input.status,
    p_status_reason: requiredText(input.statusReason, 'statusReason'),
  };

  return args;
}

export function toAddAntiAbuseSanctionItemRpcArgs(
  input: AddAntiAbuseSanctionItemInput,
): AddAntiAbuseSanctionItemRpcArgs {
  const args: AddAntiAbuseSanctionItemRpcArgs = {
    p_sanction_id: requiredText(input.sanctionId, 'sanctionId'),
    p_item_id: requiredText(input.itemId, 'itemId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_operator_notes', input.operatorNotes);
  addOptionalText(args, 'p_source_hero_id', input.sourceHeroId);
  addOptionalText(args, 'p_destination_hero_id', input.destinationHeroId);

  return args;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for anti-abuse decision workflow.`);
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

function addOptionalNumber<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Number(value);

  if (Number.isFinite(normalized)) {
    target[key] = normalized as T[K];
  }
}
