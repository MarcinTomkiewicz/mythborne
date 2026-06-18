import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import type { GameCopyReaders } from '../../types/game-copy-reader.types';
import type { GetReportPageCopyRpcResult } from '../../types/game-copy-rpc.types';
import { mapReportPageCopy } from '../../utils/report-page-copy.mapper';

export const GAME_COPY_REPORTS_READERS: Pick<
  GameCopyReaders,
  'player.reports.page'
> = {
  'player.reports.page': (backend, args) =>
    backend.rpc<GetReportPageCopyRpcResult>(
      RPC.get_report_page_copy,
      { p_locale: args.locale },
    ).pipe(map(mapReportPageCopy)),
};
