import { inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { PvpActionRunner } from '../../../../core/services/pvp/pvp-action-runner';
import { PvpStartActionKind } from '../../../../core/types/pvp-action.types';
import { getErrorMessage } from '../../../../core/utils/error-message';
import type { VicinityPvpActionStartInput } from '../types/vicinity-pvp-actions.types';
import { VicinityRangeState } from './vicinity-range.state';

@Injectable()
export class VicinityPvpActionsState {
  private readonly actionRunner = inject(PvpActionRunner);
  private readonly range = inject(VicinityRangeState);

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly pendingAction = this.actionRunner.pendingAction;
  readonly pendingAttackTargetIds = this.actionRunner.pendingAttackTargetIds;
  readonly pendingSpyTargetIds = this.actionRunner.pendingSpyTargetIds;
  readonly isStartingAction = this.actionRunner.isStartingAction;

  isSpyPending(targetHeroId: string): boolean {
    return this.actionRunner.isSpyPending(targetHeroId);
  }

  isAttackPending(targetHeroId: string): boolean {
    return this.actionRunner.isAttackPending(targetHeroId);
  }

  start(input: VicinityPvpActionStartInput): void {
    const { candidate, actionKind, refreshAfterStart } = input;

    if (!this.canStart(candidate, actionKind)) {
      return;
    }

    const targetHeroId = candidate.targetHeroId;

    this.error.set(null);
    this.success.set(null);

    this.actionRunner.start({
      actionKind,
      targetHeroId,
      requestIdPrefix: 'pvp',
      onMissingContext: () => {
        this.error.set(this.range.copyJson()?.page.errorLabel ?? null);
      },
      onSuccess: (result) => {
        this.success.set(null);
        refreshAfterStart(result);
      },
      onError: (error: unknown) => {
        this.error.set(getErrorMessage(
          error,
          this.range.copyJson()?.page.errorLabel ?? '',
        ));
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
}
