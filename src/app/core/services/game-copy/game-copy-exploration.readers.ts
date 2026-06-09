import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import { GameCopyReaders } from '../../types/game-copy-reader.types';
import { mapExplorationDifficultyCopy } from '../../utils/exploration-difficulty-copy.mapper';

export const GAME_COPY_EXPLORATION_READERS: Pick<
  GameCopyReaders,
  'player.exploration.difficulty'
> = {
  'player.exploration.difficulty': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_player_exploration_difficulty_copy']['Returns']
    >(
      RPC.get_player_exploration_difficulty_copy,
      { p_locale: args.locale },
    ).pipe(map(mapExplorationDifficultyCopy)),
};
