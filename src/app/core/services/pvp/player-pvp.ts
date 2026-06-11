import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ActivePvpActionOffer,
  HeroPvpDailyAttackState,
  PvpActionStartResult,
  PvpSpyGameReportResult,
  PvpSpySettlementResult,
  PvpTargetCandidate,
} from '../../domain/pvp/pvp.model';
import {
  CreatePvpSpyGameReportRpcArgs,
  CreatePvpSpyGameReportRpcRow,
  GetActivePvpActionOfferRpcArgs,
  GetActivePvpActionOfferRpcRow,
  GetHeroPvpDailyAttackStateRpcArgs,
  GetHeroPvpDailyAttackStateRpcRow,
  GetPvpTargetCandidatesRpcArgs,
  GetPvpTargetCandidatesRpcRow,
  GetPvpVisibleAddressTargetOverlayRpcArgs,
  GetPvpVisibleAddressTargetOverlayRpcRow,
  SettleDuePvpSpyActionRpcArgs,
  SettleDuePvpSpyActionRpcRow,
  StartPvpActionRpcArgs,
  StartPvpActionRpcRow,
} from '../../types/pvp-rpc.types';
import type {
  CreatePvpSpyGameReportInput,
  PvpTargetCandidateFilters,
  PvpVisibleAddressTargetOverlayInput,
  SettleDuePvpSpyActionInput,
  StartPvpActionInput,
} from '../../types/pvp-action.types';
import { positiveInteger } from '../../utils/number';
import { requiredTrimmedText, trimToNull } from '../../utils/normalize-text';
import {
  mapActivePvpActionOffer,
  mapPvpActionStartResult,
  mapHeroPvpDailyAttackState,
  mapPvpSpyGameReportResult,
  mapPvpSpySettlementResult,
  mapPvpTargetCandidate,
  mapPvpVisibleAddressTargetOverlay,
} from '../../utils/pvp-mappers';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

const DEFAULT_PVP_TARGET_LIMIT = 50;

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
          p_district_code: trimToNull(filters.districtCode) ?? undefined,
          p_limit: filters.limit ?? DEFAULT_PVP_TARGET_LIMIT,
          p_offset: filters.offset ?? 0,
          p_search: trimToNull(filters.search) ?? undefined,
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
          firstRpcRow(rows, 'get_hero_pvp_daily_attack_state'),
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
          p_district_code: requiredTrimmedText(
            input.districtCode,
            'districtCode',
            'PvP RPC',
          ),
          p_from_address_number: positiveInteger(
            input.fromAddressNumber,
          ),
          p_to_address_number: positiveInteger(
            input.toAddressNumber,
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
    const actionKind = requiredTrimmedText(input.actionKind, 'actionKind', 'PvP RPC');
    const targetHeroId = requiredTrimmedText(input.targetHeroId, 'targetHeroId', 'PvP RPC');
    const reason = trimToNull(input.reason) ?? undefined;
    const requestId = trimToNull(input.requestId) ?? undefined;

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
        mapPvpActionStartResult(firstRpcRow(rows, 'start_pvp_action')),
      ),
    );
  }

  settleDueSpyAction(input: SettleDuePvpSpyActionInput): Observable<PvpSpySettlementResult> {
    const pvpActionId = requiredTrimmedText(input.pvpActionId, 'pvpActionId', 'PvP RPC');
    const requestId = trimToNull(input.requestId) ?? undefined;

    return this.activeHero.requireActiveHero().pipe(
      switchMap(() => {
        const args: SettleDuePvpSpyActionRpcArgs = {
          p_pvp_action_id: pvpActionId,
          p_request_id: requestId,
        };

        return this.backend.rpc<SettleDuePvpSpyActionRpcRow[]>(
          RPC.settle_due_pvp_spy_action,
          args,
        );
      }),
      map((rows) =>
        mapPvpSpySettlementResult(firstRpcRow(rows, 'settle_due_pvp_spy_action')),
      ),
    );
  }

  createSpyGameReport(input: CreatePvpSpyGameReportInput): Observable<PvpSpyGameReportResult> {
    const pvpSpyResultId = requiredTrimmedText(input.pvpSpyResultId, 'pvpSpyResultId', 'PvP RPC');
    const requestId = trimToNull(input.requestId) ?? undefined;

    return this.activeHero.requireActiveHero().pipe(
      switchMap(() => {
        const args: CreatePvpSpyGameReportRpcArgs = {
          p_pvp_spy_result_id: pvpSpyResultId,
          p_request_id: requestId,
        };

        return this.backend.rpc<CreatePvpSpyGameReportRpcRow[]>(
          RPC.create_pvp_spy_game_report,
          args,
        );
      }),
      map((rows) =>
        mapPvpSpyGameReportResult(firstRpcRow(rows, 'create_pvp_spy_game_report')),
      ),
    );
  }

  getActivePvpActionOffer(): Observable<ActivePvpActionOffer | null> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetActivePvpActionOfferRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<GetActivePvpActionOfferRpcRow[]>(
          RPC.get_active_pvp_action_offer,
          args,
        );
      }),
      map((rows) => rows[0] ? mapActivePvpActionOffer(rows[0]) : null),
    );
  }
}
