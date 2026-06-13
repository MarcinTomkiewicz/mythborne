import { effect, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PvpSpyReportState } from './pvp-spy-report.state';

@Injectable()
export class PvpActiveActionNavigationState {
  private readonly router = inject(Router);
  private readonly spyReport = inject(PvpSpyReportState);
  private navigatedSpyReportId: string | null = null;

  constructor() {
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
