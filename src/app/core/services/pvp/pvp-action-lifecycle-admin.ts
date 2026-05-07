import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  PvpActionKindEntry,
  PvpActionStatusEntry,
} from '../../domain/pvp/pvp.model';
import {
  PvpActionKindRow,
  PvpActionStatusRow,
} from '../../types/pvp-rpc.types';
import {
  mapPvpActionKind,
  mapPvpActionStatus,
} from '../../utils/pvp-mappers';
import { Backend } from '../backend/backend';

export interface PvpActionLifecycleAdminData {
  actionKinds: PvpActionKindEntry[];
  actionStatuses: PvpActionStatusEntry[];
}

@Injectable({ providedIn: 'root' })
export class PvpActionLifecycleAdmin {
  private readonly backend = inject(Backend);

  getData(): Observable<PvpActionLifecycleAdminData> {
    return forkJoin({
      actionKinds: this.getActionKinds(),
      actionStatuses: this.getActionStatuses(),
    });
  }

  private getActionKinds(): Observable<PvpActionKindEntry[]> {
    return this.backend.getAll<PvpActionKindRow>({
      table: TABLES.pvp_action_kinds,
      orderBy: [
        { column: 'sort_order' },
        { column: 'key' },
      ],
      camelCase: false,
    }).pipe(map((rows) => rows.map(mapPvpActionKind)));
  }

  private getActionStatuses(): Observable<PvpActionStatusEntry[]> {
    return this.backend.getAll<PvpActionStatusRow>({
      table: TABLES.pvp_action_statuses,
      orderBy: [
        { column: 'sort_order' },
        { column: 'key' },
      ],
      camelCase: false,
    }).pipe(map((rows) => rows.map(mapPvpActionStatus)));
  }
}
