import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { GameReports } from '../../../core/services/reports/game-reports';
import { ToastService } from '../../../core/services/ui/toast';
import { RequestToken } from '../../../core/utils/request-token';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { ExplorationOverviewState } from '../../pages/exploration/exploration-overview.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { ExplorationStepState } from '../../pages/exploration/exploration-step.state';
import {
  explorationStepDirectReportId,
  explorationStepDirectReportLabel,
  explorationStepDirectReportLink,
  explorationStepPublicReportPath,
  explorationStepRewardIntro,
  explorationStepRewardTitle,
} from '../../pages/exploration/exploration-step-result-ui';

@Component({
  selector: 'app-exploration-step-handoff-card',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    OutcomeReportLayout,
  ],
  templateUrl: './exploration-step-handoff-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStepHandoffCard {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reports = inject(GameReports);
  readonly overview = inject(ExplorationOverviewState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly step = inject(ExplorationStepState);
  private readonly toast = inject(ToastService);
  private readonly reportDetailToken = new RequestToken();
  private readonly publicReportPathFromDetail = signal<string | null>(null);
  readonly activeEffectForCurrentReport = computed(() =>
    this.step.isCurrentStepEffectReport()
      ? this.overview.activeEffectDisplay()
      : null,
  );
  readonly directReportId = computed(() =>
    explorationStepDirectReportId(this.step.currentStepResult()),
  );
  readonly directReportLink = computed(() =>
    explorationStepDirectReportLink(this.step.currentStepResult()),
  );
  readonly directReportLabel = computed(() =>
    explorationStepDirectReportLabel(this.step.currentStepResult()),
  );
  readonly publicReportPath = computed(() =>
    explorationStepPublicReportPath(this.step.currentStepResult())
      ?? this.publicReportPathFromDetail(),
  );
  readonly hasPublicReportLink = computed(() => this.publicReportPath() !== null);
  readonly rewardIntro = computed(() =>
    explorationStepRewardIntro(
      this.step.currentStepResult(),
      this.rewardState.reward()?.rawJson ?? null,
    ),
  );
  readonly rewardTitle = computed(() =>
    explorationStepRewardTitle(
      this.step.currentStepResult(),
      this.rewardState.reward()?.rawJson ?? null,
    ),
  );

  constructor() {
    effect(() => {
      const reportId = this.directReportId();
      const payloadPath = explorationStepPublicReportPath(this.step.currentStepResult());

      this.publicReportPathFromDetail.set(null);

      if (!reportId || payloadPath) {
        return;
      }

      this.loadPublicReportPathFromDetail(reportId);
    });
  }

  copyPublicReportLink(): void {
    const link = this.publicReportPath();

    if (!link || typeof navigator === 'undefined' || !navigator.clipboard) {
      this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.');
      return;
    }

    void navigator.clipboard.writeText(this.absoluteReportLink(link))
      .then(() => this.toast.show('success', 'Raport', 'Link do raportu został skopiowany.'))
      .catch(() => this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.'));
  }

  private absoluteReportLink(link: string): string {
    return typeof window === 'undefined' || link.startsWith('http')
      ? link
      : `${window.location.origin}${link}`;
  }

  private loadPublicReportPathFromDetail(reportId: string): void {
    const token = this.reportDetailToken.next();

    this.reports
      .getActiveHeroReportDetail(reportId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          if (!this.reportDetailToken.isCurrent(token) || this.directReportId() !== reportId) {
            return;
          }

          this.publicReportPathFromDetail.set(
            report.publicToken ? `/report/${report.publicToken}` : null,
          );
        },
        error: () => {
          if (!this.reportDetailToken.isCurrent(token) || this.directReportId() !== reportId) {
            return;
          }

          this.publicReportPathFromDetail.set(null);
        },
      });
  }
}
