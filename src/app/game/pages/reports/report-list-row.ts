import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportsCenterListCopy } from '../../../core/domain/reports/reports-center-copy.model';
import { ReportsCenterListRowV2 } from '../../../core/domain/reports/reports-center.model';

@Component({
  selector: 'app-report-list-row',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './report-list-row.html',
  host: { class: 'd-block w-100' },
})
export class ReportsCenterListRow {
  readonly report = input.required<ReportsCenterListRowV2>();
  readonly copy = input.required<ReportsCenterListCopy>();
  readonly selected = input(false);
  readonly selectReport = output<string>();

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
