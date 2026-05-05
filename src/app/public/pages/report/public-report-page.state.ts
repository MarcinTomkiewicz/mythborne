import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PublicGameReport } from '../../../core/domain/reports/game-report.model';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { GameReports } from '../../../core/services/reports/game-reports';
import { PublicReportUiMetadata } from './public-report-ui-metadata';

@Injectable()
export class PublicReportPageState {
  private readonly gameReports = inject(GameReports);
  private readonly uiMetadataService = inject(GameReportUiMetadataService);
  private loadRequestId = 0;

  readonly report = signal<PublicGameReport | null>(null);
  readonly uiMetadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly uiMetadata = new PublicReportUiMetadata(() => this.uiMetadataEntries());
  readonly isLoading = signal(true);
  readonly isNotFound = signal(false);

  loadData(publicToken: string): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.report.set(null);

    forkJoin({
      report: this.gameReports.getPublicReportByToken(publicToken).pipe(
        catchError(() => of(null)),
      ),
      uiMetadataEntries: this.uiMetadataService.getPublicReportEntries(),
    }).subscribe({
      next: ({ report, uiMetadataEntries }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.uiMetadataEntries.set(uiMetadataEntries);
        this.report.set(report);
        this.isNotFound.set(report === null);
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.isNotFound.set(true);
        this.isLoading.set(false);
      },
    });
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }
}
