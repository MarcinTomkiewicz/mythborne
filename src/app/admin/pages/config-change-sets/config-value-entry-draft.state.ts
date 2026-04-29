import { Injectable, computed, effect, inject, signal } from '@angular/core';
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
  ConfigDefinitionExplainability,
} from '../../../core/types/config-governance.types';
import {
  isConfigDefinitionSupportedInValueDraftEditor,
  parseConfigValueInput,
  valueTargetForConfigDefinition,
} from '../../../core/utils/config-governance';
import { runRequest } from '../../../core/utils/request-state';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { ConfigEffectiveValuesState } from './config-effective-values.state';

@Injectable()
export class ConfigValueEntryDraftState {
  private readonly activeServer = inject(ActiveServer);
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly effectiveValues = inject(ConfigEffectiveValuesState);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);
  private readonly toast = inject(ToastService);

  readonly form = this.formFactory.createEntryDraftForm();
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly managedEntityKey = signal<string | null>(null);
  readonly explainability = signal<ConfigDefinitionExplainability[]>([]);
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
  readonly selectedDefinitionExplainability = computed(() => {
    const definition = this.selectedDefinition();

    if (!definition) {
      return null;
    }

    return (
      this.explainability().find(
        (entry) => entry.configDefinitionId === definition.id,
      ) ?? null
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
      .map((definition) => {
        const explainability =
          this.explainability().find(
            (entry) => entry.configDefinitionId === definition.id,
          ) ?? null;

        return {
          label: explainability
            ? `${explainability.label} (${explainability.valueTypeLabel})`
            : `${definition.key} (${definition.valueType})`,
        value: definition.id,
        };
      }),
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

    const explainability = this.selectedDefinitionExplainability();

    if (explainability) {
      return `${explainability.expectedChangeKindLabel}: ${explainability.appliesToDescription}`;
    }

    if (valueTargetForConfigDefinition(definition) === ConfigChangeValueTarget.Global) {
      return 'This config entry will change the global value.';
    }

    return this.activeServer.selectedServer()
      ? 'This config entry will change the selected server value.'
      : 'Select an active server before adding this server-scoped config change.';
  });
  readonly selectedServerContext = computed(() => {
    const server = this.activeServer.selectedServer();

    return server ? `${server.name} (${server.kind} / ${server.status})` : null;
  });

  constructor() {
    this.form.controls.configDefinitionId.valueChanges.subscribe(() =>
      this.syncValueTargetWithDefinition(),
    );

    effect(() => {
      this.activeServer.selectedServer()?.id;
      this.managedEntityKey();

      if (this.definitions().length) {
        this.loadExplainability();
      }
    });
  }

  setDefinitions(
    definitions: readonly ConfigDefinition[],
    managedEntityKey: string | null,
  ): void {
    this.definitions.set([...definitions]);
    this.managedEntityKey.set(managedEntityKey);
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

  private loadExplainability(): void {
    this.configDefinitions
      .getDefinitionExplainability({
        serverId: this.activeServer.selectedServer()?.id ?? null,
        managedEntityKey: this.managedEntityKey(),
        includeInactive: true,
      })
      .subscribe({
        next: (entries) => this.explainability.set(entries),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load config explainability.',
          ),
      });
  }

  private resetNewValueControl(): void {
    const control = this.form.controls.newValue;

    control.reset('');
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }
}
