import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DeleteGameReportResult,
  GameReportServerFilters,
  MarkGameReportReadResult,
  PrivateGameReportDetail,
  PrivateGameReportListItem,
  PublicGameReport,
} from '../../domain/reports/game-report.model';
import {
  DeleteGameReportForHeroRpcArgs,
  DeleteGameReportForHeroRpcRow,
  GetHeroGameReportDetailRpcArgs,
  GetHeroGameReportDetailRpcRow,
  GetHeroGameReportsRpcArgs,
  GetHeroGameReportsRpcRow,
  GetHeroGameReportUnreadCountRpcArgs,
  GetHeroGameReportUnreadCountRpcReturn,
  GetPublicGameReportByTokenRpcArgs,
  GetPublicGameReportByTokenRpcRow,
  MarkGameReportReadRpcArgs,
  MarkGameReportReadRpcReturn,
} from '../../types/game-report-rpc.types';
import {
  mapPrivateGameReportDetail,
  mapPrivateGameReportListItem,
  mapPublicGameReport,
} from '../../utils/game-report-mappers';
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

  getActiveHeroReportDetail(reportId: string): Observable<PrivateGameReportDetail> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroGameReportDetailRpcArgs = {
          p_hero_id: context.heroId,
          p_report_id: reportId,
        };

        return this.backend.rpc<GetHeroGameReportDetailRpcRow[]>(
          RPC.get_hero_game_report_detail,
          args,
        );
      }),
      map((rows) => mapPrivateGameReportDetail(firstGameReportDetailRow(rows))),
    );
  }

  getPublicReportByToken(publicToken: string): Observable<PublicGameReport> {
    const args: GetPublicGameReportByTokenRpcArgs = {
      p_public_token: publicToken,
    };

    return this.backend.rpc<GetPublicGameReportByTokenRpcRow[]>(
      RPC.get_public_game_report_by_token,
      args,
    ).pipe(
      map((rows) => mapPublicGameReport(firstPublicGameReportRow(rows))),
    );
  }

  markActiveHeroReportRead(reportId: string): Observable<MarkGameReportReadResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: MarkGameReportReadRpcArgs = {
          p_hero_id: context.heroId,
          p_report_id: reportId,
        };

        return this.backend.rpc<MarkGameReportReadRpcReturn>(
          RPC.mark_game_report_read,
          args,
        );
      }),
      map(mapMarkGameReportReadResult),
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

function firstGameReportDetailRow(
  rows: readonly GetHeroGameReportDetailRpcRow[],
): GetHeroGameReportDetailRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('get_hero_game_report_detail returned no result.');
  }

  return row;
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

function firstPublicGameReportRow(
  rows: readonly GetPublicGameReportByTokenRpcRow[],
): GetPublicGameReportByTokenRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('get_public_game_report_by_token returned no result.');
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

function mapMarkGameReportReadResult(
  row: MarkGameReportReadRpcReturn,
): MarkGameReportReadResult {
  return {
    reportId: row.report_id,
    heroId: row.hero_id,
    accessRole: row.access_role,
    readAt: row.read_at,
  };
}
