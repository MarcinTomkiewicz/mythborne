import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import {
  GameCopyRegistry,
  GameCopyRegistryArgs,
  GameCopyRegistryKind,
} from '../../types/game-copy-registry.types';
import { mapPlayerTopbarDisplay } from '../../utils/player-topbar-display.mapper';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class GameCopyService {
  private readonly backend = inject(Backend);
  private readonly copyReaders: {
    [Kind in GameCopyRegistryKind]: (
      args: GameCopyRegistryArgs[Kind],
    ) => Observable<GameCopyRegistry[Kind]>;
  } = {
    'player.topbar.display': (args) =>
      this.backend.rpc<
        Database['public']['Functions']['get_player_topbar_display_contract']['Returns']
      >(
        RPC.get_player_topbar_display_contract,
        { p_locale: args.locale },
      ).pipe(map(mapPlayerTopbarDisplay)),
  };

  getCopy<Kind extends GameCopyRegistryKind>(
    kind: Kind,
    args: GameCopyRegistryArgs[Kind],
  ): Observable<GameCopyRegistry[Kind]> {
    return this.copyReaders[kind](args);
  }
}
