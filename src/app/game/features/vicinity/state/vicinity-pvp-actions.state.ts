import { computed, inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import {
  PendingPvpAction,
  PvpStartActionKind,
} from '../../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class VicinityPvpActionsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private requestId = 0;

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly pendingAction = signal<PendingPvpAction | null>(null);
  readonly pendingAttackTargetIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly pendingSpyTargetIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly isStartingAction = computed(() => this.pendingAction() !== null);

  isSpyPending(targetHeroId: string): boolean {
    return this.pendingSpyTargetIds().has(targetHeroId);
  }

  isAttackPending(targetHeroId: string): boolean {
    return this.pendingAttackTargetIds().has(targetHeroId);
  }

  start(input: {
    candidate: PvpTargetCandidate;
    actionKind: PvpStartActionKind;
    refreshTargets: () => void;
  }): void {
    const { candidate, actionKind, refreshTargets } = input;

    if (!this.canStart(candidate, actionKind)) {
      return;
    }

    const requestId = ++this.requestId;
    const requestContextKey = toContextKey(this.activeHero.state());
    const targetHeroId = candidate.targetHeroId;

    this.error.set(null);
    this.success.set(null);

    if (!requestContextKey) {
      this.error.set('Brak aktywnego bohatera dla akcji PvP.');
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

        this.success.set(actionSuccessMessage(actionKind, result.travelTimeSeconds));
        refreshTargets();
        this.clearPendingAction(actionKind, targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.error.set(getErrorMessage(error, actionErrorMessage(actionKind)));
        this.clearPendingAction(actionKind, targetHeroId);
      },
    });
  }

  canStart(candidate: PvpTargetCandidate, actionKind: PvpStartActionKind): boolean {
    if (this.isStartingAction()) {
      return false;
    }

    if (actionKind === 'attack') {
      return candidate.attackEligibility.canStart
        && !this.isAttackPending(candidate.targetHeroId);
    }

    return candidate.spyEligibility.canStart
      && !this.isSpyPending(candidate.targetHeroId);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private isCurrentAction(requestId: number, contextKey: string): boolean {
    return requestId === this.requestId && contextKey === this.currentContextKey();
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

function actionSuccessMessage(actionKind: PvpStartActionKind, travelTimeSeconds: number): string {
  const travelTimeLabel = durationLabel(travelTimeSeconds);

  return actionKind === 'attack'
    ? `Atak rozpoczęty. Dotarcie za ${travelTimeLabel}.`
    : `Szpiegowanie rozpoczęte. Dotarcie za ${travelTimeLabel}.`;
}

function actionErrorMessage(actionKind: PvpStartActionKind): string {
  return actionKind === 'attack'
    ? 'Nie udało się rozpocząć ataku.'
    : 'Nie udało się rozpocząć szpiegowania.';
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
