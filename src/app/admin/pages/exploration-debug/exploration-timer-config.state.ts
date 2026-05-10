import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import {
  ExplorationStepDurationConfigExplainability,
  ExplorationStepDurationConfigReadModel,
} from '../../../core/domain/exploration/exploration-timer-config.model';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ExplorationDefinitions } from '../../../core/services/exploration/exploration-definitions';
import { toBuildingDurationLabel } from '../../../core/utils/building-display';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationDebugScopeState } from './exploration-debug-scope.state';

const STEP_DURATION_CONFIG_KEYS = new Set(['exploration_step_duration_seconds']);

@Injectable()
export class ExplorationTimerConfigState {
  private readonly definitions = inject(ExplorationDefinitionsState);
  private readonly explorationDefinitions = inject(ExplorationDefinitions);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly scope = inject(ExplorationDebugScopeState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly durations = signal<ExplorationStepDurationConfigReadModel[]>([]);
  readonly configExplainability = signal<ExplorationStepDurationConfigExplainability[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly configExplainabilityIssue = signal<string | null>(null);
  readonly hasConfigExplainability = computed(() => this.configExplainability().length > 0);
  readonly missingConfigContractMessage = computed(() =>
    this.durations().length === 0 || this.hasConfigExplainability()
      ? null
      : this.configExplainabilityIssue() ??
        'DB did not expose base/global/server step-duration config explainability for this server. The effective duration still comes from get_exploration_step_duration_seconds(...).',
  );

  constructor() {
    effect(() => {
      const serverId = this.scope.selectedServerId();
      const canUseDebugTools = this.scope.canUseDebugTools();
      const difficulties = this.definitions.difficulties();

      if (!serverId || !canUseDebugTools || difficulties.length === 0) {
        this.loadToken.next();
        this.durations.set([]);
        this.configExplainability.set([]);
        this.isLoading.set(false);
        this.error.set(null);
        this.configExplainabilityIssue.set(null);
        return;
      }

      this.load(serverId);
    });
  }

  durationLabel(seconds: number): string {
    return toBuildingDurationLabel(seconds);
  }

  multiplierLabel(value: number): string {
    return `${value}x`;
  }

  inferredBaseLabel(row: ExplorationStepDurationConfigReadModel): string {
    return row.inferredBaseDurationSeconds === null
      ? 'Not inferable from DB values'
      : this.durationLabel(Math.round(row.inferredBaseDurationSeconds));
  }

  effectiveValueLabel(entry: ExplorationStepDurationConfigExplainability): string {
    return typeof entry.effectiveValue === 'object'
      ? JSON.stringify(entry.effectiveValue)
      : String(entry.effectiveValue);
  }

  private load(serverId: string): void {
    const token = this.loadToken.next();
    const difficulties = this.definitions.difficulties();
    let pendingLoads = 2;
    const finishLoad = () => {
      pendingLoads -= 1;

      if (pendingLoads === 0 && this.loadToken.isCurrent(token)) {
        this.isLoading.set(false);
      }
    };

    this.isLoading.set(true);
    this.error.set(null);
    this.configExplainabilityIssue.set(null);

    const durationRows = difficulties.map((difficulty) =>
      this.explorationDefinitions.getStepDurationSeconds({
            serverId,
            difficultyKey: difficulty.key,
          })
        .pipe(
          map((effectiveDurationSeconds) => ({
            serverId,
            difficultyKey: difficulty.key,
            difficultyLabel: difficulty.label,
            stepDurationMultiplier: difficulty.stepDurationMultiplier,
            effectiveDurationSeconds,
            inferredBaseDurationSeconds: difficulty.stepDurationMultiplier > 0
              ? effectiveDurationSeconds / difficulty.stepDurationMultiplier
              : null,
          })),
        ),
    );

    forkJoin(durationRows)
      .pipe(
        finalize(finishLoad),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (durations) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.durations.set(durations);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.durations.set([]);
          this.error.set(getErrorMessage(error, 'Failed to load exploration step durations.'));
        },
      });

    this.configDefinitions
      .getDefinitionExplainability({
        serverId,
        includeInactive: true,
      })
      .pipe(
        map((entries) => entries.filter(isExplorationStepDurationConfig)),
        finalize(finishLoad),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (configExplainability) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.configExplainability.set(configExplainability);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.configExplainability.set([]);
          this.configExplainabilityIssue.set(
            `${getErrorMessage(error, 'Failed to load exploration step duration config explainability.')} Effective duration still comes from get_exploration_step_duration_seconds(...).`,
          );
        },
      });
  }
}

function isExplorationStepDurationConfig(
  entry: ExplorationStepDurationConfigExplainability,
): boolean {
  return STEP_DURATION_CONFIG_KEYS.has(entry.configKey);
}
