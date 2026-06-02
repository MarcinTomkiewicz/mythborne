import { Component, input } from '@angular/core';
import { GamePageSummaryRow } from '../../core/interfaces/game-page-summary-row.interface';

@Component({
  selector: 'app-game-page-header',
  standalone: true,
  templateUrl: './game-page-header.html',
  host: { class: 'd-block w-100' },
})
export class GamePageHeader {
  readonly eyebrowLabel = input.required<string>();
  readonly title = input.required<string>();
  readonly summaryRows = input.required<readonly GamePageSummaryRow[]>();
}
