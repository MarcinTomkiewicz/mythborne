import { Component, computed, input } from '@angular/core';
import {
  PvpPrivateReportCopy,
  PvpPrivateSpyReportAvailableCopy,
} from '../../../core/domain/pvp/pvp-private-report-copy.model';
import type {
  PrivateReportDetailPage,
} from '../../../core/domain/reports/report-detail.model';
import type { PvpResultSummaryV1 } from '../../../core/domain/pvp/pvp-result-snapshot.model';
import {
  ReportSpySection,
} from '../../../core/domain/reports/report-section.model';
import { mapPvpAttackCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { pvpResultSummaryForHero } from '../../../core/utils/pvp-result-summary';
import { isPrivatePvpAttackReportDetail } from '../../../core/utils/pvp-report-domain-context';
import { RichText } from '../../../shared/rich-text/rich-text';
import { CombatStage } from '../combat/combat-stage';

@Component({
  selector: 'app-pvp-report-domain-content',
  standalone: true,
  imports: [
    CombatStage,
    RichText,
  ],
  templateUrl: './pvp-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class PvpReportDomainContent {
  readonly detail = input.required<PrivateReportDetailPage>();
  readonly copy = input<PvpPrivateReportCopy | null>(null);
  readonly activeHeroId = input<string | null>(null);

  readonly resultSummary = computed((): PvpResultSummaryV1 | null =>
    pvpResultSummaryForHero(
      this.detail().domainContextJson.pvpResult,
      this.activeHeroId(),
      this.detail().access.accessRole !== 'participant',
    ),
  );
  readonly isAttackReport = computed(() => isPrivatePvpAttackReportDetail(this.detail()));
  readonly missingResultDiagnostic = computed(() =>
    this.isAttackReport() && !this.detail().domainContextJson.pvpResult
      ? 'domainContextJson.pvpResult.missingBackfillRequired'
      : null,
  );
  readonly spyCopy = computed((): PvpPrivateSpyReportAvailableCopy | null => {
    const copy = this.copy();

    return copy?.reportKind === 'spy' ? copy : null;
  });
  readonly spySection = computed((): ReportSpySection | null => {
    const section = this.detail().report.spySectionJson;

    return section && !('missing' in section) ? section : null;
  });
  readonly combatStage = computed(() =>
    (() => {
      return this.isAttackReport()
        ? mapPvpAttackCombatStageView({
          report: this.detail().report,
          shell: this.detail().reportShellContextJson,
          combatResultId: this.detail().domainContextJson.pvp?.combatResultId,
          activeHeroId: this.activeHeroId(),
          pvpCombatContext: this.detail().domainContextJson.pvpCombatContext ?? null,
        })
        : null;
    })(),
  );

  showSpyResources(section: ReportSpySection): boolean {
    return section.resources.length > 0 || section.revealedSections.resources;
  }

  showSpyBuildings(section: ReportSpySection): boolean {
    return section.buildings.length > 0 || section.revealedSections.buildings;
  }

  showSpyEquipment(section: ReportSpySection): boolean {
    return section.equipment.length > 0 || section.revealedSections.equipment;
  }

  showSpyStats(section: ReportSpySection): boolean {
    return section.baseStats.length > 0 || section.revealedSections.baseStats;
  }

  showNoVisibleSpyData(section: ReportSpySection): boolean {
    return !this.showSpyResources(section) &&
      !this.showSpyBuildings(section) &&
      !this.showSpyEquipment(section) &&
      !this.showSpyStats(section);
  }
}
