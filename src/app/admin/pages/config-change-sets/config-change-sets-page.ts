import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize, map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CONFIG_CHANGE_SETS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
  ConfigDefinition,
} from '../../../core/types/config-governance.types';
import {
  filterConfigChangeSets,
  formatConfigJsonPreview,
  uniqueConfigChangeSetStatuses,
  uniqueConfigChangeSetVisibilities,
} from '../../../core/utils/config-governance';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-config-change-sets-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AdminTagLinks,
    LoadingOverlay,
  ],
  templateUrl: './config-change-sets-page.html',
})
export class ConfigChangeSetsPage implements OnInit {
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);

  readonly links = CONFIG_CHANGE_SETS_PAGE_LINKS;
  readonly filterForm = this.formFactory.createFilterForm();
  readonly changeSets = signal<ConfigChangeSet[]>([]);
  readonly entries = signal<ConfigChangeEntry[]>([]);
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly selectedChangeSetId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isDetailLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly detailError = signal<string | null>(null);
  readonly filters = toSignal(
    this.filterForm.valueChanges.pipe(
      map(() => this.filterForm.getRawValue()),
      startWith(this.filterForm.getRawValue()),
    ),
    { initialValue: this.filterForm.getRawValue() },
  );
  readonly filteredChangeSets = computed(() =>
    filterConfigChangeSets(this.changeSets(), this.filters()),
  );
  readonly selectedChangeSet = computed(
    () =>
      this.changeSets().find((changeSet) => changeSet.id === this.selectedChangeSetId()) ??
      null,
  );
  readonly definitionById = computed(
    () =>
      new Map(
        this.definitions().map((definition) => [definition.id, definition]),
      ),
  );
  readonly statusOptions = computed(() =>
    this.toOptions(uniqueConfigChangeSetStatuses(this.changeSets())),
  );
  readonly visibilityOptions = computed(() =>
    this.toOptions(uniqueConfigChangeSetVisibilities(this.changeSets())),
  );

  ngOnInit(): void {
    this.loadDefinitions();
    this.loadChangeSets();
  }

  selectChangeSet(changeSet: ConfigChangeSet): void {
    if (this.selectedChangeSetId() === changeSet.id) {
      return;
    }

    this.selectedChangeSetId.set(changeSet.id);
    this.loadEntries(changeSet.id);
  }

  isSelected(changeSet: ConfigChangeSet): boolean {
    return this.selectedChangeSetId() === changeSet.id;
  }

  definitionLabel(entry: ConfigChangeEntry): string {
    if (!entry.configDefinitionId) {
      return '-';
    }

    const definition = this.definitionById().get(entry.configDefinitionId);

    return definition ? `${definition.key} (${definition.label})` : entry.configDefinitionId;
  }

  jsonPreview(value: ConfigChangeEntry['oldValue'] | ConfigChangeEntry['metadata']): string {
    return formatConfigJsonPreview(value);
  }

  private toOptions<T extends string>(values: T[]): Array<{ label: string; value: T }> {
    return values.map((value) => ({
      label: value,
      value,
    }));
  }

  private loadDefinitions(): void {
    this.configDefinitions.getDefinitions().subscribe({
      next: (definitions) => this.definitions.set(definitions),
      error: (error: unknown) =>
        this.error.set(
          error instanceof Error
            ? error.message
            : 'Failed to load config definitions.',
        ),
    });
  }

  private loadChangeSets(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.configChangeSets
      .getChangeSets()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (changeSets) => {
          this.changeSets.set(changeSets);

          if (changeSets.length) {
            this.selectedChangeSetId.set(changeSets[0].id);
            this.loadEntries(changeSets[0].id);
          }
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load config change sets.',
          ),
      });
  }

  private loadEntries(changeSetId: string): void {
    this.isDetailLoading.set(true);
    this.detailError.set(null);
    this.entries.set([]);

    this.configChangeSets
      .getChangeEntries(changeSetId)
      .pipe(finalize(() => this.isDetailLoading.set(false)))
      .subscribe({
        next: (entries) => this.entries.set(entries),
        error: (error: unknown) =>
          this.detailError.set(
            error instanceof Error
              ? error.message
              : 'Failed to load config change entries.',
          ),
      });
  }
}
