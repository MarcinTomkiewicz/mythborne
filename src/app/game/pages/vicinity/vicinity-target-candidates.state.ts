import { computed, inject, Injectable, signal } from '@angular/core';
import {
  PvpActionStartResult,
  PvpTargetCandidate,
} from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { VICINITY_TARGET_LIMIT } from '../../../core/configs/vicinity.config';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import {
  PendingPvpAction,
  PvpStartActionKind,
  PvpVisibleAddressTargetOverlayInput,
} from '../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';

@Injectable()
export class VicinityTargetCandidatesState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private loadRequestId = 0;
  private overlayRequestId = 0;
  private actionRequestId = 0;
  private lastOverlayInput: PvpVisibleAddressTargetOverlayInput | null = null;

  readonly isLoading = signal(false);
  readonly isVisibleOverlayLoading = signal(false);
  readonly visibleOverlayLoaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly lastStartedAction = signal<PvpActionStartResult | null>(null);
  readonly candidates = signal<PvpTargetCandidate[]>([]);
  readonly visibleTargets = signal<PvpTargetCandidate[]>([]);
  readonly pendingAction = signal<PendingPvpAction | null>(null);
  readonly pendingAttackTargetIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly pendingSpyTargetIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly districtCode = signal<string | null>(null);
  readonly search = signal('');
  readonly limit = signal(VICINITY_TARGET_LIMIT);
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

  loadCandidates(onLoaded?: (candidates: readonly PvpTargetCandidate[]) => void): void {
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.candidates.set([]);
      this.error.set('Brak aktywnego bohatera do wyszukiwania celów PvP.');
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

        this.isLoading.set(false);
        this.candidates.set(candidates);
        onLoaded?.(candidates);
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
        this.error.set(getErrorMessage(error, 'Nie udało się wczytać celów PvP.'));
        this.isLoading.set(false);
      },
    });
  }

  loadVisibleAddressTargetOverlay(input: PvpVisibleAddressTargetOverlayInput): void {
    const requestId = ++this.overlayRequestId;
    const requestContextKey = this.currentContextKey();

    this.lastOverlayInput = input;
    this.isLoading.set(true);
    this.isVisibleOverlayLoading.set(true);
    this.visibleOverlayLoaded.set(false);
    this.error.set(null);

    if (!requestContextKey) {
      this.visibleTargets.set([]);
      this.error.set('Brak aktywnego bohatera do wczytania celów PvP.');
      this.isLoading.set(false);
      this.isVisibleOverlayLoading.set(false);
      this.visibleOverlayLoaded.set(true);
      return;
    }

    this.playerPvp.getVisibleAddressTargetOverlay(input).subscribe({
      next: (targets) => {
        if (requestId !== this.overlayRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.visibleTargets.set([]);
          this.isLoading.set(false);
          this.isVisibleOverlayLoading.set(false);
          return;
        }

        this.visibleTargets.set(targets);
        this.isLoading.set(false);
        this.isVisibleOverlayLoading.set(false);
        this.visibleOverlayLoaded.set(true);
      },
      error: (error: unknown) => {
        if (requestId !== this.overlayRequestId) {
          return;
        }

        if (requestContextKey !== this.currentContextKey()) {
          this.visibleTargets.set([]);
          this.isLoading.set(false);
          this.isVisibleOverlayLoading.set(false);
          return;
        }

        this.visibleTargets.set([]);
        this.error.set(getErrorMessage(error, 'Nie udało się wczytać celów PvP w widocznym zakresie.'));
        this.isLoading.set(false);
        this.isVisibleOverlayLoading.set(false);
        this.visibleOverlayLoaded.set(true);
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
      this.actionError.set(`Brak aktywnego bohatera dla akcji PvP: ${actionLabel(actionKind)}.`);
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
          `${actionLabel(actionKind)} rozpoczęty. Dotarcie za ${durationLabel(result.travelTimeSeconds)}.`,
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
          getErrorMessage(error, `Nie udało się rozpocząć akcji: ${actionLabel(actionKind)}.`),
        );
        this.clearPendingAction(actionKind, targetHeroId);
      },
    });
  }

  setDistrictCode(
    value: string | null,
  ): void {
    this.districtCode.set(trimToNull(value));
    this.offset.set(0);
  }

  setSearch(value: string | null): void {
    this.search.set(trimText(value) ?? '');
    this.offset.set(0);
  }

  setPageSize(value: number): void {
    const nextLimit = Number.isInteger(value) && value > 0
      ? value
      : VICINITY_TARGET_LIMIT;

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
    const overlayInput = this.lastOverlayInput;

    if (!overlayInput) {
      this.clearPendingAction(actionKind, targetHeroId);
      return;
    }

    this.playerPvp.getVisibleAddressTargetOverlay(overlayInput).subscribe({
      next: (candidates) => {
        if (!this.isCurrentAction(requestId, contextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.visibleTargets.set(candidates);
        this.clearPendingAction(actionKind, targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, contextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.actionError.set(
          getErrorMessage(error, 'Akcja PvP została rozpoczęta, ale odświeżenie stanu lub listy celów się nie powiodło.'),
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
  return actionKind === 'attack' ? 'Atak' : 'Szpieg';
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
