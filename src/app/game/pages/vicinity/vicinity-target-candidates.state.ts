import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
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
import {
  pvpRuntimeActivityDisplay,
} from '../../../core/utils/pvp-runtime-activity-display';

const DEFAULT_TARGET_LIMIT = 20;
type PvpStartActionKind = 'attack' | 'spy';

interface PendingPvpAction {
  actionKind: PvpStartActionKind;
  targetHeroId: string;
}

@Injectable()
export class VicinityTargetCandidatesState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private loadRequestId = 0;
  private runtimeActivityRequestId = 0;
  private actionRequestId = 0;

  readonly isLoading = signal(false);
  readonly isLoadingRuntimeActivity = signal(false);
  readonly error = signal<string | null>(null);
  readonly runtimeActivityError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly lastStartedAction = signal<PvpActionStartResult | null>(null);
  readonly activeRuntimeActivity = signal<HeroActiveRuntimeActivity | null>(null);
  readonly candidates = signal<PvpTargetCandidate[]>([]);
  readonly pendingAction = signal<PendingPvpAction | null>(null);
  readonly pendingAttackTargetIds = signal<ReadonlySet<string>>(new Set<string>());
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
  readonly isStartingAction = computed(() => this.pendingAction() !== null);
  readonly activePvpRuntimeActivity = computed(() =>
    pvpRuntimeActivityDisplay(this.activeRuntimeActivity()),
  );

  isSpyPending(targetHeroId: string): boolean {
    return this.pendingSpyTargetIds().has(targetHeroId);
  }

  isAttackPending(targetHeroId: string): boolean {
    return this.pendingAttackTargetIds().has(targetHeroId);
  }

  startAttack(candidate: PvpTargetCandidate): void {
    if (
      !candidate.attackEligibility.canStart ||
      this.isStartingAction() ||
      this.isAttackPending(candidate.targetHeroId)
    ) {
      return;
    }

    this.startAction(candidate, 'attack');
  }

  startSpy(candidate: PvpTargetCandidate): void {
    if (
      !candidate.spyEligibility.canStart ||
      this.isStartingAction() ||
      this.isSpyPending(candidate.targetHeroId)
    ) {
      return;
    }

    this.startAction(candidate, 'spy');
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

  loadActiveRuntimeActivity(): void {
    const requestId = ++this.runtimeActivityRequestId;
    const requestContextKey = this.currentContextKey();

    this.isLoadingRuntimeActivity.set(true);
    this.runtimeActivityError.set(null);

    if (!requestContextKey) {
      this.activeRuntimeActivity.set(null);
      this.runtimeActivityError.set('No active hero for PvP runtime activity.');
      this.isLoadingRuntimeActivity.set(false);
      return;
    }

    this.playerPvp.getActiveRuntimeActivity().subscribe({
      next: (activity) => {
        if (requestId !== this.runtimeActivityRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.activeRuntimeActivity.set(null);
          this.isLoadingRuntimeActivity.set(false);
          return;
        }

        this.activeRuntimeActivity.set(activity);
        this.isLoadingRuntimeActivity.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.runtimeActivityRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.activeRuntimeActivity.set(null);
          this.isLoadingRuntimeActivity.set(false);
          return;
        }

        this.activeRuntimeActivity.set(null);
        this.runtimeActivityError.set(
          getErrorMessage(error, 'Failed to load PvP runtime activity.'),
        );
        this.isLoadingRuntimeActivity.set(false);
      },
    });
  }

  private startAction(
    candidate: PvpTargetCandidate,
    actionKind: PvpStartActionKind,
  ): void {
    if (this.isStartingAction()) {
      return;
    }

    const requestId = ++this.actionRequestId;
    const requestContextKey = this.currentContextKey();
    const targetHeroId = candidate.targetHeroId;

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.lastStartedAction.set(null);

    if (!requestContextKey) {
      this.actionError.set(`No active hero for PvP ${actionKind} action.`);
      return;
    }

    this.setPendingAction(actionKind, targetHeroId);

    this.playerPvp.startAction({
      actionKind,
      targetHeroId,
      requestId: pvpActionRequestId(actionKind, targetHeroId),
    }).subscribe({
      next: (result) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.actionSuccess.set(
          `${actionLabel(actionKind)} travel started. Arrival in ${durationLabel(result.travelTimeSeconds)}.`,
        );
        this.lastStartedAction.set(result);
        this.refreshAfterActionStart(requestId, requestContextKey, actionKind, targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.actionError.set(
          getErrorMessage(error, `Failed to start ${actionKind} action.`),
        );
        this.clearPendingAction(actionKind, targetHeroId);
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

  private refreshAfterActionStart(
    requestId: number,
    contextKey: string,
    actionKind: PvpStartActionKind,
    targetHeroId: string,
  ): void {
    forkJoin({
      activity: this.playerPvp.getActiveRuntimeActivity(),
      candidates: this.playerPvp.getTargetCandidates({
        districtCode: this.districtCode(),
        limit: this.limit(),
        offset: this.offset(),
        search: trimText(this.search()),
      }),
    }).subscribe({
      next: ({ activity, candidates }) => {
        if (!this.isCurrentAction(requestId, contextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.activeRuntimeActivity.set(activity);
        this.candidates.set(candidates);
        this.clearPendingAction(actionKind, targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, contextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.actionError.set(
          getErrorMessage(error, 'PvP action started, but runtime activity or target refresh failed.'),
        );
        this.clearPendingAction(actionKind, targetHeroId);
      },
    });
  }

  private setPendingAction(actionKind: PvpStartActionKind, targetHeroId: string): void {
    this.pendingAction.set({ actionKind, targetHeroId });
    this.pendingSignal(actionKind).update((current) => new Set([...current, targetHeroId]));
  }

  private clearPendingAction(actionKind: PvpStartActionKind, targetHeroId: string): void {
    const pending = this.pendingAction();

    if (pending?.actionKind === actionKind && pending.targetHeroId === targetHeroId) {
      this.pendingAction.set(null);
    }

    this.pendingSignal(actionKind).update((current) => {
      const next = new Set(current);
      next.delete(targetHeroId);
      return next;
    });
  }

  private pendingSignal(actionKind: PvpStartActionKind) {
    return actionKind === 'attack'
      ? this.pendingAttackTargetIds
      : this.pendingSpyTargetIds;
  }
}

function toContextKey(state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}

function pvpActionRequestId(actionKind: PvpStartActionKind, targetHeroId: string): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `pvp-${actionKind}:${targetHeroId}:${randomId}`;
}

function actionLabel(actionKind: PvpStartActionKind): string {
  return actionKind === 'attack' ? 'Attack' : 'Spy';
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
