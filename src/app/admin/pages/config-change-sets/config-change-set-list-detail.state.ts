import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
} from '../../../core/types/config-governance.types';
import { toSelectOptions } from '../../../core/utils/collection';
import {
  filterConfigChangeSets,
  uniqueConfigChangeSetStatuses,
  uniqueConfigChangeSetVisibilities,
} from '../../../core/utils/config-governance';
import { runRequest } from '../../../core/utils/request-state';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';

@Injectable()
export class ConfigChangeSetListDetailState {
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);

  readonly filterForm = this.formFactory.createFilterForm();
  readonly changeSets = signal<ConfigChangeSet[]>([]);
  readonly entries = signal<ConfigChangeEntry[]>([]);
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
      this.changeSets().find(
        (changeSet) => changeSet.id === this.selectedChangeSetId(),
      ) ?? null,
  );
  readonly statusOptions = computed(() =>
    toSelectOptions(uniqueConfigChangeSetStatuses(this.changeSets())),
  );
  readonly visibilityOptions = computed(() =>
    toSelectOptions(uniqueConfigChangeSetVisibilities(this.changeSets())),
  );

  loadChangeSets(selectedChangeSetId?: string): void {
    runRequest({
      request$: this.configChangeSets.getChangeSets(),
      loading: this.isLoading,
      error: this.error,
      errorMessage: 'Failed to load config change sets.',
      onSuccess: (changeSets) => this.setChangeSets(changeSets, selectedChangeSetId),
    });
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

  private setChangeSets(
    changeSets: ConfigChangeSet[],
    selectedChangeSetId?: string,
  ): void {
    this.changeSets.set(changeSets);

    const selectedChangeSet =
      changeSets.find((changeSet) => changeSet.id === selectedChangeSetId) ??
      changeSets[0] ??
      null;

    if (selectedChangeSet) {
      this.selectedChangeSetId.set(selectedChangeSet.id);
      this.loadEntries(selectedChangeSet.id);
    }
  }

  private loadEntries(changeSetId: string): void {
    this.entries.set([]);

    runRequest({
      request$: this.configChangeSets.getChangeEntries(changeSetId),
      loading: this.isDetailLoading,
      error: this.detailError,
      errorMessage: 'Failed to load config change entries.',
      onSuccess: (entries) => this.entries.set(entries),
    });
  }
}
