import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ConfigChangeValueTarget } from '../../../core/enums/config-governance.enum';
import {
  ConfigDefinition,
  EffectiveConfigValue,
} from '../../../core/types/config-governance.types';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ConfigValues } from '../../../core/services/config/config-values';

@Injectable()
export class ConfigEffectiveValuesState {
  private readonly configValues = inject(ConfigValues);
  private readonly activeServer = inject(ActiveServer);

  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly effectiveValues = signal(new Map<string, EffectiveConfigValue>());
  readonly globalEffectiveValues = signal(
    new Map<string, EffectiveConfigValue>(),
  );
  readonly error = signal<string | null>(null);
  private readonly selectedServerRefresh = effect(() => {
    this.activeServer.selectedServer()?.id;

    if (this.definitions().length) {
      this.refresh();
    }
  });

  setDefinitions(definitions: readonly ConfigDefinition[]): void {
    this.definitions.set([...definitions]);
  }

  refresh(): void {
    const definitions = this.definitions();

    if (!definitions.length) {
      return;
    }

    this.loadEffectiveValues(definitions);
    this.loadGlobalEffectiveValues(definitions);
  }

  getValue(
    definition: ConfigDefinition,
    target: ConfigChangeValueTarget,
  ): EffectiveConfigValue | null {
    const values =
      target === ConfigChangeValueTarget.Global
        ? this.globalEffectiveValues()
        : this.effectiveValues();

    return values.get(definition.id) ?? null;
  }

  private loadEffectiveValues(definitions: readonly ConfigDefinition[]): void {
    this.configValues.getEffectiveValuesForSelectedServer(definitions).subscribe({
      next: (effectiveValues) => this.effectiveValues.set(effectiveValues),
      error: (error: unknown) =>
        this.error.set(
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
        this.error.set(
          error instanceof Error
            ? error.message
            : 'Failed to load global config values.',
        ),
    });
  }
}
