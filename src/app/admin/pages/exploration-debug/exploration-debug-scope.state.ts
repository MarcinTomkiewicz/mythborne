import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { finalize } from 'rxjs';
import {
  MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
  MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH,
} from '../../../core/constants/moderation-action.const';
import { ModerationHeroTarget } from '../../../core/domain/moderation/moderation-action.model';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { ActiveServer } from '../../../core/services/server/active-server';
import { trimText } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { createExplorationDebugScopeForm } from './exploration-debug-forms';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';

export interface ExplorationDebugScope {
  serverId: string;
  heroId: string;
  explorationDate: string | null;
}

@Injectable()
export class ExplorationDebugScopeState {
  private readonly activeServer = inject(ActiveServer);
  private readonly moderationActions = inject(ModerationActions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(ExplorationDebugFeedbackState);
  private readonly heroSearchToken = new RequestToken();

  readonly scopeForm = new FormGroup(createExplorationDebugScopeForm());
  readonly scopeVersion = signal(0);
  readonly heroTargetSuggestions = signal<ModerationHeroTarget[]>([]);
  readonly isSearchingHeroTargets = signal(false);
  readonly minHeroQueryLength = MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly selectedServerId = computed(() => this.selectedServer()?.id ?? null);
  readonly policy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.selectedServer(),
    }),
  );
  readonly canUseDebugTools = computed(
    () => this.policy().isGlobalAdmin || this.policy().canTestSelectedServer,
  );
  readonly isServerLoading = this.activeServer.isLoading;

  private hasInitialized = false;

  constructor() {
    effect(() => {
      this.selectedServerId();
      this.bumpScopeVersion();
    });

    this.scopeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.bumpScopeVersion());
  }

  loadInitialData(): void {
    this.hasInitialized = true;

    if (this.activeServer.servers().length === 0 && !this.activeServer.isLoading()) {
      this.activeServer
        .loadAccessibleServers()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  currentScope(showValidation: boolean): ExplorationDebugScope | null {
    const serverId = this.selectedServerId();
    const heroId = this.selectedHeroId();

    if (!serverId || !this.canUseDebugTools()) {
      if (showValidation) {
        this.feedback.error.set('Select a server with sandbox testing access first.');
      }
      return null;
    }

    if (!heroId) {
      if (showValidation) {
        this.scopeForm.markAllAsTouched();
        this.feedback.error.set('Select a hero for exploration debug tools.');
      }
      return null;
    }

    return {
      serverId,
      heroId,
      explorationDate: trimText(this.scopeForm.controls.explorationDate.value) || null,
    };
  }

  isCurrentScope(scope: ExplorationDebugScope): boolean {
    return (
      this.selectedServerId() === scope.serverId &&
      this.selectedHeroId() === scope.heroId &&
      (trimText(this.scopeForm.controls.explorationDate.value) || null) ===
        scope.explorationDate
    );
  }

  searchHeroTargets(event: AutoCompleteCompleteEvent): void {
    const query = trimText(event.query);
    const serverId = this.selectedServerId();
    const token = this.heroSearchToken.next();

    if (!serverId || !this.canUseDebugTools()) {
      this.heroTargetSuggestions.set([]);
      this.isSearchingHeroTargets.set(false);
      this.feedback.error.set('Select a server with sandbox testing access first.');
      return;
    }

    if (query.length < this.minHeroQueryLength) {
      this.heroTargetSuggestions.set([]);
      this.isSearchingHeroTargets.set(false);
      return;
    }

    this.isSearchingHeroTargets.set(true);
    this.moderationActions
      .searchHeroTargets({
        serverId,
        query,
        limit: MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
      })
      .pipe(
        finalize(() => {
          if (this.heroSearchToken.isCurrent(token)) {
            this.isSearchingHeroTargets.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => {
          if (!this.heroSearchToken.isCurrent(token)) {
            return;
          }

          this.heroTargetSuggestions.set(targets);
        },
        error: (error: unknown) => {
          if (!this.heroSearchToken.isCurrent(token)) {
            return;
          }

          this.heroTargetSuggestions.set([]);
          this.feedback.error.set(
            error instanceof Error ? error.message : 'Hero target search failed.',
          );
        },
      });
  }

  selectHeroTarget(target: ModerationHeroTarget): void {
    this.scopeForm.controls.heroTarget.setValue(target);
    this.scopeForm.controls.heroId.setValue(target.heroId);
  }

  clearHeroTarget(): void {
    this.scopeForm.controls.heroTarget.setValue(null);
    this.scopeForm.controls.heroId.setValue(null);
  }

  serverLabel(): string {
    const server = this.selectedServer();

    return server ? `${server.name} (${server.kind} / ${server.status})` : '-';
  }

  private bumpScopeVersion(): void {
    this.scopeVersion.update((value) => value + 1);
  }

  private selectedHeroId(): string {
    return (
      this.scopeForm.controls.heroTarget.value?.heroId ??
      trimText(this.scopeForm.controls.heroId.value)
    );
  }
}

