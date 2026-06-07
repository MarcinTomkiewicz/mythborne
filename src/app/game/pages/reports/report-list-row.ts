import { Component, computed, input, output } from '@angular/core';
import { ReportsCenterListRowV2 } from '../../../core/domain/reports/reports-center.model';

const SUPPORTED_MARKER_ICON_KEYS = new Set([
  'report-trial',
  'report-exploration',
  'report-combat',
  'buff',
  'debuff',
]);

@Component({
  selector: 'app-report-list-row',
  standalone: true,
  
  templateUrl: './report-list-row.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportsCenterListRow {
  readonly report = input.required<ReportsCenterListRowV2>();
  readonly selected = input(false);
  readonly selectReport = output<string>();
  readonly markerIconClass = computed(() => {
    const iconKey = this.report().marker.iconKey;
    return SUPPORTED_MARKER_ICON_KEYS.has(iconKey) ? `pi pi-${iconKey}` : null;
  });
  readonly hasMarkerIcon = computed(() => this.markerIconClass() !== null);
  readonly markerToneClass = computed(() => {
    const tone = this.report().preview.outcomeStatus.tone;
    if (tone === 'positive') {
      return 'success-text';
    }

    if (tone === 'negative') {
      return 'error-text';
    }

    return 'color-heading';
  });

  select(): void {
    this.selectReport.emit(this.report().reportId);
  }

  selectFromKeyboard(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.select();
  }
}
