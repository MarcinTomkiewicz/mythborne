import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PvpPublicReportCopy } from '../../../core/domain/pvp/pvp-public-report-copy.model';
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
  readonly pvpPublicReportCopy = signal<PvpPublicReportCopy | null>(null);
  readonly hasError = signal(false);
  readonly isLoading = signal(true);
  readonly hasAvailablePvpPublicReport = computed(() =>
    this.pvpPublicReportCopy()?.access.isAvailable === true,
  );
  readonly hasUnavailablePvpPublicReport = computed(() =>
    this.pvpPublicReportCopy()?.access.isAvailable === false,
  );
  readonly canRenderPublicPvpCopy = computed(() =>
    this.pvpPublicReportCopy() !== null,
  );

  loadData(publicToken: string): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.detail.set(null);
    this.copy.set(null);
    this.pvpPublicReportCopy.set(null);
    this.hasError.set(false);

    forkJoin({
      detail: this.reports.getPublicDetailPage(publicToken).pipe(
        catchError(() => of(null)),
      ),
      copy: this.gameCopy.getCopy('player.reports.page', { locale: 'pl' }).pipe(
        catchError(() => of(null)),
      ),
      pvpCopyResult: this.gameCopy.getCopy('player.pvp.report.public', {
        locale: 'pl',
        publicToken,
      }).pipe(
        map((copy) => ({ copy, failed: false as const })),
        catchError(() => of({ copy: null, failed: true as const })),
      ),
    }).subscribe({
      next: ({ detail, copy, pvpCopyResult }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.copy.set(copy);
        this.detail.set(detail);
        this.pvpPublicReportCopy.set(pvpCopyResult.copy);
        this.hasError.set(
          pvpCopyResult.failed && (!detail?.report || detail.domainContextJson?.reportDomainKey === 'pvp'),
        );
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.detail.set(null);
        this.copy.set(null);
        this.pvpPublicReportCopy.set(null);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }
}
