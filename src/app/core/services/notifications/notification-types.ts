import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_KEYS, NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_NAMESPACE } from '../../constants/notification-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { NotificationTypeEntry } from '../../domain/notifications/notification.model';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Database } from '../../types/database.types';
import { NotificationTypeRow } from '../../types/notification-rpc.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { mapNotificationType } from '../../utils/notification-mappers';
import { Backend } from '../backend/backend';

type GetUiMetadataEntriesRpcRow =
  Database['public']['Functions']['get_ui_metadata_entries']['Returns'][number];

export interface NotificationTypeAdminData {
  types: NotificationTypeEntry[];
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class NotificationTypes {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<NotificationTypeAdminData> {
    return forkJoin({
      types: this.getTypes(),
      metadataEntries: this.getMetadataEntries(),
    });
  }

  getTypes(): Observable<NotificationTypeEntry[]> {
    return this.backend.getAll<NotificationTypeRow>({
      table: TABLES.notification_types,
      orderBy: [
        { column: 'category' },
        { column: 'sort_order' },
        { column: 'label' },
      ],
      camelCase: false,
    }).pipe(map((rows) => rows.map(mapNotificationType)));
  }

  private getMetadataEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_NAMESPACE,
        p_keys: [...NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_KEYS],
        p_include_inactive: false,
      },
    ).pipe(map((rows) => rows.map(mapUiMetadataEntry)));
  }
}
