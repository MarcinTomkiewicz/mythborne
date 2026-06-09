import { map } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import { GameCopyReaders } from '../../types/game-copy-reader.types';
import { mapReportPageCopy } from '../../utils/report-page-copy.mapper';

export const GAME_COPY_REPORTS_READERS: Pick<
  GameCopyReaders,
  'player.reports.page'
> = {
  'player.reports.page': (backend, args) =>
    backend.rpc<
      Database['public']['Functions']['get_report_page_copy']['Returns']
    >(
      RPC.get_report_page_copy,
      { p_locale: args.locale },
    ).pipe(map(mapReportPageCopy)),
};
