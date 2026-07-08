import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { mapGameCopyEditUi } from '../../domain/game-copy/game-copy-edit.mapper';
import { GameCopyReaders } from '../../types/game-copy-reader.types';
import type { GetGameCopySourcePayloadRpcResult } from '../../types/game-copy-rpc.types';
import { GAME_COPY_EXPLORATION_READERS } from './game-copy-exploration.readers';
import { GAME_COPY_PLAYER_READERS } from './game-copy-player.readers';
import { GAME_COPY_REPORTS_READERS } from './game-copy-reports.readers';

export const GAME_COPY_READERS: GameCopyReaders = {
  'admin.gameCopy.edit': (backend, args) =>
    backend.rpc<GetGameCopySourcePayloadRpcResult>(
      RPC.get_game_copy_source_payload,
      {
        p_game_copy_kind: 'admin.gameCopy.edit',
        p_locale: args.locale,
      },
    ).pipe(map(mapGameCopyEditUi)),
  ...GAME_COPY_PLAYER_READERS,
  ...GAME_COPY_EXPLORATION_READERS,
  ...GAME_COPY_REPORTS_READERS,
};
