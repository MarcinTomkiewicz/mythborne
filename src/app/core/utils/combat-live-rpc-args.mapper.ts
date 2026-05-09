import { CombatTimingInput } from '../domain/combat/combat-live.model';
import {
  EnsureExplorationCombatSessionRpcArgs,
  EnsureExplorationCombatSessionRpcRow,
  GetCombatLiveStateRpcArgs,
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcArgs,
  GetCombatResultDetailRpcRow,
  SubmitCombatPlayerActionRpcArgs,
  SubmitCombatPlayerActionRpcRow,
} from '../types/combat-live-rpc.types';
import {
  requiredTrimmedText,
  trimToNull,
} from './normalize-text';
import {
  clampPercent,
  optionalNonNegativeInteger,
} from './number';

export type LiveStateRpcRow =
  | EnsureExplorationCombatSessionRpcRow
  | GetCombatLiveStateRpcRow
  | SubmitCombatPlayerActionRpcRow;

const LIVE_COMBAT_WORKFLOW_CONTEXT = 'live combat workflow';

export function toEnsureExplorationCombatSessionRpcArgs(input: {
  challengeAttemptId: string | null | undefined;
  requestId?: string | null;
}): EnsureExplorationCombatSessionRpcArgs {
  const args: EnsureExplorationCombatSessionRpcArgs = {
    p_challenge_attempt_id: requiredTrimmedText(
      input.challengeAttemptId,
      'challengeAttemptId',
      LIVE_COMBAT_WORKFLOW_CONTEXT,
    ),
  };
  const requestId = trimToNull(input.requestId);

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function toGetCombatLiveStateRpcArgs(input: {
  sessionId: string | null | undefined;
  sinceEventIndex?: number | null;
}): GetCombatLiveStateRpcArgs {
  const args: GetCombatLiveStateRpcArgs = {
    p_session_id: requiredTrimmedText(
      input.sessionId,
      'sessionId',
      LIVE_COMBAT_WORKFLOW_CONTEXT,
    ),
  };
  const since = optionalNonNegativeInteger(input.sinceEventIndex);

  if (since !== null) {
    args.p_since_event_index = since;
  }

  return args;
}

export function toSubmitCombatPlayerActionRpcArgs(input: {
  sessionId: string | null | undefined;
  timingInput: CombatTimingInput;
  requestId: string | null | undefined;
}): SubmitCombatPlayerActionRpcArgs {
  return {
    p_session_id: requiredTrimmedText(
      input.sessionId,
      'sessionId',
      LIVE_COMBAT_WORKFLOW_CONTEXT,
    ),
    p_timing_input_json: {
      positionPercent: clampPercent(input.timingInput.positionPercent),
    },
    p_request_id: requiredTrimmedText(
      input.requestId,
      'requestId',
      LIVE_COMBAT_WORKFLOW_CONTEXT,
    ),
  };
}

export function toGetCombatResultDetailRpcArgs(input: {
  combatResultId: string | null | undefined;
}): GetCombatResultDetailRpcArgs {
  return {
    p_combat_result_id: requiredTrimmedText(
      input.combatResultId,
      'combatResultId',
      LIVE_COMBAT_WORKFLOW_CONTEXT,
    ),
  };
}

export function firstCombatLiveStateRow<T extends LiveStateRpcRow>(
  rows: readonly T[],
): T {
  const row = rows[0];

  if (!row) {
    throw new Error('DB nie zwróciła stanu sesji walki.');
  }

  return row;
}

export function firstCombatResultDetailRow(
  rows: readonly GetCombatResultDetailRpcRow[],
): GetCombatResultDetailRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('DB nie zwróciła szczegółów wyniku walki.');
  }

  return row;
}
