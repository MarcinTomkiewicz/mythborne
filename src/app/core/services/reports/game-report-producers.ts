import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CreateCombatGameReportInput,
  CreatedCombatGameReport,
} from '../../domain/reports/game-report.model';
import { CreateGameReportFromCombatResultRpcRow } from '../../types/game-report-rpc.types';
import {
  mapCreatedCombatGameReport,
  toCreateGameReportFromCombatResultRpcArgs,
} from '../../utils/game-report-producer-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class GameReportProducers {
  private readonly backend = inject(Backend);

  createCombatReportFromResult(
    input: CreateCombatGameReportInput,
  ): Observable<CreatedCombatGameReport> {
    return this.backend.rpc<CreateGameReportFromCombatResultRpcRow[]>(
      RPC.create_game_report_from_combat_result,
      toCreateGameReportFromCombatResultRpcArgs(input),
    ).pipe(
      map((rows) => mapCreatedCombatGameReport(firstCreatedCombatReportRow(rows))),
    );
  }
}

function firstCreatedCombatReportRow(
  rows: readonly CreateGameReportFromCombatResultRpcRow[],
): CreateGameReportFromCombatResultRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('create_game_report_from_combat_result returned no result.');
  }

  return row;
}
