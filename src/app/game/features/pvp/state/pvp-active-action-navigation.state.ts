import { effect, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PvpActiveActionState } from './pvp-active-action.state';
import { PvpSpyReportState } from './pvp-spy-report.state';

@Injectable()
export class PvpActiveActionNavigationState {
  private readonly activePvpAction = inject(PvpActiveActionState);
  private readonly router = inject(Router);
  private readonly spyReport = inject(PvpSpyReportState);
  private navigatedPvpActionId: string | null = null;
  private navigatedSpyReportId: string | null = null;

  constructor() {
    effect(() => {
      const offer = this.activePvpAction.visibleOffer();

      if (
        !offer
        || offer.actionKind !== 'attack'
        || !offer.isManualWindow
        || offer.isResolved
        || !offer.pvpActionId
        || this.navigatedPvpActionId === offer.pvpActionId
      ) {
        return;
      }

      this.navigatedPvpActionId = offer.pvpActionId;
      queueMicrotask(() => {
        void this.router.navigate(['/game/combat'], {
          queryParams: {
            sourceEntityType: 'pvp_action',
            sourceEntityId: offer.pvpActionId,
          },
        });
      });
    });

    effect(() => {
      const reportId = this.spyReport.reportId();

      if (!reportId || this.navigatedSpyReportId === reportId) {
        return;
      }

      this.navigatedSpyReportId = reportId;
      queueMicrotask(() => {
        void this.router.navigate(['/game/reports', reportId]);
      });
    });
  }
}
