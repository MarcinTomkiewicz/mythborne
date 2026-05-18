import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetHeroHealthStateRpcArgs,
  GetHeroHealthStateRpcRow,
} from '../../types/hero-runtime-stats-rpc.types';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';

export interface HeroHealthStateReadModel {
  heroId: string;
  serverId: string;
  currentHealth: number;
  maxHealth: number;
  resetPolicyKey: string;
  syncedAt: string;
}

@Injectable({ providedIn: 'root' })
export class HeroHealthState {
  private readonly backend = inject(Backend);

  getHeroHealthState(heroId: string): Observable<HeroHealthStateReadModel> {
    const args: GetHeroHealthStateRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend
      .rpc<GetHeroHealthStateRpcRow[]>(RPC.get_hero_health_state, args)
      .pipe(
        map((rows) => {
          const row = firstRpcRow(rows, RPC.get_hero_health_state);

          if (row.hero_id !== heroId) {
            throw new Error('Hero health state returned a row for a different hero.');
          }

          return mapHeroHealthState(row);
        }),
      );
  }
}

function mapHeroHealthState(row: GetHeroHealthStateRpcRow): HeroHealthStateReadModel {
  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    currentHealth: row.current_health,
    maxHealth: row.max_health,
    resetPolicyKey: row.reset_policy_key,
    syncedAt: row.synced_at,
  };
}
