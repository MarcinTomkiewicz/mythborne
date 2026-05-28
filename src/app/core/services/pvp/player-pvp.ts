import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  HeroActiveRuntimeActivity,
  HeroPvpDailyAttackState,
  PvpActionStartResult,
  PvpAttackResult,
  PvpSpyResult,
  PvpTargetCandidate,
} from '../../domain/pvp/pvp.model';
import {
  GetMyPvpAttackResultRpcArgs,
  GetMyPvpAttackResultRpcRow,
  GetMyPvpSpyResultRpcArgs,
  GetMyPvpSpyResultRpcRow,
  GetHeroActiveRuntimeActivityRpcArgs,
  GetHeroActiveRuntimeActivityRpcRow,
  GetHeroPvpDailyAttackStateRpcArgs,
  GetHeroPvpDailyAttackStateRpcRow,
  GetPvpTargetCandidatesRpcArgs,
  GetPvpTargetCandidatesRpcRow,
  GetPvpVisibleAddressTargetOverlayRpcArgs,
  GetPvpVisibleAddressTargetOverlayRpcRow,
  PvpActionKindKey,
  StartPvpActionRpcArgs,
  StartPvpActionRpcRow,
} from '../../types/pvp-rpc.types';
import { PvpVisibleAddressTargetOverlayInput } from '../../types/vicinity.types';
import { trimText } from '../../utils/normalize-text';
import {
  mapPvpActionStartResult,
  mapPvpAttackResult,
  mapHeroPvpDailyAttackState,
  mapPvpSpyResult,
  mapPvpTargetCandidate,
  mapPvpVisibleAddressTargetOverlay,
} from '../../utils/pvp-mappers';
import { mapHeroActiveRuntimeActivity } from '../../utils/runtime-activity-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

const DEFAULT_PVP_TARGET_LIMIT = 50;

export interface PvpTargetCandidateFilters {
  districtCode: string | null;
  limit: number;
  offset: number;
  search: string | null;
}

export interface StartPvpActionInput {
  actionKind: PvpActionKindKey;
  targetHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlayerPvp {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getTargetCandidates(
    filters: Partial<PvpTargetCandidateFilters> = {},
  ): Observable<PvpTargetCandidate[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetPvpTargetCandidatesRpcArgs = {
          p_attacker_hero_id: context.heroId,
          p_district_code: nullableArgument(filters.districtCode),
          p_limit: filters.limit ?? DEFAULT_PVP_TARGET_LIMIT,
          p_offset: filters.offset ?? 0,
          p_search: nullableArgument(filters.search),
        };

        return this.backend.rpc<GetPvpTargetCandidatesRpcRow[]>(
          RPC.get_pvp_target_candidates,
          args,
        );
      }),
      map((rows) => rows.map(mapPvpTargetCandidate)),
    );
  }

  getDailyAttackState(): Observable<HeroPvpDailyAttackState> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroPvpDailyAttackStateRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<GetHeroPvpDailyAttackStateRpcRow[]>(
          RPC.get_hero_pvp_daily_attack_state,
          args,
        );
      }),
      map((rows) =>
        mapHeroPvpDailyAttackState(
          requiredSingleRow(rows, 'get_hero_pvp_daily_attack_state'),
        ),
      ),
    );
  }

  getVisibleAddressTargetOverlay(
    input: PvpVisibleAddressTargetOverlayInput,
  ): Observable<PvpTargetCandidate[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetPvpVisibleAddressTargetOverlayRpcArgs = {
          p_attacker_hero_id: context.heroId,
          p_district_code: requiredText(input.districtCode, 'districtCode'),
          p_from_address_number: requiredPositiveInteger(
            input.fromAddressNumber,
            'fromAddressNumber',
          ),
          p_to_address_number: requiredPositiveInteger(
            input.toAddressNumber,
            'toAddressNumber',
          ),
        };

        return this.backend.rpc<GetPvpVisibleAddressTargetOverlayRpcRow[]>(
          RPC.get_pvp_visible_address_target_overlay,
          args,
        );
      }),
      map((rows) => rows.map(mapPvpVisibleAddressTargetOverlay)),
    );
  }

  startAction(input: StartPvpActionInput): Observable<PvpActionStartResult> {
    const actionKind = requiredText(input.actionKind, 'actionKind');
    const targetHeroId = requiredText(input.targetHeroId, 'targetHeroId');
    const reason = nullableArgument(input.reason);
    const requestId = nullableArgument(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: StartPvpActionRpcArgs = {
          p_action_kind: actionKind,
          p_attacker_hero_id: context.heroId,
          p_reason: reason,
          p_request_id: requestId,
          p_target_hero_id: targetHeroId,
        };

        return this.backend.rpc<StartPvpActionRpcRow[]>(
          RPC.start_pvp_action,
          args,
        );
      }),
      map((rows) =>
        mapPvpActionStartResult(requiredSingleRow(rows, 'start_pvp_action')),
      ),
    );
  }

  getActiveRuntimeActivity(): Observable<HeroActiveRuntimeActivity | null> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroActiveRuntimeActivityRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<GetHeroActiveRuntimeActivityRpcRow[]>(
          RPC.get_hero_active_runtime_activity,
          args,
        );
      }),
      map((rows) => rows[0] ? mapHeroActiveRuntimeActivity(rows[0]) : null),
    );
  }

  getMySpyResult(spyResultId: string): Observable<PvpSpyResult> {
    const normalizedSpyResultId = requiredText(spyResultId, 'spyResultId');

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetMyPvpSpyResultRpcArgs = {
          p_hero_id: context.heroId,
          p_spy_result_id: normalizedSpyResultId,
        };

        return this.backend.rpc<GetMyPvpSpyResultRpcRow[]>(
          RPC.get_my_pvp_spy_result,
          args,
        );
      }),
      map((rows) =>
        mapPvpSpyResult(requiredSingleRow(rows, 'get_my_pvp_spy_result')),
      ),
    );
  }

  getMyAttackResult(attackResultId: string): Observable<PvpAttackResult> {
    const normalizedAttackResultId = requiredText(attackResultId, 'attackResultId');

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetMyPvpAttackResultRpcArgs = {
          p_attack_result_id: normalizedAttackResultId,
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<GetMyPvpAttackResultRpcRow[]>(
          RPC.get_my_pvp_attack_result,
          args,
        );
      }),
      map((rows) =>
        mapPvpAttackResult(requiredSingleRow(rows, 'get_my_pvp_attack_result')),
      ),
    );
  }
}

function requiredSingleRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no PvP row.`);
  }

  return row;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for PvP RPC.`);
  }

  return normalized;
}

function requiredPositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer for PvP RPC.`);
  }

  return value;
}

function nullableArgument(value: string | null | undefined): string | undefined {
  return trimText(value) || undefined;
}
