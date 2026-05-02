import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PersistCombatResultSnapshotInput,
  PersistedCombatResultSnapshot,
} from '../../domain/combat/combat-result-snapshot.model';
import {
  toPersistCombatResultSnapshotRpcArgs,
  toPersistedCombatResultSnapshot,
} from '../../utils/combat-result-rpc';
import { Backend } from '../backend/backend';
import { PersistCombatResultSnapshotRpcRow } from '../../types/combat-result-rpc.types';

@Injectable({ providedIn: 'root' })
export class CombatResultSnapshotsService {
  private readonly backend = inject(Backend);

  persistResult(
    input: PersistCombatResultSnapshotInput,
  ): Observable<PersistedCombatResultSnapshot> {
    return this.backend
      .rpc<PersistCombatResultSnapshotRpcRow[]>(
        RPC.persist_combat_result_snapshot,
        toPersistCombatResultSnapshotRpcArgs(input),
      )
      .pipe(map((rows) => this.requireResultRow(rows)));
  }

  private requireResultRow(
    rows: PersistCombatResultSnapshotRpcRow[],
  ): PersistedCombatResultSnapshot {
    const row = rows[0];

    if (!row) {
      throw new Error('Combat result snapshot persistence returned no result row.');
    }

    return toPersistedCombatResultSnapshot(row);
  }
}
