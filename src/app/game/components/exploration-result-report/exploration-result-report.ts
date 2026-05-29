import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';
import { PrivateGameReportDetail } from '../../../core/domain/reports/game-report.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { GameReports } from '../../../core/services/reports/game-reports';
import { Json } from '../../../core/types/database.types';
import { mapCompletedCombatReportStageView } from '../../../core/utils/combat-report-display.mapper';
import {
  explorationResultSourceKind,
  explorationReportRewardDisplay,
  mapExplorationOutcomeView,
  mapExplorationReportActions,
  mapExplorationRewardText,
} from '../../../core/utils/exploration-result-display.mapper';
import { RequestToken } from '../../../core/utils/request-token';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';
import { CombatStage } from '../combat/combat-stage';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-exploration-result-report',
  standalone: true,
  imports: [
    CombatStage,
    OutcomeReportLayout,
    ItemDetailPopover,
    ReportHandoffActions,
  ],
  templateUrl: './exploration-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationResultReport {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reports = inject(GameReports);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly page = inject(ExplorationPageState);
  readonly rewardState = inject(ExplorationRewardState);
  private readonly reportDetailToken = new RequestToken();
  readonly reportDetail = signal<PrivateGameReportDetail | null>(null);
  readonly isLoadingReportDetail = signal(false);
  readonly reportDetailError = signal(false);
  private readonly publicReportPathFromDetail = signal<string | null>(null);

  readonly currentChallengeResult = computed(() => this.page.sandboxChallengeResult());
  readonly minigameReportPointer = computed(() =>
    this.minigameHandoff.currentMinigameReportPointer(),
  );
  readonly isMissingMinigameReport = computed(() =>
    Boolean(
      this.minigameReportPointer() &&
      !this.minigameReportPointer()?.reportId &&
      !this.minigameReportPointer()?.reportUnavailable,
    ),
  );
  readonly isMinigameReportLoading = computed(() =>
    Boolean(this.minigameReportPointer()?.reportId) &&
    (
      this.isLoadingReportDetail() ||
      (!this.reportDetail() && !this.reportDetailError())
    ),
  );
  readonly minigameReportUnavailable = computed(() =>
    this.minigameReportPointer()?.reportUnavailable === true ||
    (
      Boolean(this.minigameReportPointer()?.reportId) &&
      !this.isLoadingReportDetail() &&
      this.reportDetailError()
    ),
  );
  readonly minigameReportUnavailableMessage = computed(() => {
    const reason = this.minigameReportPointer()?.reportUnavailableReason;

    if (reason === 'creation_failed') {
      return 'Nie udało się przygotować raportu walki.';
    }

    if (reason === 'detail_read_failed' || this.reportDetailError()) {
      return 'Nie udało się odczytać raportu walki.';
    }

    return 'Raport walki jest teraz niedostępny.';
  });
  readonly reportRawJson = computed(() =>
    this.reportDetail()?.rawJson
      ?? currentChallengeResultRawJson(this.currentChallengeResult())
      ?? this.rewardState.reward()?.rawJson,
  );
  readonly resultSourceKind = computed(() => {
    const report = this.reportDetail();

    if (!report) {
      return this.minigameReportPointer()?.sourceKind ?? 'unknown';
    }

    const reportSourceKind = reportDetailSourceKind(report);

    return reportSourceKind !== 'unknown'
      ? reportSourceKind
      : this.minigameReportPointer()?.sourceKind ?? 'unknown';
  });
  readonly outcome = computed(() =>
    mapExplorationOutcomeView({
      rawJson: this.reportRawJson(),
      sourceKind: this.resultSourceKind(),
    }),
  );
  readonly directReportId = computed(() =>
    this.minigameReportPointer()?.reportId ??
    this.currentChallengeResult()?.gameReportId ??
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
      sourceKind: this.resultSourceKind(),
    }),
  );
  readonly combatStage = computed(() =>
    mapCompletedCombatReportStageView(this.reportDetail(), {
      activeHeroId: this.activeHero.state()?.heroId ?? null,
      activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
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

          this.minigameHandoff.markReportDetailUnavailable(reportId);
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

function reportDetailSourceKind(report: PrivateGameReportDetail): ExplorationResultSourceKind {
  if (report.reportTypeKey === 'trial' || report.sourceEntityType === 'trial_result') {
    return 'trial';
  }

  if (report.reportTypeKey === 'encounter' || report.sourceEntityType === 'encounter_result') {
    return 'encounter';
  }

  return explorationResultSourceKind({
    trialDefinitionId: report.trialSection ? report.sourceEntityId : null,
    encounterDefinitionId: report.encounterSection ? report.sourceEntityId : null,
  });
}

function currentChallengeResultRawJson(value: unknown): Json | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as { rawJson?: Json; playerReportSummaryJson?: Json };

  return record.rawJson ?? record.playerReportSummaryJson;
}
