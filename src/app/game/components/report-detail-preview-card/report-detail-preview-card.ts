import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CombatStage } from '../combat/combat-stage';
import { PrivateReportDetailPage, ReportDetailCore } from '../../../core/domain/reports/report.model';
import {
  ReportDetailPreviewOutcomeBanner,
  ReportDetailPreviewOutcomeTone,
  ReportDetailPreviewRewardEntry,
  ReportDetailPreviewRewardResult,
  ReportDetailPreviewSection,
} from '../../../core/domain/reports/report-detail-preview.model';
import {
  ReportCombatSection,
  ReportMissingSection,
  ReportRewardEntryRow,
} from '../../../core/domain/reports/report-section.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { mapCanonicalReportCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { mapReportHandoffActions } from '../../../core/utils/report-handoff-actions.mapper';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-report-detail-preview-card',
  standalone: true,
  imports: [
    CombatStage,
    OutcomeReportLayout,
    ReportHandoffActions,
  ],
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
  readonly showRewardResult = input(false);

  readonly detail = signal<PrivateReportDetailPage | null>(null);
  readonly activeHeroId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  readonly report = computed(() => this.detail()?.report ?? null);
  readonly outcomeBanner = computed(() => reportOutcomeBanner(this.report()));
  readonly combatStage = computed(() =>
    mapCanonicalReportCombatStageView(this.report(), {
      activeHeroId: this.activeHeroId(),
      activeHeroPortraitSrc: null,
      reportId: this.detail()?.access.reportId ?? this.reportId(),
    }),
  );
  readonly narrativeLines = computed(() => reportNarrativeLines(this.report()));
  readonly previewSections = computed(() => reportPreviewSections(this.report()));
  readonly rewardResult = computed(() =>
    this.showRewardResult() ? reportRewardResult(this.report()) : null,
  );
  readonly actions = computed(() => {
    const detail = this.detail();
    const reportId = detail?.access.reportId ?? this.reportId();

    return mapReportHandoffActions({
      reportId,
      publicToken: detail?.report.publicToken ?? null,
    });
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

    this.activeHero.requireActiveHero()
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

  private loadReportDetail(heroId: string, reportId: string, requestId: number): void {
    this.reports.getDetailPage({ heroId, reportId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (requestId !== this.loadRequestId) {
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

function reportOutcomeBanner(report: ReportDetailCore | null): ReportDetailPreviewOutcomeBanner | null {
  const combat = presentSection(report?.combatSectionJson);

  return combat
    ? {
        title: combat.outcomeLabel,
        tone: combatOutcomeTone(combat),
      }
    : null;
}

function combatOutcomeTone(section: ReportCombatSection): ReportDetailPreviewOutcomeTone {
  const heroSide = section.participants.find((participant) =>
    participant.participantKind === 'hero'
  )?.side ?? null;

  if (heroSide && section.winnerSide === heroSide) {
    return 'success';
  }

  if (heroSide && section.loserSide === heroSide) {
    return 'danger';
  }

  return section.winnerSide || section.loserSide ? 'neutral' : 'warning';
}

function reportNarrativeLines(report: ReportDetailCore | null): readonly string[] {
  const combat = presentSection(report?.combatSectionJson);

  if (combat) {
    return combat.narrativeLines.filter(uniqueText);
  }

  const trial = presentSection(report?.trialSectionJson);
  const encounter = presentSection(report?.encounterSectionJson);
  const effect = report?.effectSectionJson ?? null;

  return [
    ...(trial?.narrativeLines ?? []),
    ...(encounter?.narrativeLines ?? []),
    ...(effect?.narrativeLines ?? []),
  ].filter(uniqueText);
}

function reportPreviewSections(report: ReportDetailCore | null): readonly ReportDetailPreviewSection[] {
  if (presentSection(report?.combatSectionJson)) {
    return [];
  }

  const trial = presentSection(report?.trialSectionJson);
  const encounter = presentSection(report?.encounterSectionJson);
  const effect = report?.effectSectionJson ?? null;
  const sections: Array<ReportDetailPreviewSection | null> = [
    trial
      ? {
          key: 'trial',
          title: trial.title,
          summary: trial.summary,
          chips: [trial.trialLabel, trial.outcomeLabel, trial.resultLabel],
          lines: trial.descriptionLines,
        }
      : null,
    encounter
      ? {
          key: 'encounter',
          title: encounter.title,
          summary: encounter.summary,
          chips: [encounter.encounterLabel, encounter.outcomeLabel],
          lines: encounter.descriptionLines,
        }
      : null,
    effect
      ? {
          key: 'effect',
          title: effect.title,
          summary: effect.summary,
          chips: [effect.sourceLabel],
          lines: effect.narrativeLines,
        }
      : null,
  ];

  return sections.filter((section): section is ReportDetailPreviewSection => section !== null);
}

function reportRewardResult(report: ReportDetailCore | null): ReportDetailPreviewRewardResult | null {
  const section = presentSection(report?.rewardSectionJson);

  if (!section) {
    return null;
  }

  const entries = section.entries.flatMap((entry, index) =>
    rewardResultEntry(entry, index),
  );

  return entries.length || section.summary || section.message
    ? {
        title: section.title,
        summary: section.message ?? section.summary,
        entries,
      }
    : null;
}

function rewardResultEntry(
  entry: ReportRewardEntryRow,
  index: number,
): readonly ReportDetailPreviewRewardEntry[] {
  const title = entry.itemDisplayName ??
    entry.effectLabel ??
    entry.resourceLabel ??
    entry.entryLabel;

  return title
    ? [{
        key: `${entry.entryKind}-${index}-${title}`,
        title,
        summary: entry.playerSummary ?? entry.summary,
        value: entry.displayValue ?? entry.amountDisplay,
      }]
    : [];
}

function presentSection<TSection extends object>(
  section: TSection | ReportMissingSection | null | undefined,
): TSection | null {
  return section && !('missing' in section) ? section : null;
}

function uniqueText(value: string, index: number, values: readonly string[]): boolean {
  return values.indexOf(value) === index;
}
