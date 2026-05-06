import { computed, inject, Injectable, signal } from '@angular/core';
import {
  HeroActiveRuntimeActivity,
  PvpActionStartResult,
  PvpTargetCandidate,
} from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';

const DEFAULT_TARGET_LIMIT = 20;

@Injectable()
export class VicinityTargetCandidatesState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private loadRequestId = 0;
  private actionRequestId = 0;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly lastStartedAction = signal<PvpActionStartResult | null>(null);
  readonly activeRuntimeActivity = signal<HeroActiveRuntimeActivity | null>(null);
  readonly candidates = signal<PvpTargetCandidate[]>([]);
  readonly pendingSpyTargetIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly districtCode = signal<string | null>(null);
  readonly search = signal('');
  readonly limit = signal(DEFAULT_TARGET_LIMIT);
  readonly offset = signal(0);
  readonly hasCandidates = computed(() => this.candidates().length > 0);
  readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.candidates().length === 0,
  );
  readonly canGoPrevious = computed(() => this.offset() > 0 && !this.isLoading());
  readonly canGoNext = computed(
    () => this.candidates().length === this.limit() && !this.isLoading(),
  );

  isSpyPending(targetHeroId: string): boolean {
    return this.pendingSpyTargetIds().has(targetHeroId);
  }

  startSpy(candidate: PvpTargetCandidate): void {
    if (!candidate.spyEligibility.canStart || this.isSpyPending(candidate.targetHeroId)) {
      return;
    }

    const requestId = ++this.actionRequestId;
    const requestContextKey = this.currentContextKey();
    const targetHeroId = candidate.targetHeroId;

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.lastStartedAction.set(null);

    if (!requestContextKey) {
      this.actionError.set('No active hero for PvP spy action.');
      return;
    }

    this.addPendingSpyTarget(targetHeroId);

    this.playerPvp.startAction({
      actionKind: 'spy',
      targetHeroId,
      requestId: pvpSpyRequestId(targetHeroId),
    }).subscribe({
      next: (result) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingSpyTarget(targetHeroId);
          return;
        }

        this.lastStartedAction.set(result);
        this.refreshActiveRuntimeActivity(requestId, requestContextKey);
        this.actionSuccess.set(
          `Spy travel started. Arrival in ${durationLabel(result.travelTimeSeconds)}.`,
        );
        this.clearPendingSpyTarget(targetHeroId);
        this.loadCandidates();
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingSpyTarget(targetHeroId);
          return;
        }

        this.actionError.set(getErrorMessage(error, 'Failed to start spy action.'));
        this.clearPendingSpyTarget(targetHeroId);
      },
    });
  }

  loadCandidates(): void {
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.candidates.set([]);
      this.error.set('No active hero for PvP target search.');
      this.isLoading.set(false);
      return;
    }

    this.playerPvp.getTargetCandidates({
      districtCode: this.districtCode(),
      limit: this.limit(),
      offset: this.offset(),
      search: trimText(this.search()),
    }).subscribe({
      next: (candidates) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.candidates.set([]);
          this.isLoading.set(false);
          return;
        }

        this.candidates.set(candidates);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.candidates.set([]);
          this.isLoading.set(false);
          return;
        }

        this.candidates.set([]);
        this.error.set(getErrorMessage(error, 'Failed to load PvP targets.'));
        this.isLoading.set(false);
      },
    });
  }

  setDistrictCode(value: string | null): void {
    this.districtCode.set(trimToNull(value));
    this.offset.set(0);
    this.loadCandidates();
  }

  setSearch(value: string | null): void {
    this.search.set(trimText(value) ?? '');
    this.offset.set(0);
    this.loadCandidates();
  }

  setPageSize(value: number): void {
    const nextLimit = Number.isInteger(value) && value > 0
      ? value
      : DEFAULT_TARGET_LIMIT;

    this.limit.set(nextLimit);
    this.offset.set(0);
    this.loadCandidates();
  }

  nextPage(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.offset.update((value) => value + this.limit());
    this.loadCandidates();
  }

  previousPage(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    this.offset.update((value) => Math.max(0, value - this.limit()));
    this.loadCandidates();
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private isCurrentAction(
    requestId: number,
    contextKey: string,
  ): boolean {
    return requestId === this.actionRequestId
      && contextKey === this.currentContextKey();
  }

  private refreshActiveRuntimeActivity(requestId: number, contextKey: string): void {
    this.playerPvp.getActiveRuntimeActivity().subscribe({
      next: (activity) => {
        if (requestId !== this.actionRequestId || contextKey !== this.currentContextKey()) {
          return;
        }

        this.activeRuntimeActivity.set(activity);
      },
      error: (error: unknown) => {
        if (requestId !== this.actionRequestId || contextKey !== this.currentContextKey()) {
          return;
        }

        this.actionError.set(
          getErrorMessage(error, 'Spy started, but active runtime activity refresh failed.'),
        );
      },
    });
  }

  private addPendingSpyTarget(targetHeroId: string): void {
    this.pendingSpyTargetIds.update((current) =>
      new Set([...current, targetHeroId]),
    );
  }

  private clearPendingSpyTarget(targetHeroId: string): void {
    this.pendingSpyTargetIds.update((current) => {
      const next = new Set(current);
      next.delete(targetHeroId);
      return next;
    });
  }
}

function toContextKey(state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}

function pvpSpyRequestId(targetHeroId: string): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `pvp-spy:${targetHeroId}:${randomId}`;
}

function durationLabel(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}
