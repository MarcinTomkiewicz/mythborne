import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PrivateGameReportDetail } from '../../../core/domain/reports/game-report.model';
import { GameReports } from '../../../core/services/reports/game-reports';
import { ToastService } from '../../../core/services/ui/toast';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import {
  explorationReportRewardDisplay,
  mapExplorationOutcomeView,
  mapExplorationReportActions,
  mapExplorationRewardText,
} from '../../../core/utils/exploration-result-display.mapper';
import { RequestToken } from '../../../core/utils/request-token';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { ExplorationOutcomeReportLayout } from '../exploration-outcome-report-layout/exploration-outcome-report-layout';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';

@Component({
  selector: 'app-exploration-result-report',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    ExplorationOutcomeReportLayout,
    ItemDetailPopover,
  ],
  templateUrl: './exploration-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationResultReport {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reports = inject(GameReports);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly page = inject(ExplorationPageState);
  readonly rewardState = inject(ExplorationRewardState);
  private readonly toast = inject(ToastService);
  private readonly reportDetailToken = new RequestToken();
  readonly reportDetail = signal<PrivateGameReportDetail | null>(null);
  readonly isLoadingReportDetail = signal(false);
  readonly reportDetailError = signal(false);
  private readonly publicReportPathFromDetail = signal<string | null>(null);

  readonly currentChallengeResult = computed(() => this.page.sandboxChallengeResult());
  readonly minigameReportPointer = computed(() =>
    this.currentChallengeResult() ? null : this.minigameHandoff.currentMinigameReportPointer(),
  );
  readonly isMissingMinigameReport = computed(() =>
    Boolean(this.minigameReportPointer() && !this.minigameReportPointer()?.reportId),
  );
  readonly isMinigameReportLoading = computed(() =>
    Boolean(this.minigameReportPointer()?.reportId) &&
    (
      this.isLoadingReportDetail() ||
      (!this.reportDetail() && !this.reportDetailError())
    ),
  );
  readonly minigameReportUnavailable = computed(() =>
    Boolean(this.minigameReportPointer()?.reportId) &&
    !this.isLoadingReportDetail() &&
    this.reportDetailError(),
  );
  readonly reportRawJson = computed(() =>
    this.minigameReportPointer() ? this.reportDetail()?.rawJson : undefined,
  );
  readonly outcome = computed(() =>
    mapExplorationOutcomeView({
      rawJson: this.reportRawJson(),
      sourceKind: 'unknown',
    }),
  );
  readonly directReportId = computed(() =>
    this.currentChallengeResult()?.gameReportId ??
    this.minigameReportPointer()?.reportId ??
    null,
  );
  readonly reportActions = computed(() =>
    mapExplorationReportActions({
      rawJson: this.reportRawJson(),
      directReportId: this.directReportId(),
      publicReportPathFromDetail: this.publicReportPathFromDetail(),
    }),
  );
  readonly reportRewardDisplay = computed(() =>
    explorationReportRewardDisplay(this.rewardState.rewardDisplay()),
  );
  readonly rewardText = computed(() =>
    mapExplorationRewardText({
      rewardRawJson: this.rewardState.reward()?.rawJson,
      reportRawJson: this.reportRawJson(),
      sourceKind: 'unknown',
    }),
  );

  constructor() {
    effect(() => {
      const reportId = this.directReportId();

      this.reportDetailToken.next();
      this.reportDetail.set(null);
      this.reportDetailError.set(false);
      this.publicReportPathFromDetail.set(null);

      if (!reportId) {
        this.isLoadingReportDetail.set(false);
        return;
      }

      this.loadReportDetail(reportId);
    });
  }

  copyPublicReportLink(): void {
    const link = this.reportActions().publicReportPath;

    if (!link) {
      this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.');
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(link))
      .then((copied) => this.toast.show(
        copied ? 'success' : 'error',
        'Raport',
        copied
          ? 'Link do raportu został skopiowany.'
          : 'Nie udało się skopiować linku do raportu.',
      ));
  }

  private loadReportDetail(reportId: string): void {
    const token = this.reportDetailToken.next();

    this.isLoadingReportDetail.set(true);
    this.reports
      .getActiveHeroReportDetail(reportId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          if (!this.isCurrentReportDetailRequest(token, reportId)) {
            return;
          }

          this.reportDetail.set(report);
          this.publicReportPathFromDetail.set(
            report.publicToken ? `/report/${report.publicToken}` : null,
          );
          this.isLoadingReportDetail.set(false);
        },
        error: () => {
          if (!this.isCurrentReportDetailRequest(token, reportId)) {
            return;
          }

          this.reportDetailError.set(true);
          this.publicReportPathFromDetail.set(null);
          this.isLoadingReportDetail.set(false);
        },
      });
  }

  private isCurrentReportDetailRequest(token: number, reportId: string): boolean {
    if (!this.reportDetailToken.isCurrent(token) || this.directReportId() !== reportId) {
      return false;
    }

    const pointer = this.minigameReportPointer();

    return pointer ? pointer.reportId === reportId : true;
  }
}
