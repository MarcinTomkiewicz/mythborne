import { GameCopyReaders } from '../../types/game-copy-reader.types';
import { GAME_COPY_EXPLORATION_READERS } from './game-copy-exploration.readers';
import { GAME_COPY_PLAYER_READERS } from './game-copy-player.readers';
import { GAME_COPY_REPORTS_READERS } from './game-copy-reports.readers';

export const GAME_COPY_READERS: GameCopyReaders = {
  ...GAME_COPY_PLAYER_READERS,
  ...GAME_COPY_EXPLORATION_READERS,
  ...GAME_COPY_REPORTS_READERS,
};
