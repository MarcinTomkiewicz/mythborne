import { Component, input } from '@angular/core';
import { GameBar } from '../../../shared/game-bar/game-bar';

@Component({
  selector: 'app-exploration-chance-metric-row',
  standalone: true,
  imports: [GameBar],
  templateUrl: './exploration-chance-metric-row.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationChanceMetricRow {
  readonly label = input.required<string>();
  readonly display = input.required<string>();
  readonly value = input.required<number>();
}
