import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CreateModerationActionInput,
  ModerationAction,
  ModerationActionHistoryFilter,
  ModerationActionType,
} from '../../domain/moderation/moderation-action.model';
import { FilterOperator } from '../../enums/filter-operators';
import {
  CreatedModerationActionRpcRow,
  ModerationActionRpcRow,
} from '../../types/moderation-action-rpc.types';
import { Row } from '../../types/supabase.types';
import {
  mapModerationAction,
  mapModerationActionType,
  toCanApplyLocalModerationActionRpcArgs,
  toCreateModerationActionRpcArgs,
  toGetVisibleModerationActionsRpcArgs,
} from '../../utils/moderation-action';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ModerationActions {
  private readonly backend = inject(Backend);

  getActionTypes(): Observable<ModerationActionType[]> {
    return this.backend
      .getAll<Row<'moderation_action_types'>>({
        table: TABLES.moderation_action_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapModerationActionType)));
  }

  canApplyLocalAction(serverId: string, scopeKey: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.can_apply_local_moderation_action,
      toCanApplyLocalModerationActionRpcArgs(serverId, scopeKey),
    );
  }

  createAction(input: CreateModerationActionInput): Observable<ModerationAction> {
    return this.backend
      .rpc<CreatedModerationActionRpcRow>(
        RPC.create_moderation_action,
        toCreateModerationActionRpcArgs(input),
      )
      .pipe(map((row) => mapModerationAction(row)));
  }

  getVisibleActions(filter: ModerationActionHistoryFilter): Observable<ModerationAction[]> {
    return this.backend
      .rpc<ModerationActionRpcRow[]>(
        RPC.get_visible_moderation_actions,
        toGetVisibleModerationActionsRpcArgs(filter),
      )
      .pipe(map((rows) => rows.map(mapModerationAction)));
  }
}
