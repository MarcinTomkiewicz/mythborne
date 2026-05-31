import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Json } from '../../types/database.types';
import { Backend } from '../backend/backend';
import { mapPlayerDashboardPageContext } from './player-page-context.mapper';
import { PlayerDashboardPageContext } from './player-page-context.model';

@Injectable({ providedIn: 'root' })
export class PlayerPageContext {
  private readonly backend = inject(Backend);

  getDashboardPageContext(heroId: string): Observable<PlayerDashboardPageContext> {
    return this.backend
      .rpc<Json>(RPC.get_player_dashboard_page_context, { p_hero_id: heroId })
      .pipe(map(mapPlayerDashboardPageContext));
  }
}
