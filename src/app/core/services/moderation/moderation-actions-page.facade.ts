import { DestroyRef, Injectable, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { resolveStaffAccessPolicy } from '../../utils/staff-access-policy';
import { ActiveServer } from '../server/active-server';
import { ModerationActionCreateActions } from './moderation-action-create.actions';
import { ModerationActionDictionariesState } from './moderation-action-dictionaries.state';
import { ModerationActionHistoryState } from './moderation-action-history.state';

@Injectable()
export class ModerationActionsPageFacade {
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);

  readonly dictionaries = inject(ModerationActionDictionariesState);
  readonly create = inject(ModerationActionCreateActions);
  readonly history = inject(ModerationActionHistoryState);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly selectedServerId = computed(() => this.selectedServer()?.id ?? null);
  readonly policy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.selectedServer(),
    }),
  );
  readonly canModerate = computed(() =>
    this.policy().isGlobalAdmin || this.policy().canModerateSelectedServer,
  );
  readonly visibleActionTypes = computed(() =>
    this.dictionaries.visibleActionTypes(this.policy()),
  );
  readonly selectedActionType = computed(() =>
    this.dictionaries.selectedActionType(this.create.selectedActionTypeKey()),
  );
  readonly scopeOptions = computed(() => this.dictionaries.scopeOptions());
  readonly isLoading = computed(
    () => this.dictionaries.isLoading() || this.history.isLoading(),
  );
  readonly error = computed(
    () =>
      this.dictionaries.error() ??
      this.create.error() ??
      this.history.error(),
  );

  private hasInitialized = false;

  constructor() {
    effect(() => {
      this.selectedServerId();

      if (this.hasInitialized) {
        this.loadPageData();
      }
    });

    effect(() => {
      this.create.ensureSelectedActionType(this.visibleActionTypes());
    });
  }

  loadInitialData(): void {
    this.hasInitialized = true;

    if (this.activeServer.servers().length === 0 && !this.activeServer.isLoading()) {
      this.activeServer
        .loadAccessibleServers()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.loadPageData());
      return;
    }

    this.loadPageData();
  }

  onActionTypeChange(): void {
    this.create.onActionTypeChange(this.selectedActionType());
  }

  createAction(): void {
    this.create.createAction(
      this.selectedServerId(),
      this.canModerate(),
      this.selectedActionType(),
      () => this.loadHistory(),
    );
  }

  loadHistory(): void {
    this.history.loadHistory(this.selectedServerId(), this.canModerate());
  }

  resetHistoryFilters(): void {
    this.history.resetHistoryFilters(this.selectedServerId(), this.canModerate());
  }

  actionTypeLabel(key: string): string {
    return this.dictionaries.actionTypeLabel(key);
  }

  scopeLabel(key: string | null): string {
    return this.dictionaries.scopeLabel(key);
  }

  private loadPageData(): void {
    if (!this.selectedServerId() || !this.canModerate()) {
      this.dictionaries.reset();
      this.create.reset();
      this.history.reset();
      return;
    }

    this.dictionaries.load(this.selectedServerId(), this.canModerate());
    this.loadHistory();
  }
}
