import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
  CombatResultDetailReadModel,
  CombatTimingInput,
} from '../../domain/combat/combat-live.model';
import {
  GetCombatResolutionPreviewRpcRow,
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcRow,
  StartManualCombatSessionRpcRow,
  SubmitCombatPlayerActionRpcRow,
} from '../../types/combat-live-rpc.types';
import {
  firstCombatResolutionPreviewRow,
  firstCombatLiveStateRow,
  firstCombatResultDetailRow,
  mapCombatResolutionPreview,
  mapCombatLiveState,
  mapCombatResultDetail,
  toGetCombatResolutionPreviewRpcArgs,
  toGetCombatLiveStateRpcArgs,
  toGetCombatResultDetailRpcArgs,
  toStartManualCombatSessionRpcArgs,
  toSubmitCombatPlayerActionRpcArgs,
} from '../../utils/combat-live-mappers';
import { Backend } from '../backend/backend';

@Injectable()
export class ExplorationLiveCombat {
  private readonly backend = inject(Backend);

  getResolutionPreview(input: {
    challengeAttemptId: string;
    localeKey?: string | null;
  }): Observable<CombatResolutionPreviewReadModel> {
    return this.backend
      .rpc<GetCombatResolutionPreviewRpcRow[]>(
        RPC.get_combat_resolution_preview,
        toGetCombatResolutionPreviewRpcArgs({
          sourceEntityType: 'exploration_challenge_attempt',
          sourceEntityId: input.challengeAttemptId,
          localeKey: input.localeKey ?? 'pl',
        }),
      )
      .pipe(
        map(firstCombatResolutionPreviewRow),
        map(mapCombatResolutionPreview),
      );
  }

  startManualSession(input: {
    challengeAttemptId: string;
    requestId?: string | null;
  }): Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<StartManualCombatSessionRpcRow[]>(
        RPC.start_manual_combat_session,
        toStartManualCombatSessionRpcArgs({
          sourceEntityType: 'exploration_challenge_attempt',
          sourceEntityId: input.challengeAttemptId,
          requestId: input.requestId,
        }),
      )
      .pipe(
        map(firstCombatLiveStateRow),
        map(mapCombatLiveState),
        switchMap((state) =>
          this.getState({
            sessionId: state.sessionId,
            sinceEventIndex: null,
          }),
        ),
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
