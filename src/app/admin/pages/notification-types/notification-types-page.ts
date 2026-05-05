import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_NAMESPACE } from '../../../core/constants/notification-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { NotificationTypeEntry } from '../../../core/domain/notifications/notification.model';
import {
  NotificationTypeAdminData,
  NotificationTypes,
} from '../../../core/services/notifications/notification-types';
import { metadataEntry } from '../../../core/utils/admin-ui-metadata';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { NOTIFICATION_TYPES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-notification-types-page',
  standalone: true,
  imports: [AdminTagLinks, LoadingOverlay],
  templateUrl: './notification-types-page.html',
})
export class NotificationTypesPage implements OnInit {
  private readonly notificationTypes = inject(NotificationTypes);

  readonly links = NOTIFICATION_TYPES_PAGE_LINKS;
  readonly types = signal<NotificationTypeEntry[]>([]);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeCount = computed(() =>
    this.types().filter((type) => type.isActive).length,
  );
  readonly toastEnabledCount = computed(() =>
    this.types().filter((type) => type.defaultToastEnabled).length,
  );
  readonly pageHeaderLabel = computed(() =>
    this.metadataLabel('page_header', 'Notification types'),
  );
  readonly pageHeaderText = computed(() =>
    this.metadataText(
      'page_header',
      'Read-only inspection of DB-backed notification labels, categories, severity and toast defaults.',
    ),
  );
  readonly typeListText = computed(() =>
    this.metadataText(
      'type_list',
      'Labels and descriptions come from the notification type dictionary.',
    ),
  );
  readonly toastBehaviorText = computed(() =>
    this.metadataText(
      'toast_behavior',
      'Default toast enabled controls presentation only; the persistent inbox remains source of truth.',
    ),
  );
  readonly emptyStateText = computed(() =>
    this.metadataText('empty_state', 'No notification types registered.'),
  );

  ngOnInit(): void {
    this.loadTypes();
  }

  severityBadgeClass(type: NotificationTypeEntry): string {
    switch (type.defaultSeverity) {
      case 'critical':
        return 'tag-badge tag-badge--danger';
      case 'warning':
        return 'tag-badge tag-badge--warn';
      case 'notice':
        return 'tag-badge tag-badge--info';
      default:
        return 'tag-badge tag-badge--muted';
    }
  }

  private loadTypes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.notificationTypes
      .getAdminData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load notification types.',
          ),
      });
  }

  private applyData(data: NotificationTypeAdminData): void {
    this.types.set(data.types);
    this.metadataEntries.set(data.metadataEntries);
  }

  private metadataLabel(key: string, fallback: string): string {
    return this.metadataEntry(key)?.label ?? fallback;
  }

  private metadataText(key: string, fallback: string): string {
    return this.metadataEntry(key)?.description ?? fallback;
  }

  private metadataEntry(key: string): UiMetadataEntryReadModel | null {
    return metadataEntry(
      this.metadataEntries(),
      NOTIFICATION_TYPE_ADMIN_SECTION_METADATA_NAMESPACE,
      key,
    );
  }
}
