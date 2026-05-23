import { Component, input } from '@angular/core';
import type { StatCardRow } from '../../core/types/stat-card.types';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  host: { class: 'd-block w-100 h-100' },
  templateUrl: './stat-card.html',
})
export class StatCard {
  readonly title = input.required<string>();
  readonly rows = input.required<readonly StatCardRow[]>();
}
