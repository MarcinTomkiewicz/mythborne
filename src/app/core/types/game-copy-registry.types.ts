import { PlayerTopbarDisplay } from '../domain/game-copy/player-topbar-display.model';

export type GameCopyRegistry = {
  'player.topbar.display': PlayerTopbarDisplay;
};

export type GameCopyRegistryKind = keyof GameCopyRegistry;

export type GameCopyRegistryArgs = {
  'player.topbar.display': {
    locale: string;
  };
};
