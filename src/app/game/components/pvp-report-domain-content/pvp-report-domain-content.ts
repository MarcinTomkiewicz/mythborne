import { Component, computed, input } from '@angular/core';
import {
  PvpPrivateAttackReportAvailableCopy,
  PvpPrivateReportCopy,
  PvpPrivateSpyReportAvailableCopy,
} from '../../../core/domain/pvp/pvp-private-report-copy.model';
import type {
  PrivateReportDetailPage,
} from '../../../core/domain/reports/report-detail.model';
import { ReportSpySection } from '../../../core/domain/reports/report-section.model';
import { mapPrivatePvpAttackCombatStageView } from '../../../core/utils/combat-report-display.mapper';
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
  readonly copy = input.required<PvpPrivateReportCopy>();
  readonly activeHeroId = input<string | null>(null);

  readonly attackCopy = computed((): PvpPrivateAttackReportAvailableCopy | null => {
    const copy = this.copy();

    return copy.reportKind === 'attack' ? copy : null;
  });
  readonly spyCopy = computed((): PvpPrivateSpyReportAvailableCopy | null => {
    const copy = this.copy();

    return copy.reportKind === 'spy' ? copy : null;
  });
  readonly spySection = computed((): ReportSpySection | null => {
    const section = this.detail().report.spySectionJson;

    return section && !('missing' in section) ? section : null;
  });
  readonly combatStage = computed(() =>
    (() => {
      const copy = this.attackCopy();

      return copy
        ? mapPrivatePvpAttackCombatStageView({
          report: this.detail().report,
          copy,
          combatResultId: this.detail().domainContextJson.pvp?.combatResultId,
          activeHeroId: this.activeHeroId(),
        })
        : null;
    })(),
  );

  trackByKey(index: number, item: { key: string }): string {
    return `${item.key}:${index}`;
  }

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
