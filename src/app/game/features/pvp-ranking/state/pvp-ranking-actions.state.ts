import { inject, Injectable, signal } from '@angular/core';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  PvpRankingActionFeedback,
  PvpRankingActionKind,
  PvpRankingActionRequest,
  PvpRankingContext,
  PvpRankingCopy,
  PvpRankingPendingAction,
  PvpRankingRow,
} from '../../../../core/domain/pvp/pvp-ranking.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { createRequestId } from '../../../../core/utils/request-id';
import type {
  VicinityListRow,
  VicinityRowActionKind,
} from '../../../../core/types/vicinity.types';

@Injectable()
export class PvpRankingActionsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private actionRequest: PvpRankingActionRequest | null = null;

  readonly actionFeedback = signal<PvpRankingActionFeedback | null>(null);
  readonly pendingAction = signal<PvpRankingPendingAction | null>(null);

  clearFeedback(): void {
    this.actionFeedback.set(null);
  }

  startAction(
    row: VicinityListRow,
    actionKind: VicinityRowActionKind,
    context: PvpRankingContext | null,
    copy: PvpRankingCopy | null,
    reloadAfterAction: () => void,
  ): void {
    if (actionKind !== 'attack' && actionKind !== 'spy') {
      return;
    }

    const targetRow = this.findRankingRow(row, context);
    const action = targetRow?.actions[actionKind];

    if (!targetRow || !action?.enabled) {
      this.setTargetUnavailableFeedback(copy);
      return;
    }

    const requestId = (this.actionRequest?.requestId ?? 0) + 1;
    const contextKey = activeHeroContextKey(this.activeHero.state());

    if (!contextKey) {
      this.setTargetUnavailableFeedback(copy);
      return;
    }

    this.actionFeedback.set(null);
    this.actionRequest = {
      requestId,
      contextKey,
      actionKind,
      targetHeroId: targetRow.heroId,
    };
    this.pendingAction.set(this.actionRequest);

    this.playerPvp.startAction({
      actionKind,
      targetHeroId: targetRow.heroId,
      requestId: createRequestId(`ranking-${actionKind}:${targetRow.heroId}`),
    }).subscribe({
      next: () => {
        if (!this.isCurrentActionRequest(requestId, contextKey, targetRow.heroId, actionKind)) {
          this.clearPendingAction(targetRow.heroId, actionKind);
          return;
        }

        this.clearPendingAction(targetRow.heroId, actionKind);
        reloadAfterAction();
      },
      error: () => {
        if (!this.isCurrentActionRequest(requestId, contextKey, targetRow.heroId, actionKind)) {
          this.clearPendingAction(targetRow.heroId, actionKind);
          return;
        }

        this.setTargetUnavailableFeedback(copy);
        this.clearPendingAction(targetRow.heroId, actionKind);
        reloadAfterAction();
      },
    });
  }

  private setTargetUnavailableFeedback(copy: PvpRankingCopy | null): void {
    if (!copy) {
      return;
    }

    this.actionFeedback.set({
      summary: copy.feedback.targetUnavailable.summary,
      detail: copy.feedback.targetUnavailable.detail,
      severity: 'error',
    });
  }

  private isCurrentActionRequest(
    requestId: number,
    contextKey: string,
    targetHeroId: string,
    actionKind: PvpRankingActionKind,
  ): boolean {
    const pending = this.actionRequest;

    return pending?.requestId === requestId
      && contextKey === activeHeroContextKey(this.activeHero.state())
      && pending?.targetHeroId === targetHeroId
      && pending.actionKind === actionKind;
  }

  private clearPendingAction(
    targetHeroId: string,
    actionKind: PvpRankingActionKind,
  ): void {
    const pending = this.pendingAction();

    if (pending?.targetHeroId === targetHeroId && pending.actionKind === actionKind) {
      this.actionRequest = null;
      this.pendingAction.set(null);
    }
  }

  private findRankingRow(row: VicinityListRow, context: PvpRankingContext | null): PvpRankingRow | null {
    const heroId = row.heroId ?? null;

    return heroId
      ? context?.ranking.rows.find((rankingRow) => rankingRow.heroId === heroId)
        ?? (context?.selectedTarget?.heroId === heroId ? context?.selectedTarget ?? null : null)
      : null;
  }
}
