import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_KEYS,
  NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
} from '../../constants/notification-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { NotificationHookDiagnostic } from '../../domain/notifications/notification-hook-diagnostics.model';
import { Database } from '../../types/database.types';
import { GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow } from '../../types/notification-rpc.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { mapNotificationHookDiagnosticRow } from '../../utils/notification-hook-diagnostics';
import { Backend } from '../backend/backend';

type GetUiMetadataEntriesRpcRow =
  Database['public']['Functions']['get_ui_metadata_entries']['Returns'][number];

export interface NotificationHookDiagnosticsAdminData {
  diagnostics: NotificationHookDiagnostic[];
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class NotificationHookDiagnostics {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<NotificationHookDiagnosticsAdminData> {
    return forkJoin({
      diagnostics: this.getDbOwnedProducerDiagnostics(),
      metadataEntries: this.getMetadataEntries(),
    }).pipe(map(({ diagnostics, metadataEntries }) => ({
      diagnostics,
      metadataEntries,
    })));
  }

  private getDbOwnedProducerDiagnostics(): Observable<NotificationHookDiagnostic[]> {
    return this.backend
      .rpc<GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow[]>(
        RPC.get_admin_notification_db_owned_producer_diagnostics,
      )
      .pipe(map((rows) => rows.map(mapNotificationHookDiagnosticRow)));
  }

  private getMetadataEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
        p_keys: [...NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_KEYS],
        p_include_inactive: false,
      },
    ).pipe(map((rows) => rows.map(mapUiMetadataEntry)));
  }
}
