import { effect, inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { PvpSpyReportState } from './pvp-spy-report.state';

@Injectable()
export class PvpActiveActionNavigationState {
  private readonly router = inject(Router);
  private readonly spyReport = inject(PvpSpyReportState);
  private readonly injector = inject(Injector);
  private navigatedSpyReportId: string | null = null;
  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    effect(() => {
      const reportId = this.spyReport.reportId();

      if (!reportId || this.navigatedSpyReportId === reportId) {
        return;
      }

      this.navigatedSpyReportId = reportId;
      queueMicrotask(() => {
        void this.router.navigate(['/game/reports', reportId]);
      });
    }, { injector: this.injector });
  }
}
