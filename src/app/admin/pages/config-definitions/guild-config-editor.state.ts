import { Injectable, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { concatMap, from, last, map, switchMap } from 'rxjs';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import {
  ConfigChangeKindKey,
  ConfigChangeValueTarget,
  ConfigChangeVisibilityKey,
} from '../../../core/enums/config-governance.enum';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ConfigChangeSetWorkflow } from '../../../core/services/config/config-change-set-workflow';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigValues } from '../../../core/services/config/config-values';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { ToastService } from '../../../core/services/ui/toast';
import { ConfigDefinition } from '../../../core/types/config-governance.types';
import {
  integerValidator,
  trimRequiredValidator,
} from '../../../core/validators/form.validators';
import { valueTargetForConfigDefinition } from '../../../core/utils/config-governance';

type GuildConfigFieldKey =
  | 'creationDrachmaCost'
  | 'memberBaseLimit'
  | 'memberLimitPerLeaderLevel'
  | 'leaderInactivityThresholdDays'
  | 'nominationDurationMinutes'
  | 'votingDurationMinutes'
  | 'emergencyMaxCandidates'
  | 'armoryCapacity';

type GuildConfigForm = FormGroup<{
  creationDrachmaCost: FormControl<number | null>;
  memberBaseLimit: FormControl<number | null>;
  memberLimitPerLeaderLevel: FormControl<number | null>;
  leaderInactivityThresholdDays: FormControl<number | null>;
  nominationDurationMinutes: FormControl<number | null>;
  votingDurationMinutes: FormControl<number | null>;
  emergencyMaxCandidates: FormControl<number | null>;
  armoryCapacity: FormControl<number | null>;
  reason: FormControl<string>;
}>;

interface GuildConfigChangeDraft {
  fieldKey: GuildConfigFieldKey;
  configDefinitionKey: string;
  newValue: number;
}

const GUILD_CONFIG_DEFINITION_KEYS: Record<GuildConfigFieldKey, string> = {
  creationDrachmaCost: 'guild_creation_drachma_cost',
  memberBaseLimit: 'guild_member_base_limit',
  memberLimitPerLeaderLevel: 'guild_member_limit_per_leader_level',
  leaderInactivityThresholdDays: 'guild_leader_inactivity_threshold_days',
  nominationDurationMinutes: 'guild_emergency_nomination_duration_minutes',
  votingDurationMinutes: 'guild_emergency_voting_duration_minutes',
  emergencyMaxCandidates: 'guild_emergency_max_candidates',
  armoryCapacity: 'guild_armory_capacity',
};

@Injectable()
export class GuildConfigEditorState {
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly configValues = inject(ConfigValues);
  private readonly workflow = inject(ConfigChangeSetWorkflow);
  private readonly playerGuild = inject(PlayerGuild);
  private readonly toast = inject(ToastService);
  private readonly guildConfigManagedEntityKey = 'guild';

