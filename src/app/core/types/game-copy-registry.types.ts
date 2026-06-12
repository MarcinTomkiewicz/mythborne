import { ExplorationDifficultyCopy } from '../domain/game-copy/exploration-difficulty-copy.model';
import { PvpActionCopy } from '../domain/pvp/pvp-action-copy.model';
import { PvpPrivateReportCopy } from '../domain/pvp/pvp-private-report-copy.model';
import { PvpPublicReportCopy } from '../domain/pvp/pvp-public-report-copy.model';
import { PlayerTopbarDisplay } from '../domain/game-copy/player-topbar-display.model';
import { PvpRankingCopy } from '../domain/pvp/pvp-ranking.model';
import { ReportPageCopy } from '../domain/reports/report-page-copy.model';

export type GameCopyRegistry = {
  'player.exploration.difficulty': ExplorationDifficultyCopy;
  'player.pvp.action': PvpActionCopy;
  'player.pvp.report.private': PvpPrivateReportCopy;
  'player.pvp.report.public': PvpPublicReportCopy;
  'player.pvp.ranking': PvpRankingCopy;
  'player.reports.page': ReportPageCopy;
  'player.topbar.display': PlayerTopbarDisplay;
};

export type GameCopyRegistryKind = keyof GameCopyRegistry;

export type GameCopyRegistryArgs = {
  'player.exploration.difficulty': {
    locale: string;
  };
  'player.pvp.action': {
    locale: string;
  };
  'player.pvp.report.private': {
    locale: string;
    reportId: string;
  };
  'player.pvp.report.public': {
    locale: string;
    publicToken: string;
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
