import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GameReportContextSection,
  GameReportItemReference,
  PrivateGameReportDetail,
} from '../../../core/domain/reports/game-report.model';
import {
  mapCombatReportRewardDisplay,
} from '../../../core/domain/reports/combat-report-reward-display.mapper';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { GameReports } from '../../../core/services/reports/game-reports';
import { mapCompletedCombatReportStageView } from '../../../core/utils/combat-report-display.mapper';
import {
  mapExplorationOutcomeView,
  mapExplorationReportActions,
} from '../../../core/utils/exploration-result-display.mapper';
import { RequestToken } from '../../../core/utils/request-token';
import { CombatStage } from '../combat/combat-stage';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { MinigameCompletionEvent } from '../minigame-host/minigame-host.model';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-combat-report-handoff-card',
  standalone: true,
  imports: [
    CombatStage,
    OutcomeReportLayout,
    ReportHandoffActions,
  ],
  template: `
    @if (completion(); as completed) {
      <div class="flex-col gap-lg w-100">
        <app-outcome-report-layout
          label="Raport walki"
          statusLabel=""
          [title]="reportTitle()"
          [titleTone]="outcome().tone"
          description=""
          iconClass="pi pi-shield"
        />
        @if (outcome().narrativeLines.length) {
<section class="mg-card p-lg flex-col gap-md w-100">
            @for (line of outcome().narrativeLines; track line) {
              <p class="color-text text-md lh-16 m-0">{{ line }}</p>
            }
          </section>
} @else if (reportSummary(); as summary) {
<section class="mg-card p-lg flex-col gap-md w-100">
            <p class="color-text text-md lh-16 m-0">{{ summary }}</p>
          </section>
}

        @if (combatStage(); as stage) {
<app-combat-stage [stage]="stage" />
} @else if (isLoadingReportDetail()) {
<section class="mg-card p-lg flex-col gap-sm w-100">
            <p class="small-caps color-muted text-xs m-0">Raport walki</p>
            <p class="color-text text-md lh-16 m-0">Ładowanie raportu walki...</p>
          </section>
} @else if (reportDetailError()) {
<section class="mg-card p-lg flex-col gap-sm w-100">
            <p class="small-caps color-muted text-xs m-0">Raport walki</p>
            <p class="warn-text text-md lh-16 m-0">Nie udało się odczytać raportu walki.</p>
          </section>
} @else if (!completed.reportId) {
<section class="mg-card p-lg flex-col gap-sm w-100">
            <p class="small-caps color-muted text-xs m-0">Raport walki</p>
            <p class="warn-text text-md lh-16 m-0">
              Wynik jest zapisany, ale backend nie zwrócił odnośnika do raportu.
            </p>
          </section>
}
<section class="mg-card p-lg flex-col gap-sm w-100">
          <p class="small-caps color-muted text-xs m-0">Zdobycze</p>

          @if (isLoadingReportDetail()) {
            <p class="color-text text-md lh-16 m-0">Sprawdzanie zdobyczy z raportu...</p>
          } @else if (reportDetailError()) {
            <p class="warn-text text-md lh-16 m-0">Nie udało się odczytać zdobyczy z raportu.</p>
          } @else if (rewardDisplay().segments.length) {
            <p class="color-text text-md lh-16 m-0">
              @for (segment of rewardDisplay().segments; track $index) {
                @if (segment.isHighlighted) {
                  <strong class="color-heading">{{ segment.text }}</strong>
                } @else {
                  <span>{{ segment.text }}</span>
                }
              }
            </p>
          }

          @if (itemReferences().length) {
            <div class="mg-grid grid-cols-3 grid-cols-1-sm gap-md">
              @for (item of itemReferences(); track itemReferenceTrackKey($index, item)) {
                <div class="mg-card flex-col gap-xs p-md">
                  <strong class="color-heading">{{ item.displayName }}</strong>
                  @if (item.displayDetails.length) {
                    <div class="flex-row-start-center flex-wrap gap-sm">
                      @for (detail of item.displayDetails; track detail) {
                        <span class="tag-badge tag-badge--muted">{{ detail }}</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          } @else if (hasLoadedReportWithoutRewards()) {
            <p class="color-text text-md lh-16 m-0">Raport nie zawiera zdobyczy.</p>
          }
        </section>
<app-report-handoff-actions
          [actions]="reportActions()"
          directReportLabel="Otwórz raport"
          publicReportCopyLabel="Kopiuj link publiczny"
        />
</div>
    }
  `,
  host: { class: 'd-block w-100' },
})
export class CombatReportHandoffCard {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reports = inject(GameReports);
  private readonly reportDetailToken = new RequestToken();
  private readonly reportDetail = signal<PrivateGameReportDetail | null>(null);
  readonly completion = input<MinigameCompletionEvent | null>(null);
  readonly isLoadingReportDetail = signal(false);
  readonly reportDetailError = signal(false);
  readonly outcome = computed(() =>
    mapExplorationOutcomeView({
      rawJson: this.reportDetail()?.rawJson,
      sourceKind: 'encounter',
    }),
  );
  readonly reportTitle = computed(() => {
    const report = this.reportDetail();
    const outcomeTitle = this.outcome().title;

    return outcomeTitle !== 'Wynik walki'
      ? outcomeTitle
      : report?.title ?? outcomeTitle;
  });
  readonly reportSummary = computed(() => this.reportDetail()?.summary ?? null);
  readonly combatStage = computed(() =>
    mapCompletedCombatReportStageView(this.reportDetail(), {
      activeHeroId: this.activeHero.state()?.heroId ?? null,
      activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
    }),
  );
  readonly rewardSection = computed<GameReportContextSection | null>(() =>
    this.reportDetail()?.rewardSection ?? null,
  );
  readonly itemReferences = computed<readonly GameReportItemReference[]>(() =>
    this.reportDetail()?.itemReferences ?? [],
  );
  readonly rewardDisplay = computed(() =>
    mapCombatReportRewardDisplay({
      rewardSection: this.rewardSection(),
      itemReferences: this.itemReferences(),
    }),
  );
  readonly hasLoadedReportWithoutRewards = computed(() =>
    Boolean(
      this.reportDetail() &&
      !this.rewardDisplay().hasRewards,
    ),
  );
  readonly reportActions = computed(() =>
    mapExplorationReportActions({
      rawJson: this.reportDetail()?.rawJson,
      directReportId: this.completion()?.reportId ?? null,
      publicReportPathFromDetail: this.reportDetail()?.publicToken
        ? `/report/${this.reportDetail()?.publicToken}`
        : null,
    }),
  );

  constructor() {
    effect(() => {
      const reportId = this.completion()?.reportId ?? null;

      this.reportDetailToken.next();
      this.reportDetail.set(null);
      this.reportDetailError.set(false);

      if (!reportId) {
        this.isLoadingReportDetail.set(false);
        return;
      }

      this.loadReportDetail(reportId);
    });
  }

  itemReferenceTrackKey(index: number, item: GameReportItemReference): string {
    return `${item.sourceKind}-${item.displayName}-${item.sortOrder}-${index}`;
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
          this.reportDetailError.set(false);
          this.isLoadingReportDetail.set(false);
        },
        error: () => {
          if (!this.isCurrentReportDetailRequest(token, reportId)) {
            return;
          }

          this.reportDetail.set(null);
          this.reportDetailError.set(true);
          this.isLoadingReportDetail.set(false);
        },
      });
  }

  private isCurrentReportDetailRequest(token: number, reportId: string): boolean {
    return this.reportDetailToken.isCurrent(token) &&
      this.completion()?.reportId === reportId;
  }
}