  readonly form: GuildConfigForm = new FormGroup({
    creationDrachmaCost: this.integerControl(),
    memberBaseLimit: this.integerControl(),
    memberLimitPerLeaderLevel: this.integerControl(),
    leaderInactivityThresholdDays: this.integerControl(),
    nominationDurationMinutes: this.integerControl(),
    votingDurationMinutes: this.integerControl(),
    emergencyMaxCandidates: this.integerControl(),
    armoryCapacity: this.integerControl(),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [trimRequiredValidator()],
    }),
  });
  readonly config = signal<GuildConfigSummary | null>(null);
  readonly isLoading = signal(false);
  readonly isApplying = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.playerGuild.getGuildConfigSummary().subscribe({
      next: (config) => {
        this.config.set(config);
        this.patchForm(config);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.config.set(null);
        this.error.set(
          error instanceof Error
            ? error.message
            : 'Failed to load guild configuration.',
        );
        this.isLoading.set(false);
      },
    });
  }

  applyGuildConfigChanges(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const config = this.config();
    const changes = config ? this.buildChanges(config) : [];

    if (!config) {
      this.toast.show(
        'error',
        'Guild config update failed',
        'Guild configuration is not loaded.',
      );
      return;
    }

    if (changes.length === 0) {
      this.toast.show('info', 'Guild config', 'No guild config changes to apply.');
      return;
    }

    this.isApplying.set(true);
    this.configDefinitions
      .getActiveDefinitionsByManagedEntityKey(this.guildConfigManagedEntityKey)
      .pipe(
        switchMap((definitions) => {
          const definitionByKey = new Map(
            definitions.map((definition) => [definition.key, definition]),
          );
          const targetDefinitions = changes.map((change) =>
            this.requireDefinition(definitionByKey, change.configDefinitionKey),
          );

          return this.configValues.getEffectiveValues(targetDefinitions, null).pipe(
            map((effectiveValues) => ({
              changes,
              definitionByKey,
              effectiveValues,
            })),
          );
        }),
        switchMap(({ changes, definitionByKey, effectiveValues }) =>
          this.configChangeSets.createDraftChangeSet({
            title: 'Guild configuration update',
            reason: this.form.controls.reason.value.trim(),
            changelogVisibility: ConfigChangeVisibilityKey.None,
            changelogTitle: null,
            changelogBody: null,
          }).pipe(
            switchMap((changeSet) =>
              from(changes).pipe(
                concatMap((change) => {
                  const definition = this.requireDefinition(
                    definitionByKey,
                    change.configDefinitionKey,
                  );
                  const effectiveValue = effectiveValues.get(definition.id) ?? null;
                  const target = valueTargetForConfigDefinition(definition);

                  return this.configChangeSets.createConfigValueChangeEntry({
                    changeSetId: changeSet.id,
                    changeKind:
                      target === ConfigChangeValueTarget.Server
                        ? ConfigChangeKindKey.ServerValueChange
                        : ConfigChangeKindKey.GlobalValueChange,
                    definition,
                    serverId: null,
                    oldValue: effectiveValue?.value ?? null,
                    newValue: change.newValue,
                    oldSource: effectiveValue?.source ?? null,
                    oldSourceLabel: effectiveValue?.sourceLabel ?? null,
                  });
                }),
                last(),
                switchMap(() => this.workflow.markReady(changeSet.id)),
                switchMap(() => this.workflow.apply(changeSet.id)),
              ),
            ),
          ),
        ),
        switchMap(() => this.playerGuild.getGuildConfigSummary()),
      )
      .subscribe({
        next: (config) => {
          this.config.set(config);
          this.patchForm(config);
          this.form.controls.reason.reset('');
          this.isApplying.set(false);
          this.toast.show(
            'success',
            'Guild config updated',
            'Guild configuration changes applied.',
          );
        },
        error: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to apply guild configuration changes.';

          this.isApplying.set(false);
          this.toast.show('error', 'Guild config update failed', message);
        },
      });
  }

  private patchForm(config: GuildConfigSummary): void {
    this.form.patchValue({
      creationDrachmaCost: config.creationDrachmaCost,
      memberBaseLimit: config.memberBaseLimit,
      memberLimitPerLeaderLevel: config.memberLimitPerLeaderLevel,
      leaderInactivityThresholdDays: config.leaderInactivityThresholdDays,
      nominationDurationMinutes: config.nominationDurationMinutes,
      votingDurationMinutes: config.votingDurationMinutes,
      emergencyMaxCandidates: config.emergencyMaxCandidates,
      armoryCapacity: config.armoryCapacity,
    });
  }

  private buildChanges(config: GuildConfigSummary): GuildConfigChangeDraft[] {
    const values = this.form.getRawValue();

    return (Object.keys(GUILD_CONFIG_DEFINITION_KEYS) as GuildConfigFieldKey[])
      .filter((fieldKey) => values[fieldKey] !== config[fieldKey])
      .map((fieldKey) => ({
        fieldKey,
        configDefinitionKey: GUILD_CONFIG_DEFINITION_KEYS[fieldKey],
        newValue: this.requireNumber(values[fieldKey], fieldKey),
      }));
  }

  private requireNumber(
    value: number | null,
    fieldKey: GuildConfigFieldKey,
  ): number {
    if (value === null || !Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid guild config value: ${fieldKey}.`);
    }

    return value;
  }

  private requireDefinition(
    definitions: Map<string, ConfigDefinition>,
    configDefinitionKey: string,
  ): ConfigDefinition {
    const definition = definitions.get(configDefinitionKey);

    if (!definition) {
      throw new Error(`Missing guild config definition: ${configDefinitionKey}.`);
    }

    return definition;
  }

  private integerControl(): FormControl<number | null> {
    return new FormControl<number | null>(0, {
      validators: [Validators.required, Validators.min(0), integerValidator()],
    });
  }
}
