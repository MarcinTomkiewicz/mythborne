import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import {
  ConfigChangeKindKey,
  ConfigChangeValueTarget,
} from '../../../core/enums/config-governance.enum';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
  ConfigDefinition,
} from '../../../core/types/config-governance.types';
import {
  isConfigDefinitionSupportedInValueDraftEditor,
  parseConfigValueInput,
  valueTargetForConfigDefinition,
} from '../../../core/utils/config-governance';
import { runRequest } from '../../../core/utils/request-state';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { ConfigEffectiveValuesState } from './config-effective-values.state';

@Injectable()
export class ConfigValueEntryDraftState {
  private readonly activeServer = inject(ActiveServer);
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly effectiveValues = inject(ConfigEffectiveValuesState);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);
  private readonly toast = inject(ToastService);

  readonly form = this.formFactory.createEntryDraftForm();
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly draft = toSignal(
    this.form.valueChanges.pipe(
      map(() => this.form.getRawValue()),
      startWith(this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() },
  );
  readonly selectedDefinition = computed(() => {
    const definitionId = this.draft().configDefinitionId;

    return (
      this.definitions().find((definition) => definition.id === definitionId) ??
      null
    );
  });
  readonly selectedEffectiveValue = computed(() => {
    const definition = this.selectedDefinition();

    return definition
      ? this.effectiveValues.getValue(definition, this.draft().valueTarget)
      : null;
  });
  readonly definitionOptions = computed(() =>
    this.definitions()
      .filter(isConfigDefinitionSupportedInValueDraftEditor)
      .map((definition) => ({
        label: `${definition.key} (${definition.valueType})`,
        value: definition.id,
      })),
  );
  readonly canSubmitEntry = computed(() => {
    const definition = this.selectedDefinition();

    if (!definition || this.form.invalid) {
      return false;
    }

    return (
      valueTargetForConfigDefinition(definition) === ConfigChangeValueTarget.Global ||
      !!this.activeServer.selectedServer()
    );
  });
  readonly valueTargetMessage = computed(() => {
    const definition = this.selectedDefinition();

    if (!definition) {
      return null;
    }

    if (valueTargetForConfigDefinition(definition) === ConfigChangeValueTarget.Global) {
      return 'This config is governed globally; the entry will change the global value.';
    }

    return this.activeServer.selectedServer()
      ? 'This config is governed per server; the entry will change the selected server value.'
      : 'Select an active server before adding this server-scoped config change.';
  });

  constructor() {
    this.form.controls.configDefinitionId.valueChanges.subscribe(() =>
      this.syncValueTargetWithDefinition(),
    );
  }

  setDefinitions(definitions: readonly ConfigDefinition[]): void {
    this.definitions.set([...definitions]);
  }

  addEntry(
    changeSet: ConfigChangeSet | null,
    canEdit: boolean,
    onEntriesLoaded: (entries: ConfigChangeEntry[]) => void,
  ): void {
    this.error.set(null);
    this.message.set(null);

    if (!canEdit) {
      this.error.set('Select a draft change set before adding entries.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const definition = this.selectedDefinition();

    if (!changeSet || !definition) {
      this.error.set('Select a config definition before adding an entry.');
      return;
    }

    if (!isConfigDefinitionSupportedInValueDraftEditor(definition)) {
      this.error.set(
        'This config value type is not supported in the draft editor.',
      );
      return;
    }

    const draft = this.form.getRawValue();
    const valueTarget = valueTargetForConfigDefinition(definition);
    const serverId = this.resolveServerId(valueTarget);

    if (valueTarget === ConfigChangeValueTarget.Server && !serverId) {
      const message = 'Select an active server before adding a server value change.';

      this.error.set(message);
      this.toast.show('error', 'Cannot add config entry', message);
      return;
    }

    const newValue = this.parseNewValue(draft.newValue, definition);

    if (newValue === null) {
      return;
    }

    runRequest({
      request$: this.configChangeSets.createConfigValueChangeEntry({
        changeSetId: changeSet.id,
        changeKind:
          valueTarget === ConfigChangeValueTarget.Server
            ? ConfigChangeKindKey.ServerValueChange
            : ConfigChangeKindKey.GlobalValueChange,
        definition,
        serverId,
        oldValue: this.selectedEffectiveValue()?.value ?? null,
        newValue,
        oldSource: this.selectedEffectiveValue()?.source ?? null,
        oldSourceLabel: this.selectedEffectiveValue()?.sourceLabel ?? null,
      }),
      loading: this.isSaving,
      error: this.error,
      message: this.message,
      successMessage: 'Draft change entry added.',
      errorMessage: 'Failed to add draft change entry.',
      onSuccessMessage: (message) =>
        this.toast.show('success', 'Entry added', message),
      onError: (message) =>
        this.toast.show('error', 'Cannot add config entry', message),
      onSuccess: (entries) => {
        this.resetNewValueControl();
        onEntriesLoaded(entries);
      },
    });
  }

  private parseNewValue(
    value: string,
    definition: ConfigDefinition,
  ): ReturnType<typeof parseConfigValueInput> | null {
    try {
      return parseConfigValueInput(value, definition.valueType);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Invalid config value.',
      );
      return null;
    }
  }

  private resolveServerId(target: ConfigChangeValueTarget): string | null {
    return target === ConfigChangeValueTarget.Global
      ? null
      : (this.activeServer.selectedServer()?.id ?? null);
  }

  private syncValueTargetWithDefinition(): void {
    const definitionId = this.form.controls.configDefinitionId.value;
    const definition =
      this.definitions().find((entry) => entry.id === definitionId) ?? null;

    if (!definition) {
      return;
    }

    const valueTarget = valueTargetForConfigDefinition(definition);

    if (this.form.controls.valueTarget.value !== valueTarget) {
      this.form.controls.valueTarget.setValue(valueTarget, { emitEvent: false });
    }
  }

  private resetNewValueControl(): void {
    const control = this.form.controls.newValue;

    control.reset('');
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }
}
