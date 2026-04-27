import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, startWith } from 'rxjs';
import {
  ConfigChangeKindKey,
  ConfigChangeStatusKey,
  ConfigChangeValueTarget,
  ConfigChangeVisibilityKey,
} from '../../enums/config-governance.enum';
import { ConfigChangeSetsFormFactory } from '../../factories/forms/config-change-sets-form.factory';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
  ConfigDefinition,
  EffectiveConfigValue,
} from '../../types/config-governance.types';
import { toSelectOptions } from '../../utils/collection';
import {
  filterConfigChangeSets,
  formatConfigJsonPreview,
  isConfigDefinitionSupportedInValueDraftEditor,
  parseConfigValueInput,
  uniqueConfigChangeSetStatuses,
  uniqueConfigChangeSetVisibilities,
} from '../../utils/config-governance';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { AuthState } from '../auth/auth-state';
import { ActiveServer } from '../server/active-server';
import { ConfigChangeSets } from './config-change-sets';
import { ConfigDefinitions } from './config-definitions';
import { ConfigValues } from './config-values';

@Injectable()
export class ConfigChangeSetsPageFacade {
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly configValues = inject(ConfigValues);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);
  private readonly authState = inject(AuthState);
  private readonly activeServer = inject(ActiveServer);

  readonly filterForm = this.formFactory.createFilterForm();
  readonly draftForm = this.formFactory.createDraftForm();
  readonly entryForm = this.formFactory.createEntryDraftForm();
  readonly changeSets = signal<ConfigChangeSet[]>([]);
  readonly entries = signal<ConfigChangeEntry[]>([]);
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly effectiveValues = signal(new Map<string, EffectiveConfigValue>());
  readonly globalEffectiveValues = signal(
    new Map<string, EffectiveConfigValue>(),
  );
  readonly selectedChangeSetId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isDetailLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isSavingEntry = signal(false);
  readonly error = signal<string | null>(null);
  readonly detailError = signal<string | null>(null);
  readonly editorError = signal<string | null>(null);
  readonly editorMessage = signal<string | null>(null);
  private readonly effectiveValuesRefresh = effect(() => {
    this.activeServer.selectedServer()?.id;
    const definitions = this.definitions();

    if (definitions.length) {
      this.loadEffectiveValues(definitions);
      this.loadGlobalEffectiveValues(definitions);
    }
  });
  readonly filters = toSignal(
    this.filterForm.valueChanges.pipe(
      map(() => this.filterForm.getRawValue()),
      startWith(this.filterForm.getRawValue()),
    ),
    { initialValue: this.filterForm.getRawValue() },
  );
  readonly entryDraft = toSignal(
    this.entryForm.valueChanges.pipe(
      map(() => this.entryForm.getRawValue()),
      startWith(this.entryForm.getRawValue()),
    ),
    { initialValue: this.entryForm.getRawValue() },
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
  readonly definitionById = computed(
    () =>
      new Map(
        this.definitions().map((definition) => [definition.id, definition]),
      ),
  );
  readonly selectedEntryDefinition = computed(() => {
    const definitionId = this.entryDraft().configDefinitionId;

    return (
      this.definitions().find((definition) => definition.id === definitionId) ??
      null
    );
  });
  readonly selectedEffectiveValue = computed(() => {
    const definition = this.selectedEntryDefinition();
    const valueTarget = this.entryDraft().valueTarget;

    if (!definition) {
      return null;
    }

    const effectiveValues =
      valueTarget === ConfigChangeValueTarget.Global
        ? this.globalEffectiveValues()
        : this.effectiveValues();

    return effectiveValues.get(definition.id) ?? null;
  });
  readonly canEditSelectedChangeSet = computed(
    () => this.selectedChangeSet()?.status === ConfigChangeStatusKey.Draft,
  );
  readonly statusOptions = computed(() =>
    toSelectOptions(uniqueConfigChangeSetStatuses(this.changeSets())),
  );
  readonly visibilityOptions = computed(() =>
    toSelectOptions(uniqueConfigChangeSetVisibilities(this.changeSets())),
  );
  readonly draftVisibilityOptions = toSelectOptions(
    Object.values(ConfigChangeVisibilityKey),
  );
  readonly valueTargetOptions = toSelectOptions(
    Object.values(ConfigChangeValueTarget),
  );
  readonly definitionOptions = computed(() =>
    this.definitions()
      .filter(isConfigDefinitionSupportedInValueDraftEditor)
      .map((definition) => ({
        label: `${definition.key} (${definition.valueType})`,
        value: definition.id,
      })),
  );

  loadData(): void {
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

  createDraftChangeSet(): void {
    this.editorError.set(null);
    this.editorMessage.set(null);

    if (this.draftForm.invalid) {
      this.draftForm.markAllAsTouched();
      return;
    }

    const draft = this.draftForm.getRawValue();
    this.isSavingDraft.set(true);

    this.configChangeSets
      .createDraftChangeSet({
        title: trimText(draft.title),
        reason: trimText(draft.reason),
        changelogVisibility: draft.changelogVisibility,
        changelogTitle: this.nullableTrim(draft.changelogTitle),
        changelogBody: this.nullableTrim(draft.changelogBody),
        requestedBy: this.authState.user()?.id ?? null,
      })
      .pipe(finalize(() => this.isSavingDraft.set(false)))
      .subscribe({
        next: (changeSet) => {
          this.draftForm.reset({
            title: '',
            reason: '',
            changelogVisibility: ConfigChangeVisibilityKey.None,
            changelogTitle: '',
            changelogBody: '',
          });
          this.editorMessage.set('Draft change set created.');
          this.loadChangeSets(changeSet.id);
        },
        error: (error: unknown) =>
          this.editorError.set(
            error instanceof Error
              ? error.message
              : 'Failed to create draft change set.',
          ),
      });
  }

  addConfigValueEntry(): void {
    this.editorError.set(null);
    this.editorMessage.set(null);

    if (!this.canEditSelectedChangeSet()) {
      this.editorError.set('Select a draft change set before adding entries.');
      return;
    }

    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const changeSet = this.selectedChangeSet();
    const definition = this.selectedEntryDefinition();

    if (!changeSet || !definition) {
      this.editorError.set(
        'Select a config definition before adding an entry.',
      );
      return;
    }

    if (!isConfigDefinitionSupportedInValueDraftEditor(definition)) {
      this.editorError.set(
        'This config value type is not supported in the draft editor.',
      );
      return;
    }

    const draft = this.entryForm.getRawValue();
    const serverId = this.resolveEntryServerId(draft.valueTarget);

    if (draft.valueTarget === ConfigChangeValueTarget.Server && !serverId) {
      this.editorError.set(
        'Select an active server before adding a server value change.',
      );
      return;
    }

    let newValue: ReturnType<typeof parseConfigValueInput>;

    try {
      newValue = parseConfigValueInput(draft.newValue, definition.valueType);
    } catch (error) {
      this.editorError.set(
        error instanceof Error ? error.message : 'Invalid config value.',
      );
      return;
    }

    const entryInput = this.buildConfigValueEntryInput(
      changeSet,
      definition,
      draft.valueTarget,
      serverId,
      newValue,
    );
    this.isSavingEntry.set(true);

    this.configChangeSets
      .createConfigValueChangeEntry(entryInput)
      .pipe(finalize(() => this.isSavingEntry.set(false)))
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.entryForm.patchValue({ newValue: '' });
          this.editorMessage.set('Draft change entry added.');
        },
        error: (error: unknown) =>
          this.editorError.set(
            error instanceof Error
              ? error.message
              : 'Failed to add draft change entry.',
          ),
      });
  }

  definitionLabel(entry: ConfigChangeEntry): string {
    if (!entry.configDefinitionId) {
      return '-';
    }

    const definition = this.definitionById().get(entry.configDefinitionId);

    return definition
      ? `${definition.key} (${definition.label})`
      : entry.configDefinitionId;
  }

  jsonPreview(
    value: ConfigChangeEntry['oldValue'] | ConfigChangeEntry['metadata'],
  ): string {
    return formatConfigJsonPreview(value);
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

  private loadChangeSets(selectedChangeSetId?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.configChangeSets
      .getChangeSets()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (changeSets) => {
          this.changeSets.set(changeSets);

          const selectedChangeSet =
            changeSets.find(
              (changeSet) => changeSet.id === selectedChangeSetId,
            ) ??
            changeSets[0] ??
            null;

          if (selectedChangeSet) {
            this.selectedChangeSetId.set(selectedChangeSet.id);
            this.loadEntries(selectedChangeSet.id);
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

  private loadEffectiveValues(definitions: readonly ConfigDefinition[]): void {
    this.configValues
      .getEffectiveValuesForSelectedServer(definitions)
      .subscribe({
        next: (effectiveValues) => this.effectiveValues.set(effectiveValues),
        error: (error: unknown) =>
          this.editorError.set(
            error instanceof Error
              ? error.message
              : 'Failed to load effective config values.',
          ),
      });
  }

  private loadGlobalEffectiveValues(
    definitions: readonly ConfigDefinition[],
  ): void {
    this.configValues.getEffectiveValues(definitions, null).subscribe({
      next: (effectiveValues) =>
        this.globalEffectiveValues.set(effectiveValues),
      error: (error: unknown) =>
        this.editorError.set(
          error instanceof Error
            ? error.message
            : 'Failed to load global config values.',
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

  private resolveEntryServerId(
    valueTarget: ConfigChangeValueTarget,
  ): string | null {
    if (valueTarget === ConfigChangeValueTarget.Global) {
      return null;
    }

    return this.activeServer.selectedServer()?.id ?? null;
  }

  private buildConfigValueEntryInput(
    changeSet: ConfigChangeSet,
    definition: ConfigDefinition,
    valueTarget: ConfigChangeValueTarget,
    serverId: string | null,
    newValue: ReturnType<typeof parseConfigValueInput>,
  ): Parameters<ConfigChangeSets['createConfigValueChangeEntry']>[0] {
    const oldEffectiveValue =
      valueTarget === ConfigChangeValueTarget.Global
        ? (this.globalEffectiveValues().get(definition.id) ?? null)
        : (this.effectiveValues().get(definition.id) ?? null);

    return {
      changeSetId: changeSet.id,
      changeKind:
        valueTarget === ConfigChangeValueTarget.Server
          ? ConfigChangeKindKey.ServerValueChange
          : ConfigChangeKindKey.GlobalValueChange,
      definition,
      serverId,
      oldValue: oldEffectiveValue?.value ?? null,
      newValue,
      oldSource: oldEffectiveValue?.source ?? null,
      oldSourceLabel: oldEffectiveValue?.sourceLabel ?? null,
    };
  }

  private nullableTrim(value: string): string | null {
    return trimToNull(value);
  }
}
