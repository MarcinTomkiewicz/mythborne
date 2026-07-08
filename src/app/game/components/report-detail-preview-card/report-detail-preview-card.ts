import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import type { PvpPrivateReportCopy } from '../../../core/domain/pvp/pvp-private-report-copy.model';
import type { PrivateReportDetailPage } from '../../../core/domain/reports/report-detail.model';
import type { ReportHandoffActionsViewModel } from '../../../core/domain/reports/report-handoff.model';
import { GameCopy } from '../../../core/services/game-copy/game-copy';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { explorationParentContextReportId } from '../../../core/utils/report-detail-parent-context';
import { mapReportHandoffActions } from '../../../core/utils/report-handoff-actions.mapper';
import { mapReportDetailPreviewView } from '../../../core/utils/report-detail-preview.mapper';
import {
  isPrivatePvpReportDetail,
  isPrivatePvpSpyReportDetail,
  isPvpReportDomainDetail,
} from '../../../core/utils/pvp-report-domain-context';
import { PvpReportDomainContent } from '../pvp-report-domain-content/pvp-report-domain-content';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';
import { ReportDetailPreviewDisplay } from './report-detail-preview-display';

@Component({
  selector: 'app-report-detail-preview-card',
  standalone: true,
  imports: [
    PvpReportDomainContent,
    ProgressSpinnerModule,
    ReportDetailPreviewDisplay,
    ReportHandoffActions,
  ],
  templateUrl: './report-detail-preview-card.html',
  host: { class: 'd-block w-100' },
})
export class ReportDetailPreviewCard {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopy);
  private readonly reports = inject(PlayerReports);
  private loadRequestId = 0;

  readonly reportId = input.required<string>();
  readonly label = input<string | null>(null);
  readonly directReportLabel = input<string | null>(null);
  readonly publicReportCopyLabel = input<string | null>(null);

  readonly detail = signal<PrivateReportDetailPage | null>(null);
  readonly pvpPrivateReportCopy = signal<PvpPrivateReportCopy | null>(null);
  readonly activeHeroId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly pvpPrivateReportDetail = computed(() => {
    const detail = this.detail();

    return detail && isPrivatePvpReportDetail(detail) ? detail : null;
  });

  readonly view = computed(() => {
    const detail = this.detail();

    return detail && !isPvpReportDomainDetail(detail)
      ? mapReportDetailPreviewView({
          detail,
          activeHeroId: this.activeHeroId(),
        })
      : null;
  });
  readonly pvpReportActions = computed<ReportHandoffActionsViewModel | null>(() => {
    const detail = this.detail();

    return detail && isPvpReportDomainDetail(detail)
      ? mapReportHandoffActions({
          reportId: detail.access.reportId,
          publicToken: detail.report.publicToken ?? null,
        })
      : null;
  });
  readonly fallbackReportActions = computed<ReportHandoffActionsViewModel>(() =>
    mapReportHandoffActions({
      reportId: this.reportId(),
      publicToken: null,
    }),
  );

  constructor() {
    effect(() => {
      this.loadReport(this.reportId());
    });
  }

  private loadReport(reportId: string): void {
    const requestId = ++this.loadRequestId;

    this.detail.set(null);
    this.pvpPrivateReportCopy.set(null);
    this.hasError.set(false);
    this.isLoading.set(true);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.activeHeroId.set(state.heroId);
          this.loadReportDetail(state.heroId, reportId, requestId);
        },
        error: () => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private loadReportDetail(
    heroId: string,
    reportId: string,
    requestId: number,
  ): void {
    this.reports
      .getDetailPage({ heroId, reportId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          if (isPvpReportDomainDetail(detail)) {
            this.detail.set(detail);
            this.hasError.set(false);
            this.isLoading.set(false);

            if (isPrivatePvpSpyReportDetail(detail)) {
              this.loadPvpPrivateReportCopy(detail.access.reportId, requestId);
            }

            return;
          }

          const parentReportId = explorationParentContextReportId(
            detail,
            reportId,
          );

          if (parentReportId) {
            this.loadReportDetail(heroId, parentReportId, requestId);
            return;
          }

          this.detail.set(detail);
          this.hasError.set(false);
          this.isLoading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.detail.set(null);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private loadPvpPrivateReportCopy(
    reportId: string,
    requestId: number,
  ): void {
    this.gameCopy.getCopy('player.pvp.report.private', {
      locale: 'pl',
      reportId,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (copy) => {
        if (requestId !== this.loadRequestId || this.detail()?.access.reportId !== reportId) {
          return;
        }

        this.pvpPrivateReportCopy.set(copy);
        this.hasError.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.pvpPrivateReportCopy.set(null);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
