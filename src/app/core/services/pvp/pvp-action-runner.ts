import { computed, inject, Injectable, signal } from '@angular/core';
import { activeHeroContextKey } from '../../domain/hero/active-hero-context';
import {
  PendingPvpAction,
  PvpActionRunnerStartInput,
  PvpStartActionKind,
} from '../../types/pvp-action.types';
import { RequestToken } from '../../utils/request-token';
import { createRequestId } from '../../utils/request-id';
import { ActiveHero } from '../hero/active-hero';
import { PlayerPvp } from './player-pvp';

@Injectable()
export class PvpActionRunner {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly requests = new RequestToken();

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

  start(input: PvpActionRunnerStartInput): void {
    if (this.pendingAction()) {
      return;
    }

    const token = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    if (!requestContextKey) {
      input.onMissingContext();
      return;
    }

    this.setPendingAction(input.actionKind, input.targetHeroId);

    this.playerPvp.startAction({
      actionKind: input.actionKind,
      targetHeroId: input.targetHeroId,
      requestId: createRequestId(`${input.requestIdPrefix}-${input.actionKind}:${input.targetHeroId}`),
    }).subscribe({
      next: (result) => {
        if (!this.isCurrentAction(token, requestContextKey)) {
          this.clearPendingAction(input.actionKind, input.targetHeroId);
          return;
        }

        input.onSuccess(result);
        this.clearPendingAction(input.actionKind, input.targetHeroId);
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(token, requestContextKey)) {
          this.clearPendingAction(input.actionKind, input.targetHeroId);
          return;
        }

        input.onError(error);
        this.clearPendingAction(input.actionKind, input.targetHeroId);
      },
    });
  }

  private currentContextKey(): string | null {
    return activeHeroContextKey(this.activeHero.state());
  }

  private isCurrentAction(token: number, contextKey: string): boolean {
    return this.requests.isCurrent(token) && contextKey === this.currentContextKey();
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
