import { ExplorationDifficultyCopy } from '../domain/game-copy/exploration-difficulty-copy.model';
import { PlayerTopbarDisplay } from '../domain/game-copy/player-topbar-display.model';
import { PvpRankingCopy } from '../domain/pvp/pvp-ranking.model';
import { ReportPageCopy } from '../domain/reports/report-page-copy.model';

export type GameCopyRegistry = {
  'player.exploration.difficulty': ExplorationDifficultyCopy;
  'player.pvp.ranking': PvpRankingCopy;
  'player.reports.page': ReportPageCopy;
  'player.topbar.display': PlayerTopbarDisplay;
};

export type GameCopyRegistryKind = keyof GameCopyRegistry;

export type GameCopyRegistryArgs = {
  'player.exploration.difficulty': {
    locale: string;
  };
  'player.pvp.ranking': {
    locale: string;
  };
  'player.reports.page': {
    locale: string;
  };
  'player.topbar.display': {
    locale: string;
  };
};
