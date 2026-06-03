import { Component, input } from '@angular/core';

export type OutcomeReportTone = 'success' | 'danger' | 'warning' | 'neutral';

@Component({
  selector: 'app-outcome-report-layout',
  standalone: true,
  templateUrl: './outcome-report-layout.html',
  host: { class: 'd-block w-100' },
})
export class OutcomeReportLayout {
  readonly label = input('Raport');
  readonly statusLabel = input('Rozstrzygnięto');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly iconClass = input('pi pi-compass');
  readonly titleTone = input<OutcomeReportTone | null>(null);
}
