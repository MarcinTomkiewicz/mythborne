import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ReportPageCopy } from '../../../core/domain/reports/report.model';

@Component({
  selector: 'app-report-filters-panel',
  standalone: true,
  imports: [
    CheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './report-filters-panel.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportFiltersPanel {
  readonly filters = input.required<ReportPageCopy['reportsCenter']['filters']>();
  readonly filterForm = input.required<FormGroup>();
  readonly apply = output<void>();
}
