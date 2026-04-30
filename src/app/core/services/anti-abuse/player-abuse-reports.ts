import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CreatePlayerAbuseReportInput,
  CreatedPlayerAbuseReport,
} from '../../domain/anti-abuse/player-abuse-report-submit.model';
import { CreatePlayerAbuseReportRpcRow } from '../../types/anti-abuse-decision-rpc.types';
import {
  mapCreatedPlayerAbuseReport,
  toCreatePlayerAbuseReportRpcArgs,
} from '../../utils/player-abuse-report-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerAbuseReports {
  private readonly backend = inject(Backend);

  createReport(
    input: CreatePlayerAbuseReportInput,
  ): Observable<CreatedPlayerAbuseReport> {
    return this.backend
      .rpc<CreatePlayerAbuseReportRpcRow[]>(
        RPC.create_player_abuse_report,
        toCreatePlayerAbuseReportRpcArgs(input),
      )
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Abuse report submission returned no report.');
          }

          return mapCreatedPlayerAbuseReport(row);
        }),
      );
  }
}
