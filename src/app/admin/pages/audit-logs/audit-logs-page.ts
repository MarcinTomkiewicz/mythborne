import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize, map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { EMPTY_AUDIT_LOG_DATA } from '../../../core/constants/audit-log.const';
import { AuditLogData } from '../../../core/domain/audit/audit-log.model';
import { AuditLogFilterFormFactory } from '../../../core/factories/forms/audit-log-filter-form.factory';
import { AuditDictionaries } from '../../../core/services/audit/audit-dictionaries';
import { AuditLogs } from '../../../core/services/audit/audit-logs';
import { AuditLogFilterOptions } from '../../../core/types/audit-log-row.types';
import { formatAuditJsonPreview } from '../../../core/utils/audit-log';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { MetadataDisplay } from '../../../shared/metadata-display/metadata-display';
import { AUDIT_LOGS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    LoadingOverlay,
    AdminTagLinks,
    MetadataDisplay,
  ],
  templateUrl: './audit-logs-page.html',
})
export class AuditLogsPage implements OnInit {
  private readonly auditLogs = inject(AuditLogs);
  private readonly auditDictionaries = inject(AuditDictionaries);
  private readonly formFactory = inject(AuditLogFilterFormFactory);

  readonly links = AUDIT_LOGS_PAGE_LINKS;
  readonly filterForm = this.formFactory.createFilterForm();
  readonly data = signal<AuditLogData>(EMPTY_AUDIT_LOG_DATA);
  readonly filterOptions = signal<AuditLogFilterOptions>({
    actionTypes: [],
    entityTypes: [],
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filters = toSignal(
    this.filterForm.valueChanges.pipe(
      map(() => this.filterForm.getRawValue()),
      startWith(this.filterForm.getRawValue()),
    ),
    { initialValue: this.filterForm.getRawValue() },
  );
  readonly actionTypeOptions = computed(() =>
    this.filterOptions().actionTypes.map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    })),
  );
  readonly entityTypeOptions = computed(() =>
    this.filterOptions().entityTypes.map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    })),
  );

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadLogs();
  }

  refresh(): void {
    this.loadLogs();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadLogs();
  }

  jsonPreview(value: unknown): string {
    return formatAuditJsonPreview(value);
  }

  private loadFilterOptions(): void {
    this.auditDictionaries.getActiveDictionaries().subscribe({
      next: (filterOptions) => this.filterOptions.set(filterOptions),
      error: () => this.filterOptions.set({ actionTypes: [], entityTypes: [] }),
    });
  }

  private loadLogs(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.auditLogs
      .getLogs(this.filters())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (logs) => this.data.set({ logs }),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error ? error.message : 'Failed to load audit logs.',
          ),
      });
  }
}
