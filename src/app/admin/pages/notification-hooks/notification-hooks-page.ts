import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_NAMESPACE } from '../../../core/constants/notification-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { NotificationHookDiagnostic } from '../../../core/domain/notifications/notification-hook-diagnostics.model';
import {
  NotificationHookDiagnostics,
  NotificationHookDiagnosticsAdminData,
} from '../../../core/services/notifications/notification-hook-diagnostics';
import { metadataEntry } from '../../../core/utils/admin-ui-metadata';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { NOTIFICATION_DIAGNOSTICS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-notification-hooks-page',
  standalone: true,
  imports: [AdminTagLinks, LoadingOverlay],
  templateUrl: './notification-hooks-page.html',
})
export class NotificationHooksPage implements OnInit {
  private readonly hookDiagnostics = inject(NotificationHookDiagnostics);

  readonly links = NOTIFICATION_DIAGNOSTICS_PAGE_LINKS;
  readonly diagnostics = signal<NotificationHookDiagnostic[]>([]);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly producerCount = computed(() => this.diagnostics().length);
  readonly missingCount = computed(() =>
    this.diagnostics()
      .filter((item) =>
        item.missingNotificationTypeKeys.length > 0 ||
        item.missingProducerFunctionNames.length > 0,
      )
      .length,
  );
  readonly nonProducerCount = computed(() =>
    this.diagnostics()
      .filter((item) => item.isExplicitNonProducer)
      .length,
  );
  readonly pageHeaderLabel = computed(() =>
    this.metadataLabel('page_header', 'Diagnostyka producentow powiadomien'),
  );
  readonly pageHeaderText = computed(() =>
    this.metadataText(
      'page_header',
      'Read-only podglad DB-owned notification producers i pokrycia typami powiadomien.',
    ),
  );
  readonly producerListText = computed(() =>
    this.metadataText(
      'producer_list',
      'Definicje DB-owned notification producers pochodza z canonical RPC bazy danych.',
    ),
  );
  readonly coverageSummaryText = computed(() =>
    this.metadataText(
      'coverage_summary',
      'Braki typow powiadomien albo funkcji producentow sa DB/content blockerem, nie powodem do frontendowego tworzenia rows.',
    ),
  );
  readonly reportBoundaryText = computed(() =>
    this.metadataText(
      'report_boundary',
      'Granice typu game_report.created przychodza z DB-backed producer diagnostics jako jawne non-producery.',
    ),
  );
  readonly emptyStateText = computed(() =>
    this.metadataText(
      'empty_state',
      'Brak diagnostyki producentow powiadomien do wyswietlenia.',
    ),
  );

  ngOnInit(): void {
    this.loadDiagnostics();
  }

  statusBadgeClass(diagnostic: NotificationHookDiagnostic): string {
    if (diagnostic.isExplicitNonProducer) {
      return 'tag-badge tag-badge--muted';
    }

    if (
      diagnostic.missingNotificationTypeKeys.length > 0 ||
      diagnostic.missingProducerFunctionNames.length > 0
    ) {
      return 'tag-badge tag-badge--warn';
    }

    switch (diagnostic.diagnosticsStatus) {
      case 'explicit_non_producer':
        return 'tag-badge tag-badge--muted';
      default:
        return 'tag-badge tag-badge--info';
    }
  }

  statusLabel(diagnostic: NotificationHookDiagnostic): string {
    return diagnostic.diagnosticsStatusLabelPl;
  }

  private loadDiagnostics(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.hookDiagnostics
      .getAdminData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Nie udalo sie zaladowac diagnostyki producentow powiadomien.',
          ),
      });
  }

  private applyData(data: NotificationHookDiagnosticsAdminData): void {
    this.diagnostics.set(data.diagnostics);
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
      NOTIFICATION_HOOK_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
      key,
    );
  }
}
