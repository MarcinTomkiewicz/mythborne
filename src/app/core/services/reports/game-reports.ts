import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DeleteGameReportResult,
  GameReportServerFilters,
  PrivateGameReportListItem,
} from '../../domain/reports/game-report.model';
import {
  DeleteGameReportForHeroRpcArgs,
  DeleteGameReportForHeroRpcRow,
  GetHeroGameReportsRpcArgs,
  GetHeroGameReportsRpcRow,
  GetHeroGameReportUnreadCountRpcArgs,
  GetHeroGameReportUnreadCountRpcReturn,
} from '../../types/game-report-rpc.types';
import { mapPrivateGameReportListItem } from '../../utils/game-report-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

const DEFAULT_REPORT_LIMIT = 50;

@Injectable({ providedIn: 'root' })
export class GameReports {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroReports(
    filters: Partial<GameReportServerFilters> = {},
  ): Observable<PrivateGameReportListItem[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroGameReportsRpcArgs = {
          p_hero_id: context.heroId,
          p_limit: filters.limit ?? DEFAULT_REPORT_LIMIT,
          p_offset: filters.offset ?? 0,
          p_unread_only: filters.unreadOnly ?? false,
        };

        if (filters.reportTypeKey) {
          args.p_report_type_key = filters.reportTypeKey;
        }

        return this.backend.rpc<GetHeroGameReportsRpcRow[]>(
          RPC.get_hero_game_reports,
          args,
        );
      }),
      map((rows) => rows.map(mapPrivateGameReportListItem)),
    );
  }

  getActiveHeroUnreadCount(): Observable<GetHeroGameReportUnreadCountRpcReturn> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroGameReportUnreadCountRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<GetHeroGameReportUnreadCountRpcReturn>(
          RPC.get_hero_game_report_unread_count,
          args,
        );
      }),
    );
  }

  deleteActiveHeroReport(reportId: string): Observable<DeleteGameReportResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: DeleteGameReportForHeroRpcArgs = {
          p_hero_id: context.heroId,
          p_report_id: reportId,
          p_reason: 'Player removed a report from the reports center.',
        };

        return this.backend.rpc<DeleteGameReportForHeroRpcRow[]>(
          RPC.delete_game_report_for_hero,
          args,
        );
      }),
      map((rows) => mapDeleteGameReportResult(firstDeleteGameReportRow(rows))),
    );
  }
}

function firstDeleteGameReportRow(
  rows: readonly DeleteGameReportForHeroRpcRow[],
): DeleteGameReportForHeroRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('delete_game_report_for_hero returned no result.');
  }

  return row;
}

function mapDeleteGameReportResult(
  row: DeleteGameReportForHeroRpcRow,
): DeleteGameReportResult {
  return {
    reportId: row.report_id,
    heroId: row.hero_id,
    publicToken: row.public_token,
    removedAccess: row.removed_access,
    deletedReport: row.deleted_report,
    remainingAccessCount: row.remaining_access_count,
    auditLogId: row.audit_log_id,
  };
}
