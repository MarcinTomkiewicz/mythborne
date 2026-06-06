import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ReportListPage, ReportPageCopy } from '../../domain/reports/report.model';
import {
  GetReportListPageRpcArgs,
  GetReportListPageRpcResult,
  GetReportPageCopyRpcResult,
} from '../../types/report-rpc.types';
import { mapReportListPage } from '../../utils/report-list-page.mapper';
import { mapReportPageCopy } from '../../utils/report-page-copy.mapper';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerReports {
  private readonly backend = inject(Backend);

  getPageCopy(): Observable<ReportPageCopy> {
    return this.backend.rpc<GetReportPageCopyRpcResult>(
      RPC.get_report_page_copy,
    ).pipe(
      map(mapReportPageCopy),
    );
  }

  getListPage(input: {
    heroId: string;
    limit: number;
    offset: number;
    reportTypeKey: string | null;
    unreadOnly: boolean;
  }): Observable<ReportListPage> {
    const args: GetReportListPageRpcArgs = {
      p_hero_id: input.heroId,
      p_limit: input.limit,
      p_offset: input.offset,
      p_unread_only: input.unreadOnly,
    };

    if (input.reportTypeKey) {
      args.p_report_type_key = input.reportTypeKey;
    }

    return this.backend.rpc<GetReportListPageRpcResult>(
      RPC.get_report_list_page,
      args,
    ).pipe(
      map(mapReportListPage),
    );
  }
}
