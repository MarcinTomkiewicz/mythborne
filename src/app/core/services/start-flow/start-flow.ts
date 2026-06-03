import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  AccountEntryActiveHeroContext,
  AccountEntryActiveHeroContextRow,
  AccountEntryHeroContext,
  AccountEntryHeroContextRow,
  SelectAccountEntryActiveHeroContextArgs,
  StartFlowCreateHeroArgs,
  StartFlowCreateHeroRow,
  StartFlowHeroCreationInput,
  StartFlowHeroCreationResult,
  StartFlowOriginOption,
  StartFlowOriginOptionRow,
  StartFlowServerAvailability,
  StartFlowServerAvailabilityRow,
} from '../../domain/start-flow/start-flow.model';
import {
  mapAccountEntryActiveHeroContext,
  mapAccountEntryHeroContext,
  mapStartFlowHeroCreationResult,
  mapStartFlowOriginOption,
  mapStartFlowServerAvailability,
} from '../../utils/start-flow-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class StartFlow {
  private readonly backend = inject(Backend);

  getServerAvailability(): Observable<StartFlowServerAvailability[]> {
    return this.backend
      .rpc<StartFlowServerAvailabilityRow[]>(
        RPC.get_start_flow_server_availability,
      )
      .pipe(map((rows) => rows.map(mapStartFlowServerAvailability)));
  }

  getAccountEntryHeroContexts(
    serverId: string | null = null,
  ): Observable<AccountEntryHeroContext[]> {
    const args = serverId ? { p_server_id: serverId } : {};

    return this.backend
      .rpc<AccountEntryHeroContextRow[]>(
        RPC.get_account_entry_hero_contexts,
        args,
      )
      .pipe(map((rows) => rows.map(mapAccountEntryHeroContext)));
  }

  selectAccountEntryActiveHeroContext(
    serverId: string,
    heroId: string,
  ): Observable<AccountEntryActiveHeroContext> {
    const args: SelectAccountEntryActiveHeroContextArgs = {
      p_server_id: serverId,
      p_hero_id: heroId,
    };

    return this.backend
      .rpc<AccountEntryActiveHeroContextRow[]>(
        RPC.select_account_entry_active_hero_context,
        args,
      )
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Hero entry did not return an active hero context.');
          }

          return mapAccountEntryActiveHeroContext(row);
        }),
      );
  }

  getOriginOptions(): Observable<StartFlowOriginOption[]> {
    return this.backend
      .rpc<StartFlowOriginOptionRow[]>(RPC.get_start_flow_origin_options)
      .pipe(map((rows) => rows.map(mapStartFlowOriginOption)));
  }

  createHero(
    input: StartFlowHeroCreationInput,
  ): Observable<StartFlowHeroCreationResult> {
    const args: StartFlowCreateHeroArgs = {
      p_server_id: input.serverId,
      p_origin_id: input.originId,
      p_hero_name: input.heroName,
      p_request_id: input.requestId,
    };

    return this.backend
      .rpc<StartFlowCreateHeroRow[]>(RPC.create_hero_start_flow, args)
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Hero creation did not return a start-flow result.');
          }

          return mapStartFlowHeroCreationResult(row);
        }),
      );
  }
}
