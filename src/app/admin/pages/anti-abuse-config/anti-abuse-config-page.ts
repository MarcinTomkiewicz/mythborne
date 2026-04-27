import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigValues } from '../../../core/services/config/config-values';
import { ActiveServer } from '../../../core/services/server/active-server';
import {
  ConfigDefinition,
  EffectiveConfigValue,
} from '../../../core/types/config-governance.types';
import {
  formatConfigJsonPreview,
  formatConfigValuePreview,
  isConfigDefinitionSupportedInValueDraftEditor,
} from '../../../core/utils/config-governance';
import { ANTI_ABUSE_CONFIG_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

const ANTI_ABUSE_MANAGED_ENTITY_KEY = 'anti_abuse';

interface AntiAbuseConfigRow {
  definition: ConfigDefinition;
  effectiveValue: EffectiveConfigValue | null;
  canUseDraftEditor: boolean;
}

@Component({
  selector: 'app-anti-abuse-config-page',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
  ],
  templateUrl: './anti-abuse-config-page.html',
})
export class AntiAbuseConfigPage implements OnInit {
  private readonly activeServer = inject(ActiveServer);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly configValues = inject(ConfigValues);
  private hasInitialized = false;

  readonly links = ANTI_ABUSE_CONFIG_PAGE_LINKS;
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly effectiveValues = signal(new Map<string, EffectiveConfigValue>());
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly rows = computed<AntiAbuseConfigRow[]>(() =>
    this.definitions().map((definition) => ({
      definition,
      effectiveValue: this.effectiveValues().get(definition.id) ?? null,
      canUseDraftEditor: isConfigDefinitionSupportedInValueDraftEditor(definition),
    })),
  );

  constructor() {
    effect(() => {
      this.activeServer.selectedServer()?.id;

      if (this.hasInitialized) {
        this.loadConfigs();
      }
    });
  }

  ngOnInit(): void {
    this.hasInitialized = true;
    this.loadConfigs();
  }

  valuePreview(value: EffectiveConfigValue['value']): string {
    return formatConfigValuePreview(value);
  }

  jsonPreview(value: ConfigDefinition['defaultValue']): string {
    return formatConfigJsonPreview(value);
  }

  private loadConfigs(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.configDefinitions
      .getActiveDefinitionsByManagedEntityKey(ANTI_ABUSE_MANAGED_ENTITY_KEY)
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
              : 'Failed to load anti-abuse config.',
          ),
      });
  }
}
