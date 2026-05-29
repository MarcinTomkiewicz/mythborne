import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CombatAutoResolveResultReadModel,
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
} from '../../domain/combat/combat-live.model';
import {
  AutoResolveCombatSessionRpcRow,
  FinalizeCombatSourceResultRpcRow,
  GetCombatResolutionPreviewRpcRow,
  StartManualCombatSessionRpcRow,
  SubmitCombatPlayerActionRpcRow,
} from '../../types/combat-live-rpc.types';
import {
  firstAutoResolveCombatSessionRow,
  firstCombatLiveStateRow,
  firstCombatResolutionPreviewRow,
  firstFinalizeCombatSourceResultRow,
  mapCombatAutoResolveResult,
  mapCombatLiveState,
  mapCombatResolutionPreview,
  toAutoResolveCombatSessionRpcArgs,
  toFinalizeCombatSourceResultRpcArgs,
  toGetCombatResolutionPreviewRpcArgs,
  toStartManualCombatSessionRpcArgs,
  toSubmitCombatPlayerActionRpcArgs,
} from '../../utils/combat-live-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class CombatSessions {
  private readonly backend = inject(Backend);

  getCombatResolutionPreview(input: { sourceEntityType: string; sourceEntityId: string; localeKey?: string | null }):
    Observable<CombatResolutionPreviewReadModel> {
    return this.backend
      .rpc<GetCombatResolutionPreviewRpcRow[]>(
        RPC.get_combat_resolution_preview,
        toGetCombatResolutionPreviewRpcArgs(input),
      )
      .pipe(map(firstCombatResolutionPreviewRow), map(mapCombatResolutionPreview));
  }

  startManualCombatSession(input: { sourceEntityType: string; sourceEntityId: string; requestId: string }):
    Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<StartManualCombatSessionRpcRow[]>(
        RPC.start_manual_combat_session,
        toStartManualCombatSessionRpcArgs(input),
      )
      .pipe(map(firstCombatLiveStateRow), map(mapCombatLiveState));
  }

  submitCombatPlayerAction(input: { combatSessionId: string; positionPercent: number; requestId: string }):
    Observable<CombatLiveStateReadModel> {
    return this.backend
      .rpc<SubmitCombatPlayerActionRpcRow[]>(
        RPC.submit_combat_player_action,
        toSubmitCombatPlayerActionRpcArgs({
          sessionId: input.combatSessionId,
          timingInput: { positionPercent: input.positionPercent },
          requestId: input.requestId,
        }),
      )
      .pipe(map(firstCombatLiveStateRow), map(mapCombatLiveState));
  }

  autoResolveCombatSession(input: { sourceEntityType: string; sourceEntityId: string; requestId: string }):
    Observable<CombatAutoResolveResultReadModel> {
    return this.backend
      .rpc<AutoResolveCombatSessionRpcRow[]>(
        RPC.auto_resolve_combat_session,
        toAutoResolveCombatSessionRpcArgs(input),
      )
      .pipe(
        map(firstAutoResolveCombatSessionRow),
        map(mapCombatAutoResolveResult),
      );
  }

  finalizeCombatSourceResult(input: { combatSessionId: string; requestId: string; resolutionMode?: string | null }):
    Observable<CombatAutoResolveResultReadModel> {
    return this.backend
      .rpc<FinalizeCombatSourceResultRpcRow[]>(
        RPC.finalize_combat_source_result,
        toFinalizeCombatSourceResultRpcArgs({
          sessionId: input.combatSessionId,
          requestId: input.requestId,
          resolutionMode: input.resolutionMode,
        }),
      )
      .pipe(
        map(firstFinalizeCombatSourceResultRow),
        map(mapCombatAutoResolveResult),
      );
  }
}
