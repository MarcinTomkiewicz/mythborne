import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CombatLiveStateReadModel,
  CombatResultDetailReadModel,
  CombatTimingInput,
} from '../../domain/combat/combat-live.model';
import {
  EnsureExplorationCombatSessionRpcRow,
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcRow,
  SubmitCombatPlayerActionRpcRow,
} from '../../types/combat-live-rpc.types';
import {
  firstCombatLiveStateRow,
  firstCombatResultDetailRow,
  mapCombatLiveState,
  mapCombatResultDetail,
  toEnsureExplorationCombatSessionRpcArgs,
  toGetCombatLiveStateRpcArgs,
  toGetCombatResultDetailRpcArgs,
  toSubmitCombatPlayerActionRpcArgs,
} from '../../utils/combat-live-mappers';
import { Backend } from '../backend/backend';

@Injectable()
export class ExplorationLiveCombat {
  private readonly backend = inject(Backend);

  ensureSession(input: {
    challengeAttemptId: string;
    requestId?: string | null;
  }): Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<EnsureExplorationCombatSessionRpcRow[]>(
        RPC.ensure_exploration_combat_session,
        toEnsureExplorationCombatSessionRpcArgs(input),
      )
      .pipe(
        map(firstCombatLiveStateRow),
        map(mapCombatLiveState),
      );
  }

  getState(input: {
    sessionId: string;
    sinceEventIndex?: number | null;
  }): Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<GetCombatLiveStateRpcRow[]>(
        RPC.get_combat_live_state,
        toGetCombatLiveStateRpcArgs(input),
      )
      .pipe(
        map(firstCombatLiveStateRow),
        map(mapCombatLiveState),
      );
  }

  submitPlayerAction(input: {
    sessionId: string;
    timingInput: CombatTimingInput;
    requestId: string;
  }): Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<SubmitCombatPlayerActionRpcRow[]>(
        RPC.submit_combat_player_action,
        toSubmitCombatPlayerActionRpcArgs(input),
      )
      .pipe(
        map(firstCombatLiveStateRow),
        map(mapCombatLiveState),
      );
  }

  getResultDetail(input: {
    combatResultId: string;
  }): Observable<CombatResultDetailReadModel> {
    return this.backend
      .rpc<GetCombatResultDetailRpcRow[]>(
        RPC.get_combat_result_detail,
        toGetCombatResultDetailRpcArgs(input),
      )
      .pipe(
        map(firstCombatResultDetailRow),
        map(mapCombatResultDetail),
      );
  }
}
