import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PvpPublicReportCopy } from '../../../core/domain/pvp/pvp-public-report-copy.model';
import { PublicReportDetailV2 } from '../../../core/domain/reports/report-detail.model';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { publicReportPathFromToken } from '../../../core/utils/public-report-path';

@Injectable()
export class PublicReportPageState {
  private readonly gameCopy = inject(GameCopyService);
  private readonly reports = inject(PlayerReports);
  private loadRequestId = 0;

  readonly detail = signal<PublicReportDetailV2 | null>(null);
  readonly detailLoadError = signal<unknown | null>(null);
  readonly copy = signal<ReportPageCopy | null>(null);
  readonly pvpPublicReportCopy = signal<PvpPublicReportCopy | null>(null);
  readonly publicDetailDiagnostic = signal<string | null>(null);
  readonly hasError = signal(false);
  readonly isLoading = signal(true);

  markMissingRoutePublicToken(): void {
    this.detail.set(null);
    this.detailLoadError.set(null);
    this.copy.set(null);
    this.pvpPublicReportCopy.set(null);
    this.publicDetailDiagnostic.set('publicReport.route.publicToken.missing');
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  loadData(publicToken: string): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.detail.set(null);
    this.detailLoadError.set(null);
    this.copy.set(null);
    this.pvpPublicReportCopy.set(null);
    this.publicDetailDiagnostic.set(null);
    this.hasError.set(false);

    forkJoin({
      detail: this.reports.getPublicDetailPage(publicToken),
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
        this.detailLoadError.set(null);
        this.pvpPublicReportCopy.set(pvpCopyResult.copy);
        this.publicDetailDiagnostic.set(null);
        this.hasError.set(!detail.report && pvpCopyResult.failed);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.detail.set(null);
        this.detailLoadError.set(error);
        this.copy.set(null);
        this.pvpPublicReportCopy.set(null);
        this.publicDetailDiagnostic.set(publicDetailDiagnostic(publicToken, null, error));
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }
}

function publicDetailDiagnostic(
  publicToken: string,
  detail: PublicReportDetailV2 | null,
  error: unknown,
): string {
  const path = publicReportPathFromToken(publicToken);

  if (error) {
    return [
      'get_public_report_detail.load.error',
      `publicToken=${publicToken}`,
      `path=${path ?? 'null'}`,
      `error=${errorDiagnostic(error)}`,
    ].join(' ');
  }

  return [
    'get_public_report_detail.load.failed',
    `publicToken=${publicToken}`,
    `path=${path ?? 'null'}`,
  ].join(' ');
}

function errorDiagnostic(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}:${error.message}`;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
