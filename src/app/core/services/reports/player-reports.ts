import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PrivateReportDetailPage,
  PublicReportDetail,
} from '../../domain/reports/report-detail.model';
import {
  MarkAllReportsReadResult,
  ReportsCenterPageContext,
} from '../../domain/reports/reports-center.model';
import {
  GetPublicReportDetailRpcArgs,
  GetPublicReportDetailRpcResult,
  GetReportDetailRpcArgs,
  GetReportDetailRpcResult,
  GetReportsCenterPageContextRpcArgs,
  GetReportsCenterPageContextRpcResult,
  MarkAllReportsReadRpcArgs,
  MarkAllReportsReadRpcResult,
  MarkReportsReadRpcArgs,
  MarkReportsReadRpcResult,
  RemoveReportsFromListRpcArgs,
  RemoveReportsFromListRpcResult,
} from '../../types/report-rpc.types';
import {
  mapPublicReportDetailPage,
  mapReportDetailPage,
} from '../../utils/report-detail-page.mapper';
import { mapMarkAllReportsReadResult } from '../../utils/reports-center-actions.mapper';
import { mapReportsCenterPageContext } from '../../utils/reports-center-page-context.mapper';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerReports {
  private readonly backend = inject(Backend);

  getReportsCenterPageContext(input: {
    heroId: string;
    limit: number;
    offset: number;
    query: string | null;
    reportAreaKey: string | null;
    readModeKey: string;
    timeRangeKey: string;
  }): Observable<ReportsCenterPageContext> {
    const args: GetReportsCenterPageContextRpcArgs = {
      p_hero_id: input.heroId,
      p_limit: input.limit,
      p_offset: input.offset,
      p_query: input.query ?? undefined,
      p_report_area_key: input.reportAreaKey ?? undefined,
      p_read_mode_key: input.readModeKey,
      p_time_range_key: input.timeRangeKey,
    };

    return this.backend.rpc<GetReportsCenterPageContextRpcResult>(
      RPC.get_reports_center_page_context,
      args,
    ).pipe(
      map(mapReportsCenterPageContext),
    );
  }

  markAllReportsRead(input: {
    heroId: string;
    query: string | null;
    reportAreaKey: string | null;
    readModeKey: string;
    timeRangeKey: string;
    requestId: string | null;
  }): Observable<MarkAllReportsReadResult> {
    const args: MarkAllReportsReadRpcArgs = {
      p_hero_id: input.heroId,
      p_query: input.query ?? undefined,
      p_report_area_key: input.reportAreaKey ?? undefined,
      p_read_mode_key: input.readModeKey,
      p_time_range_key: input.timeRangeKey,
      p_request_id: input.requestId ?? undefined,
    };

    return this.backend.rpc<MarkAllReportsReadRpcResult>(
      RPC.mark_all_reports_read,
      args,
    ).pipe(
      map(mapMarkAllReportsReadResult),
    );
  }

  markReportsRead(input: {
    heroId: string;
    reportIds: readonly string[];
  }): Observable<MarkReportsReadRpcResult> {
    const args: MarkReportsReadRpcArgs = {
      p_hero_id: input.heroId,
      p_report_ids: [...input.reportIds],
    };

    return this.backend.rpc<MarkReportsReadRpcResult>(
      RPC.mark_reports_read,
      args,
    );
  }

  removeReportsFromList(input: {
    heroId: string;
    reportIds: readonly string[];
    requestId: string | null;
  }): Observable<RemoveReportsFromListRpcResult> {
    const args: RemoveReportsFromListRpcArgs = {
      p_hero_id: input.heroId,
      p_report_ids: [...input.reportIds],
      p_request_id: input.requestId ?? undefined,
    };

    return this.backend.rpc<RemoveReportsFromListRpcResult>(
      RPC.remove_reports_from_list,
      args,
    );
  }

  getDetailPage(input: {
    heroId: string;
    reportId: string;
  }): Observable<PrivateReportDetailPage> {
    const args: GetReportDetailRpcArgs = {
      p_hero_id: input.heroId,
      p_report_id: input.reportId,
    };

    return this.backend.rpc<GetReportDetailRpcResult>(
      RPC.get_report_detail,
      args,
    ).pipe(
      map((value) => mapReportDetailPage(value, {
        heroId: input.heroId,
        reportId: input.reportId,
      })),
    );
  }

  getPublicDetailPage(publicToken: string): Observable<PublicReportDetail> {
    const args: GetPublicReportDetailRpcArgs = {
      p_public_token: publicToken,
    };

    return this.backend.rpc<GetPublicReportDetailRpcResult>(
      RPC.get_public_report_detail,
      args,
    ).pipe(
      map(mapPublicReportDetailPage),
    );
  }
}
