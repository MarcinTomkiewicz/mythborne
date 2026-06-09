import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { PublicReportDetailV2 } from '../../../core/domain/reports/report-detail.model';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { PlayerReports } from '../../../core/services/reports/player-reports';

@Injectable()
export class PublicReportPageState {
  private readonly gameCopy = inject(GameCopyService);
  private readonly reports = inject(PlayerReports);
  private loadRequestId = 0;

  readonly detail = signal<PublicReportDetailV2 | null>(null);
  readonly copy = signal<ReportPageCopy | null>(null);
  readonly isLoading = signal(true);

  loadData(publicToken: string): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.detail.set(null);
    this.copy.set(null);

    forkJoin({
      detail: this.reports.getPublicDetailPage(publicToken).pipe(
        catchError(() => of(null)),
      ),
      copy: this.gameCopy.getCopy('player.reports.page', { locale: 'pl' }).pipe(
        catchError(() => of(null)),
      ),
    }).subscribe({
      next: ({ detail, copy }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.detail.set(detail);
        this.copy.set(copy);
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.detail.set(null);
        this.copy.set(null);
        this.isLoading.set(false);
      },
    });
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }
}
