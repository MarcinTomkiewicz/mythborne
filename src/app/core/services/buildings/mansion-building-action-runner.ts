import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import {
  MansionBuilding,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';
import { ActiveHero } from '../hero/active-hero';
import { BuildingsService } from './buildings';
import { MansionBuildingActionFeedback } from './mansion-building-action-feedback';
import { getErrorMessage } from '../../utils/error-message';

interface MansionActionSnapshot {
  heroId: string | null;
  serverId: string | null;
  address: string | null;
}

export interface MansionBuildingActionRunnerInput {
  building: MansionBuilding;
  currentAddress: () => string | null;
  canStart: () => boolean;
  disabledReason: () => string;
  setStartingBuildingId: (value: string | null) => void;
  setActionError: (value: string | null) => void;
  setActionSuccess: (value: string | null) => void;
  setLastStartedJob: (value: StartBuildingUpgradeResult | null) => void;
  setStartedJobPendingRefresh: (value: boolean) => void;
  reload: () => void;
}

@Injectable({ providedIn: 'root' })
export class MansionBuildingActionRunner {
  private readonly buildingsService = inject(BuildingsService);
  private readonly activeHero = inject(ActiveHero);
  private readonly feedback = inject(MansionBuildingActionFeedback);
  private requestId = 0;

  start(input: MansionBuildingActionRunnerInput): void {
    if (!input.canStart()) {
      const message = input.disabledReason();
      input.setActionError(message);
      this.feedback.showUnavailable(message);
      return;
    }

    const requestId = ++this.requestId;
    const snapshot = this.currentSnapshot(input.currentAddress());

    input.setStartingBuildingId(input.building.id);
    input.setActionError(null);
    input.setActionSuccess(null);
    input.setLastStartedJob(null);

    this.buildingsService.startBuildingUpgrade(input.building.id).pipe(
      switchMap((result) =>
        this.activeHero.loadActiveHero().pipe(map(() => result)),
      ),
    ).subscribe({
      next: (result) => {
        if (!this.isCurrent(requestId, snapshot, input.currentAddress())) {
          this.clearStaleRequest(requestId, input);
          return;
        }

        const message = this.feedback.startSuccessMessage(
          input.building.name,
          result.targetLevel,
        );

        input.setLastStartedJob(result);
        input.setActionSuccess(message);
        this.feedback.showStartSuccess(message);
        input.setStartedJobPendingRefresh(true);
        input.setStartingBuildingId(null);
        input.reload();
      },
      error: (error: unknown) => {
        if (!this.isCurrent(requestId, snapshot, input.currentAddress())) {
          this.clearStaleRequest(requestId, input);
          return;
        }

        const message = getErrorMessage(
          error,
          'Building construction could not be started.',
        );
        input.setActionError(message);
        this.feedback.showStartError(message);
        input.setStartingBuildingId(null);
      },
    });
  }

  private currentSnapshot(address: string | null): MansionActionSnapshot {
    const state = this.activeHero.state();

    return {
      heroId: state?.heroId ?? null,
      serverId: state?.serverId ?? null,
      address,
    };
  }

  private isCurrent(
    requestId: number,
    snapshot: MansionActionSnapshot,
    address: string | null,
  ): boolean {
    const current = this.currentSnapshot(address);

    return (
      requestId === this.requestId &&
      current.heroId === snapshot.heroId &&
      current.serverId === snapshot.serverId &&
      current.address === snapshot.address
    );
  }

  private clearStaleRequest(
    requestId: number,
    input: MansionBuildingActionRunnerInput,
  ): void {
    if (requestId === this.requestId) {
      input.setStartingBuildingId(null);
    }
  }
}
