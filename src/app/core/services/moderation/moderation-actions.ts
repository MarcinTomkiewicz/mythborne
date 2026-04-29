import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CreateModerationActionInput,
  FullHeroModerationHistoryFilter,
  FullUserModerationHistoryFilter,
  ModerationAction,
  ModerationActionHistoryFilter,
  ModerationHeroTarget,
  ModerationTargetSearchInput,
  ModerationActionType,
  ModerationUserTarget,
} from '../../domain/moderation/moderation-action.model';
import { FilterOperator } from '../../enums/filter-operators';
import {
  CreatedModerationActionRpcRow,
  FullHeroModerationHistoryRpcRow,
  FullUserModerationHistoryRpcRow,
  ModerationActionRpcRow,
  SearchModerationHeroTargetRpcRow,
  SearchModerationUserTargetRpcRow,
} from '../../types/moderation-action-rpc.types';
import { Row } from '../../types/supabase.types';
import {
  mapModerationAction,
  mapModerationHeroTarget,
  mapModerationActionType,
  mapModerationUserTarget,
  toCanApplyLocalModerationActionRpcArgs,
  toCanReadFullModerationHistoryRpcArgs,
  toCanSearchModerationTargetsRpcArgs,
  toCreateModerationActionRpcArgs,
  toGetFullHeroModerationHistoryRpcArgs,
  toGetFullUserModerationHistoryRpcArgs,
  toGetVisibleModerationActionsRpcArgs,
  toSearchModerationHeroTargetsRpcArgs,
  toSearchModerationUserTargetsRpcArgs,
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

  canReadFullHistory(serverId: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.can_read_full_moderation_history,
      toCanReadFullModerationHistoryRpcArgs(serverId),
    );
  }

  canSearchTargets(serverId: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.can_search_moderation_targets,
      toCanSearchModerationTargetsRpcArgs(serverId),
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

  getFullUserHistory(
    filter: FullUserModerationHistoryFilter,
  ): Observable<ModerationAction[]> {
    return this.backend
      .rpc<FullUserModerationHistoryRpcRow[]>(
        RPC.get_full_user_moderation_history,
        toGetFullUserModerationHistoryRpcArgs(filter),
      )
      .pipe(map((rows) => rows.map(mapModerationAction)));
  }

  getFullHeroHistory(
    filter: FullHeroModerationHistoryFilter,
  ): Observable<ModerationAction[]> {
    return this.backend
      .rpc<FullHeroModerationHistoryRpcRow[]>(
        RPC.get_full_hero_moderation_history,
        toGetFullHeroModerationHistoryRpcArgs(filter),
      )
      .pipe(map((rows) => rows.map(mapModerationAction)));
  }

  searchUserTargets(
    input: ModerationTargetSearchInput,
  ): Observable<ModerationUserTarget[]> {
    return this.backend
      .rpc<SearchModerationUserTargetRpcRow[]>(
        RPC.search_moderation_user_targets,
        toSearchModerationUserTargetsRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapModerationUserTarget)));
  }

  searchHeroTargets(
    input: ModerationTargetSearchInput,
  ): Observable<ModerationHeroTarget[]> {
    return this.backend
      .rpc<SearchModerationHeroTargetRpcRow[]>(
        RPC.search_moderation_hero_targets,
        toSearchModerationHeroTargetsRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapModerationHeroTarget)));
  }
}
