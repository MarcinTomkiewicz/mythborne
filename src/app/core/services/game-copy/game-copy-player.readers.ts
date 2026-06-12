import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import { GameCopyReaders } from '../../types/game-copy-reader.types';
import { mapPvpActionCopy } from '../../utils/pvp-action-copy.mapper';
import { mapPvpPrivateReportCopy } from '../../utils/pvp-private-report-copy.mapper';
import { mapPvpPublicReportCopy } from '../../utils/pvp-public-report-copy.mapper';
import { mapPvpRankingCopy } from '../../utils/pvp-ranking-copy.mapper';
import { mapPlayerTopbarDisplay } from '../../utils/player-topbar-display.mapper';

export const GAME_COPY_PLAYER_READERS: Pick<
  GameCopyReaders,
  'player.pvp.action' |
  'player.pvp.report.private' |
  'player.pvp.report.public' |
  'player.pvp.ranking' |
  'player.topbar.display'
> = {
  'player.pvp.action': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_pvp_action_copy']['Returns']
    >(
      RPC.get_pvp_action_copy,
      { p_locale: args.locale },
    ).pipe(map(mapPvpActionCopy)),
  'player.pvp.report.private': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_pvp_report_copy']['Returns']
    >(
      RPC.get_pvp_report_copy,
      {
        p_locale: args.locale,
        p_report_id: args.reportId,
      },
    ).pipe(map(mapPvpPrivateReportCopy)),
  'player.pvp.report.public': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_public_pvp_report_copy']['Returns']
    >(
      RPC.get_public_pvp_report_copy,
      {
        p_locale: args.locale,
        p_public_token: args.publicToken,
      },
    ).pipe(map(mapPvpPublicReportCopy)),
  'player.pvp.ranking': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_pvp_ranking_copy']['Returns']
    >(
      RPC.get_pvp_ranking_copy,
      { p_locale: args.locale },
    ).pipe(map(mapPvpRankingCopy)),
  'player.topbar.display': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_player_topbar_display_contract']['Returns']
    >(
      RPC.get_player_topbar_display_contract,
      { p_locale: args.locale },
    ).pipe(map(mapPlayerTopbarDisplay)),
};
