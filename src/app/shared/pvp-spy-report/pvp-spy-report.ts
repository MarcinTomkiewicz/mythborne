import { Component, computed, input } from '@angular/core';
import {
  GameReportSpyBuildingDisplay,
  GameReportSpyDisplay,
} from '../../core/domain/reports/game-report.model';
import { GameReportContentReadModel } from '../../core/interfaces/reports/game-report-content.interface';
import type { StatCardRow } from '../../core/types/stat-card.types';
import { EquipmentPreview } from '../equipment-preview/equipment-preview';
import {
  OutcomeReportLayout,
  OutcomeReportTone,
} from '../outcome-report-layout/outcome-report-layout';
import { StatCard } from '../stat-card/stat-card';

type PvpSpyReportReadModel = GameReportContentReadModel & {
  title: string;
  summary: string | null;
};

const BUILDING_DISTRICT_CODES = ['A', 'B', 'C', 'D', 'E'] as const;
const REPORT_SECTION_TITLE_CLASS = 'mg-section__title mg-section__title--xs mb-0';

@Component({
  selector: 'app-pvp-spy-report',
  standalone: true,
  imports: [EquipmentPreview, OutcomeReportLayout, StatCard],
  templateUrl: './pvp-spy-report.html',
  host: { class: 'd-block w-100' },
})
export class PvpSpyReport {
  readonly report = input.required<PvpSpyReportReadModel>();

  readonly spySection = computed(() => this.report().spySection);
  readonly spyDisplay = computed(() => this.spySection()?.spyDisplay ?? null);
  readonly baseStatRows = computed<readonly StatCardRow[]>(() =>
    this.spyDisplay()?.baseStats.map((stat, index) => ({
      key: `${stat.label}-${index}`,
      label: stat.label,
      value: stat.value,
      valueClass: stat.valueClass ?? 'color-heading',
    })) ?? [],
  );
  readonly resourceRows = computed<readonly StatCardRow[]>(() =>
    this.spyDisplay()?.resources.map((resource, index) => ({
      key: `${resource.label}-${index}`,
      label: resource.label,
      value: resource.value,
      valueClass: 'color-heading',
    })) ?? [],
  );
  readonly buildingColumns = computed<readonly (readonly GameReportSpyBuildingDisplay[])[]>(() => {
    const buildings = this.spyDisplay()?.buildings ?? [];

    return BUILDING_DISTRICT_CODES.map((districtCode) =>
      buildings.filter((building) => building.districtCode === districtCode),
    );
  });
  readonly sectionTitleClass = REPORT_SECTION_TITLE_CLASS;
  readonly outcomeTitle = computed(() =>
    this.spyDisplay()?.outcomeLabel ??
    this.spySection()?.title ??
    this.report().title ??
    'Raport szpiegowania',
  );
  readonly outcomeSummary = computed(() =>
    this.spyDisplay()?.playerSummary ??
    this.report().summary ??
    this.spySection()?.summary ??
    '',
  );
  readonly outcomeTone = computed<OutcomeReportTone>(() => {
    switch (this.spyDisplay()?.outcomeKey) {
      case 'success_undetected':
        return 'success';
      case 'success_detected':
        return 'warning';
      case 'failure_undetected':
      case 'failure_detected':
        return 'danger';
      default:
        return 'neutral';
    }
  });
  readonly canShowIntel = computed(() => {
    const spy = this.spyDisplay();

    return Boolean(
      spy &&
      !this.isTargetView(spy) &&
      this.isSuccessfulSpy(spy) &&
      this.hasIntel(spy),
    );
  });
  readonly isMissingSuccessfulIntel = computed(() => {
    const spy = this.spyDisplay();

    return Boolean(
      spy &&
      !this.isTargetView(spy) &&
      this.isSuccessfulSpy(spy) &&
      !this.hasIntel(spy),
    );
  });

  isTargetView(spy: GameReportSpyDisplay): boolean {
    return spy.viewerRole === 'target';
  }

  private hasIntel(spy: GameReportSpyDisplay): boolean {
    return Boolean(
      spy.equipment.length ||
      spy.baseStats.length ||
      spy.buildings.length ||
      spy.resources.length,
    );
  }

  private isSuccessfulSpy(spy: GameReportSpyDisplay): boolean {
    return spy.outcomeKey === 'success_undetected' ||
      spy.outcomeKey === 'success_detected';
  }
}
