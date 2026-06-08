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
import type { PrivateReportDetailPage } from '../../../core/domain/reports/report-detail.model';
import type {
  ReportDetailPreviewExplorationSourceKind,
} from '../../../core/domain/reports/report-detail-preview.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { mapReportDetailPreviewView } from '../../../core/utils/report-detail-preview.mapper';
import { ReportDetailPreviewDisplay } from './report-detail-preview-display';

@Component({
  selector: 'app-report-detail-preview-card',
  standalone: true,
  imports: [ReportDetailPreviewDisplay],
  templateUrl: './report-detail-preview-card.html',
  host: { class: 'd-block w-100' },
})
export class ReportDetailPreviewCard {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reports = inject(PlayerReports);
  private loadRequestId = 0;

  readonly reportId = input.required<string>();
  readonly label = input('Raport');
  readonly directReportLabel = input<string | null>(null);
  readonly publicReportCopyLabel = input<string | null>(null);

  readonly detail = signal<PrivateReportDetailPage | null>(null);
  readonly activeHeroId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  readonly view = computed(() => {
    const detail = this.detail();

    return detail
      ? mapReportDetailPreviewView({
          detail,
          activeHeroId: this.activeHeroId(),
          showRewardResult: true,
        })
      : null;
  });

  constructor() {
    effect(() => {
      this.loadReport(this.reportId());
    });
  }

  private loadReport(reportId: string): void {
    const requestId = ++this.loadRequestId;

    this.detail.set(null);
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
}

function explorationParentContextReportId(
  detail: PrivateReportDetailPage,
  currentReportId: string,
): string | null {
  if (!isCombatResultReport(detail)) {
    return null;
  }

  const expectedKind = expectedExplorationParentKind(detail);

  if (!expectedKind) {
    return null;
  }

  return detail.report.relatedReportsJson.find(
    (candidate) =>
      candidate.reportId &&
      candidate.relationKind === 'parent_context_report' &&
      isExpectedExplorationParentContextReport(
        expectedKind,
        candidate.reportTypeKey,
        candidate.sourceEntityType,
      ) &&
      candidate.reportId !== currentReportId,
  )?.reportId ?? null;
}

function isCombatResultReport(detail: PrivateReportDetailPage): boolean {
  return (
    detail.report.reportTypeKey === 'combat' &&
    detail.report.sourceEntityType === 'combat_result'
  );
}

function expectedExplorationParentKind(
  detail: PrivateReportDetailPage,
): ReportDetailPreviewExplorationSourceKind | null {
  return (
    normalizeExplorationParentKind(
      detail.domainContextJson.exploration?.challengeKind ?? null,
    ) ??
    normalizeExplorationParentKind(
      detail.domainContextJson.combat?.sourceType ?? null,
    )
  );
}

function normalizeExplorationParentKind(
  value: string | null,
): ReportDetailPreviewExplorationSourceKind | null {
  if (value === 'trial' || value === 'encounter') {
    return value;
  }

  return null;
}

function isExpectedExplorationParentContextReport(
  expectedKind: ReportDetailPreviewExplorationSourceKind,
  reportTypeKey: string,
  sourceEntityType: string,
): boolean {
  return expectedKind === 'encounter'
    ? reportTypeKey === 'encounter' && sourceEntityType === 'encounter_result'
    : reportTypeKey === 'trial' && sourceEntityType === 'trial_result';
}
