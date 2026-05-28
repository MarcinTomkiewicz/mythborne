import { computed, inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import {
  PendingPvpAction,
  PvpStartActionKind,
} from '../../../../core/types/vicinity.types';
import { activeHeroContextKey } from '../../../../core/utils/request-token';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { formatPendingDurationLabel } from '../../../../core/utils/pending-timer';
import { createRequestId } from '../../../../core/utils/request-id';

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
    refreshAfterStart: () => void;
  }): void {
    const { candidate, actionKind, refreshAfterStart } = input;

    if (!this.canStart(candidate, actionKind)) {
      return;
    }

    const requestId = ++this.requestId;
    const requestContextKey = activeHeroContextKey(this.activeHero.state());
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
      requestId: createRequestId(`pvp-${actionKind}:${targetHeroId}`),
    }).subscribe({
      next: (result) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        const travelTimeLabel = formatPendingDurationLabel(result.travelTimeSeconds);
        this.success.set(
          actionKind === 'attack'
            ? `Atak rozpoczęty. Dotarcie za ${travelTimeLabel}.`
            : `Szpiegowanie rozpoczęte. Dotarcie za ${travelTimeLabel}.`,
        );
        refreshAfterStart();
        this.clearPendingAction(actionKind, targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, requestContextKey)) {
          this.clearPendingAction(actionKind, targetHeroId);
          return;
        }

        this.error.set(getErrorMessage(
          error,
          actionKind === 'attack'
            ? 'Nie udało się rozpocząć ataku.'
            : 'Nie udało się rozpocząć szpiegowania.',
        ));
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
    return activeHeroContextKey(this.activeHero.state());
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
