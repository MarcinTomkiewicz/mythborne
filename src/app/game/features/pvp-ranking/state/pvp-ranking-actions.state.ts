import { inject, Injectable, signal } from '@angular/core';
import type { PvpActionStartResult } from '../../../../core/domain/pvp/pvp.model';
import {
  PvpRankingActionFeedback,
  PvpRankingCopy,
} from '../../../../core/domain/pvp/pvp-ranking.model';
import { PvpActionRunner } from '../../../../core/services/pvp/pvp-action-runner';
import type {
  DataRow,
  DataRowActionKind,
} from '../../../../core/types/data-row.types';
import { isRankingDataRow } from '../../../../core/utils/data-row';

@Injectable()
export class PvpRankingActionsState {
  private readonly actionRunner = inject(PvpActionRunner);

  readonly actionFeedback = signal<PvpRankingActionFeedback | null>(null);
  readonly pendingAction = this.actionRunner.pendingAction;

  clearFeedback(): void {
    this.actionFeedback.set(null);
  }

  startAction(
    row: DataRow,
    actionKind: DataRowActionKind,
    copy: PvpRankingCopy | null,
    handleStartedAction: (result: PvpActionStartResult) => void,
    reloadAfterAction: () => void,
  ): void {
    if (actionKind !== 'attack' && actionKind !== 'spy') {
      return;
    }

    if (!isRankingDataRow(row)) {
      this.setTargetUnavailableFeedback(copy);
      return;
    }

    const targetRow = row.rankingRow;
    const action = targetRow?.actions[actionKind];

    if (!action?.enabled) {
      this.setTargetUnavailableFeedback(copy);
      return;
    }

    this.actionFeedback.set(null);

    this.actionRunner.start({
      actionKind,
      targetHeroId: targetRow.heroId,
      requestIdPrefix: 'ranking',
      onMissingContext: () => {
        this.setTargetUnavailableFeedback(copy);
      },
      onSuccess: (result) => {
        handleStartedAction(result);
        reloadAfterAction();
      },
      onError: () => {
        this.setTargetUnavailableFeedback(copy);
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
}
