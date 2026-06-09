import { ExplorationDifficultyCopy } from '../domain/game-copy/exploration-difficulty-copy.model';
import { PlayerTopbarDisplay } from '../domain/game-copy/player-topbar-display.model';

export type GameCopyRegistry = {
  'player.exploration.difficulty': ExplorationDifficultyCopy;
  'player.topbar.display': PlayerTopbarDisplay;
};

export type GameCopyRegistryKind = keyof GameCopyRegistry;

export type GameCopyRegistryArgs = {
  'player.exploration.difficulty': {
    locale: string;
  };
  'player.topbar.display': {
    locale: string;
  };
};
