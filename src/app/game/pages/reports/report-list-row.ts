import { Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import {
  ReportsCenterDeleteOneActionCopy,
  ReportsCenterEventTypeCopy,
  ReportsCenterRowActionCopy,
  ReportsCenterSelectReportRowActionCopy,
} from '../../../core/domain/reports/reports-center-copy.model';
import { ReportsCenterListRow } from '../../../core/domain/reports/reports-center.model';
import { reportsCenterMarkerToneClass } from '../../../core/utils/reports-center-marker-tone-class';
import { semanticIconClass } from '../../../core/utils/semantic-icon-class';

@Component({
  selector: 'app-report-list-row',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './report-list-row.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportListRow {
  readonly report = input.required<ReportsCenterListRow>();
  readonly selected = input(false);
  readonly selectionChecked = input(false);
  readonly eventTypeCopy = input.required<ReportsCenterEventTypeCopy>();
  readonly selectReportRowActionCopy = input.required<ReportsCenterSelectReportRowActionCopy>();
  readonly markReadActionCopy = input.required<ReportsCenterRowActionCopy>();
  readonly deleteActionCopy = input.required<ReportsCenterDeleteOneActionCopy>();
  readonly actionDisabled = input(false);
  readonly selectionControl = new FormControl(false, { nonNullable: true });
  readonly selectReport = output<string>();
  readonly toggleReportSelection = output<string>();
  readonly markReportRead = output<string>();
  readonly deleteReport = output<string>();
  readonly markerIconClass = computed(() => {
    return semanticIconClass(this.eventTypeCopy().iconKey);
  });
  readonly hasMarkerIcon = computed(() => this.markerIconClass() !== null);
  readonly selectionAriaLabel = computed(() => {
    const actionCopy = this.selectReportRowActionCopy();
    const title = this.report().title;
    const template = this.selectionChecked()
      ? actionCopy.selectedAriaLabelTemplate
      : actionCopy.ariaLabelTemplate;
    const fallback = this.selectionChecked()
      ? actionCopy.selectedFallbackAriaLabel
      : actionCopy.fallbackAriaLabel;

    return title ? template.replace('{title}', title) : fallback;
  });
  readonly markerToneClass = computed(() =>
    reportsCenterMarkerToneClass(this.report(), this.eventTypeCopy()),
  );
  private readonly syncSelectionControl = effect(() => {
    const selected = this.selectionChecked();

    if (this.selectionControl.value !== selected) {
      this.selectionControl.setValue(selected, { emitEvent: false });
    }
  });

  select(): void {
    this.selectReport.emit(this.report().reportId);
  }

  toggleSelection(event: Event | null | undefined): void {
    event?.stopPropagation();
    this.toggleReportSelection.emit(this.report().reportId);
  }

  markRead(event: Event): void {
    event.stopPropagation();

    if (this.actionDisabled() || !this.report().isUnread) {
      return;
    }

    this.markReportRead.emit(this.report().reportId);
  }

  delete(event: Event): void {
    event.stopPropagation();

    if (this.actionDisabled()) {
      return;
    }

    this.deleteReport.emit(this.report().reportId);
  }

  selectFromKeyboard(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.select();
  }
}
