import { Injectable, computed, inject } from '@angular/core';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ModerationHeroTarget } from '../../../core/domain/moderation/moderation-action.model';
import { ExplorationDebugActionsState } from './exploration-debug-actions.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationDebugScopeState } from './exploration-debug-scope.state';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';
import { ExplorationDebugRuntimeState } from './exploration-debug-runtime.state';
import { ExplorationTimerConfigState } from './exploration-timer-config.state';
import { ExplorationSmokeReadinessState } from './exploration-smoke-readiness.state';

@Injectable()
export class ExplorationDebugPageState {
  readonly scope = inject(ExplorationDebugScopeState);
  readonly definitions = inject(ExplorationDefinitionsState);
  readonly runtime = inject(ExplorationDebugRuntimeState);
  readonly actions = inject(ExplorationDebugActionsState);
  readonly feedback = inject(ExplorationDebugFeedbackState);
  readonly timerConfig = inject(ExplorationTimerConfigState);
  readonly smokeReadiness = inject(ExplorationSmokeReadinessState);

  readonly scopeForm = this.scope.scopeForm;
  readonly selectedServer = this.scope.selectedServer;
  readonly canUseDebugTools = this.scope.canUseDebugTools;
  readonly heroTargetSuggestions = this.scope.heroTargetSuggestions;
  readonly minHeroQueryLength = this.scope.minHeroQueryLength;
  readonly hasActiveDifficulties = this.definitions.hasActiveDifficulties;
  readonly debugState = this.runtime.debugState;
  readonly error = computed(() => this.feedback.error() ?? this.definitions.error());
  readonly isLoading = computed(
    () =>
      this.scope.isServerLoading() ||
      this.definitions.isLoadingDefinitions() ||
      this.smokeReadiness.isLoading() ||
      this.timerConfig.isLoading() ||
      this.runtime.isLoadingState() ||
      this.actions.isRunningAction(),
  );

  loadInitialData(): void {
    this.scope.loadInitialData();
    this.definitions.loadDefinitions();
    this.smokeReadiness.load();
  }

  loadDebugState(): void {
    this.runtime.loadDebugState();
  }

  searchHeroTargets(event: AutoCompleteCompleteEvent): void {
    this.scope.searchHeroTargets(event);
  }

  selectHeroTarget(target: ModerationHeroTarget): void {
    this.scope.selectHeroTarget(target);
  }

  clearHeroTarget(): void {
    this.scope.clearHeroTarget();
  }

  serverLabel(): string {
    return this.scope.serverLabel();
  }
}

