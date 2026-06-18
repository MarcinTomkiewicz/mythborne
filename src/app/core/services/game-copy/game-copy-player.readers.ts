import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import type { GameCopyReaders } from '../../types/game-copy-reader.types';
import type {
  GetPlayerCombatCommonCopyRpcResult,
  GetPlayerTopbarDisplayContractRpcResult,
  GetPublicPvpReportCopyRpcResult,
  GetPvpActionCopyRpcResult,
  GetPvpCombatCopyRpcResult,
  GetPvpRankingCopyRpcResult,
  GetPvpReportCopyRpcResult,
} from '../../types/game-copy-rpc.types';
import { mapCombatCommonCopy } from '../../utils/combat-common-copy.mapper';
import { mapPvpActionCopy } from '../../utils/pvp-action-copy.mapper';
import { mapPvpCombatCopy } from '../../utils/pvp-combat-copy.mapper';
import { mapPvpPrivateReportCopy } from '../../utils/pvp-private-report-copy.mapper';
import { mapPvpPublicReportCopy } from '../../utils/pvp-public-report-copy.mapper';
import { mapPvpRankingCopy } from '../../utils/pvp-ranking-copy.mapper';
import { mapPlayerTopbarDisplay } from '../../utils/player-topbar-display.mapper';

export const GAME_COPY_PLAYER_READERS: Pick<
  GameCopyReaders,
  'player.combat.common' |
  'player.pvp.action' |
  'player.pvp.combat' |
  'player.pvp.report.private' |
  'player.pvp.report.public' |
  'player.pvp.ranking' |
  'player.topbar.display'
> = {
  'player.combat.common': (backend, args) =>
    backend.rpc<GetPlayerCombatCommonCopyRpcResult>(
      RPC.get_player_combat_common_copy,
      { p_locale: args.locale },
    ).pipe(map(mapCombatCommonCopy)),
  'player.pvp.action': (backend, args) =>
    backend.rpc<GetPvpActionCopyRpcResult>(
      RPC.get_pvp_action_copy,
      { p_locale: args.locale },
    ).pipe(map(mapPvpActionCopy)),
  'player.pvp.combat': (backend, args) =>
    backend.rpc<GetPvpCombatCopyRpcResult>(
      RPC.get_pvp_combat_copy,
      { p_locale: args.locale },
    ).pipe(map(mapPvpCombatCopy)),
  'player.pvp.report.private': (backend, args) =>
    backend.rpc<GetPvpReportCopyRpcResult>(
      RPC.get_pvp_report_copy,
      {
        p_locale: args.locale,
        p_report_id: args.reportId,
      },
    ).pipe(map(mapPvpPrivateReportCopy)),
  'player.pvp.report.public': (backend, args) =>
    backend.rpc<GetPublicPvpReportCopyRpcResult>(
      RPC.get_public_pvp_report_copy,
      {
        p_locale: args.locale,
        p_public_token: args.publicToken,
      },
    ).pipe(map(mapPvpPublicReportCopy)),
  'player.pvp.ranking': (backend, args) =>
    backend.rpc<GetPvpRankingCopyRpcResult>(
      RPC.get_pvp_ranking_copy,
      { p_locale: args.locale },
    ).pipe(map(mapPvpRankingCopy)),
  'player.topbar.display': (backend, args) =>
    backend.rpc<GetPlayerTopbarDisplayContractRpcResult>(
      RPC.get_player_topbar_display_contract,
      { p_locale: args.locale },
    ).pipe(map(mapPlayerTopbarDisplay)),
};
