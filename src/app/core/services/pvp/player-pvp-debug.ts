import { Injectable, inject } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PvpAddRemainingActionsInput,
  PvpAddRemainingActionsResult,
  PvpAttackTravelTimerSkipInput,
  PvpAttackTravelTimerSkipResult,
} from '../../domain/pvp/pvp-debug.model';
import {
  AddHeroRemainingActionsRpcRow,
  SkipActivePvpAttackTravelTimerRpcRow,
} from '../../types/pvp-debug-rpc.types';
import {
  firstAddHeroRemainingActionsRow,
  firstSkipActivePvpAttackTravelTimerRow,
  mapPvpAddRemainingActionsResult,
  mapPvpAttackTravelTimerSkipResult,
  toPvpAddRemainingActionsRpcArgs,
  toSkipActivePvpAttackTravelTimerRpcArgs,
} from '../../utils/pvp-debug-rpc';
import { ActiveHero } from '../hero/active-hero';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerPvpDebug {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  skipActiveAttackTravelTimer(
    input: PvpAttackTravelTimerSkipInput,
  ): Observable<PvpAttackTravelTimerSkipResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.backend.rpc<SkipActivePvpAttackTravelTimerRpcRow[]>(
          RPC.skip_active_pvp_attack_travel_timer,
          toSkipActivePvpAttackTravelTimerRpcArgs(context.heroId, input),
        ),
      ),
      map(firstSkipActivePvpAttackTravelTimerRow),
      map(mapPvpAttackTravelTimerSkipResult),
    );
  }

  addRemainingAttacks(
    input: PvpAddRemainingActionsInput,
  ): Observable<PvpAddRemainingActionsResult> {
    return this.backend
      .rpc<AddHeroRemainingActionsRpcRow[]>(
        RPC.add_hero_remaining_actions,
        toPvpAddRemainingActionsRpcArgs(input),
      )
      .pipe(
        map(firstAddHeroRemainingActionsRow),
        map(mapPvpAddRemainingActionsResult),
      );
  }
}
