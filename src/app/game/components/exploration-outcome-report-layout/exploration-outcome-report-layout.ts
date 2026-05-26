import { Component, input } from '@angular/core';
import { ExplorationResultOutcomeTone } from '../../../core/domain/exploration/exploration-result-display.model';

@Component({
  selector: 'app-exploration-outcome-report-layout',
  standalone: true,
  templateUrl: './exploration-outcome-report-layout.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationOutcomeReportLayout {
  readonly label = input('Raport eksploracji');
  readonly statusLabel = input('Rozstrzygnięto');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly iconClass = input('pi pi-compass');
  readonly titleTone = input<ExplorationResultOutcomeTone | null>(null);
}
