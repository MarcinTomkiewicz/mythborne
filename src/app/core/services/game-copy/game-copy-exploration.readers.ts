import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import type { GameCopyReaders } from '../../types/game-copy-reader.types';
import type {
  GetPlayerExplorationDifficultyCopyRpcResult,
  GetPlayerExplorationRuntimeCopyRpcResult,
} from '../../types/game-copy-rpc.types';
import { mapExplorationDifficultyCopy } from '../../utils/exploration-difficulty-copy.mapper';
import { mapExplorationRuntimeCopy } from '../../utils/exploration-runtime-copy.mapper';

export const GAME_COPY_EXPLORATION_READERS: Pick<
  GameCopyReaders,
  'player.exploration.difficulty' |
  'player.exploration.runtime'
> = {
  'player.exploration.difficulty': (backend, args) =>
    backend.rpc<GetPlayerExplorationDifficultyCopyRpcResult>(
      RPC.get_player_exploration_difficulty_copy,
      { p_locale: args.locale },
    ).pipe(map(mapExplorationDifficultyCopy)),
  'player.exploration.runtime': (backend, args) =>
    backend.rpc<GetPlayerExplorationRuntimeCopyRpcResult>(
      RPC.get_player_exploration_runtime_copy,
      { p_locale: args.locale },
    ).pipe(map(mapExplorationRuntimeCopy)),
};
