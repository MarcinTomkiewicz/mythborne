import {
  PvpAddRemainingActionsInput,
  PvpAddRemainingActionsResult,
  PvpAttackTravelTimerSkipInput,
  PvpAttackTravelTimerSkipResult,
} from '../domain/pvp/pvp-debug.model';
import {
  AddHeroRemainingActionsRpcArgs,
  AddHeroRemainingActionsRpcRow,
  SkipActivePvpAttackTravelTimerRpcArgs,
  SkipActivePvpAttackTravelTimerRpcRow,
} from '../types/pvp-debug-rpc.types';
import { positiveInteger } from './number';
import { requiredTrimmedText, trimToNull } from './normalize-text';
import { firstRpcRow } from './rpc-result';

const PVP_DEBUG_RPC_CONTEXT = 'PvP sandbox debug RPC';

export function toPvpAddRemainingActionsRpcArgs(
  input: PvpAddRemainingActionsInput,
): AddHeroRemainingActionsRpcArgs {
  const args: AddHeroRemainingActionsRpcArgs = {
    p_server_id: requiredTrimmedText(input.serverId, 'serverId', PVP_DEBUG_RPC_CONTEXT),
    p_hero_id: requiredTrimmedText(input.heroId, 'heroId', PVP_DEBUG_RPC_CONTEXT),
    p_action_kind: 'attack',
    p_amount: positiveInteger(input.amount),
    p_reason: requiredTrimmedText(input.reason, 'reason', PVP_DEBUG_RPC_CONTEXT),
  };
  const actionDate = trimToNull(input.actionDate);

  if (actionDate) {
    args.p_action_date = actionDate;
  }

  return args;
}

export function toSkipActivePvpAttackTravelTimerRpcArgs(
  heroId: string,
  input: PvpAttackTravelTimerSkipInput,
): SkipActivePvpAttackTravelTimerRpcArgs {
  return {
    p_hero_id: requiredTrimmedText(heroId, 'heroId', PVP_DEBUG_RPC_CONTEXT),
    p_request_id: requiredTrimmedText(input.requestId, 'requestId', PVP_DEBUG_RPC_CONTEXT),
  };
}

export function firstAddHeroRemainingActionsRow(
  rows: readonly AddHeroRemainingActionsRpcRow[],
): AddHeroRemainingActionsRpcRow {
  return firstRpcRow(rows, 'add_hero_remaining_actions');
}

export function firstSkipActivePvpAttackTravelTimerRow(
  rows: readonly SkipActivePvpAttackTravelTimerRpcRow[],
): SkipActivePvpAttackTravelTimerRpcRow {
  return firstRpcRow(rows, 'skip_active_pvp_attack_travel_timer');
}

export function mapPvpAddRemainingActionsResult(
  row: AddHeroRemainingActionsRpcRow,
): PvpAddRemainingActionsResult {
  return {
    serverId: row.server_id,
    heroId: row.hero_id,
    actionKind: row.action_kind,
    actionDate: row.action_date,
    remainingCount: row.remaining_count,
    counterId: row.counter_id,
  };
}

export function mapPvpAttackTravelTimerSkipResult(
  row: SkipActivePvpAttackTravelTimerRpcRow,
): PvpAttackTravelTimerSkipResult {
  return {
    pvpActionId: row.pvp_action_id,
    requestId: row.request_id,
    canEnterManualResolution: row.can_enter_manual_resolution,
    arrivesAt: row.arrives_at,
    manualDeadlineAt: row.manual_deadline_at,
    previousArrivesAt: row.previous_arrives_at,
    previousManualDeadlineAt: row.previous_manual_deadline_at,
  };
}
