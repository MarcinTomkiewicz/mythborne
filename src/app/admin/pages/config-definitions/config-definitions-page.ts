import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize, map, startWith, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { CONFIG_DEFINITIONS_PAGE_LINKS } from '../../admin-navigation.config';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigValues } from '../../../core/services/config/config-values';
import {
  ConfigDefinition,
  EffectiveConfigValue,
} from '../../../core/types/config-governance.types';
import { ConfigDefinitionsFormFactory } from '../../../core/factories/forms/config-definitions-form.factory';
import {
  filterConfigDefinitions,
  formatConfigJsonPreview,
  formatConfigValuePreview,
  uniqueConfigDefinitionManagedEntityTypes,
  uniqueConfigDefinitionScopes,
} from '../../../core/utils/config-governance';

@Component({
  selector: 'app-config-definitions-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    LoadingOverlay,
    AdminTagLinks,
  ],
  templateUrl: './config-definitions-page.html',
})
export class ConfigDefinitionsPage implements OnInit {
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly configValues = inject(ConfigValues);
  private readonly formFactory = inject(ConfigDefinitionsFormFactory);

  readonly links = CONFIG_DEFINITIONS_PAGE_LINKS;
  readonly filterForm = this.formFactory.createFilterForm();
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly effectiveValues = signal(new Map<string, EffectiveConfigValue>());
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filters = toSignal(
    this.filterForm.valueChanges.pipe(
      map(() => this.filterForm.getRawValue()),
      startWith(this.filterForm.getRawValue()),
    ),
    { initialValue: this.filterForm.getRawValue() },
  );
  readonly filteredDefinitions = computed(() =>
    filterConfigDefinitions(this.definitions(), this.filters()),
  );
  readonly governanceScopeOptions = computed(() =>
    this.toOptions(uniqueConfigDefinitionScopes(this.definitions())),
  );
  readonly managedEntityTypeOptions = computed(() =>
    this.toOptions(uniqueConfigDefinitionManagedEntityTypes(this.definitions())),
  );

  ngOnInit(): void {
    this.loadDefinitions();
  }

  jsonPreview(value: ConfigDefinition['valueSchema'] | ConfigDefinition['defaultValue']): string {
    return formatConfigJsonPreview(value);
  }

  valuePreview(value: EffectiveConfigValue['value']): string {
    return formatConfigValuePreview(value);
  }

  effectiveValue(definition: ConfigDefinition): EffectiveConfigValue | null {
    return this.effectiveValues().get(definition.id) ?? null;
  }

  private toOptions<T extends string>(values: T[]): Array<{ label: string; value: T }> {
    return values.map((value) => ({
      label: value,
      value,
    }));
  }

  private loadDefinitions() {
    this.isLoading.set(true);
    this.error.set(null);

    this.configDefinitions
      .getDefinitions()
      .pipe(
        switchMap((definitions) =>
          this.configValues.getEffectiveValuesForSelectedServer(definitions).pipe(
            map((effectiveValues) => ({ definitions, effectiveValues })),
          ),
        ),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: ({ definitions, effectiveValues }) => {
          this.definitions.set(definitions);
          this.effectiveValues.set(effectiveValues);
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load config definitions.',
          ),
      });
  }
}
