import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import { GameCopyReaders } from '../../types/game-copy-reader.types';
import { mapPlayerTopbarDisplay } from '../../utils/player-topbar-display.mapper';

export const GAME_COPY_PLAYER_READERS: Pick<
  GameCopyReaders,
  'player.topbar.display'
> = {
  'player.topbar.display': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_player_topbar_display_contract']['Returns']
    >(
      RPC.get_player_topbar_display_contract,
      { p_locale: args.locale },
    ).pipe(map(mapPlayerTopbarDisplay)),
};
