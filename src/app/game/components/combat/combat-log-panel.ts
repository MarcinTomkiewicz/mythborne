import { Component, input } from '@angular/core';
import { CombatDisplayLogGroup } from '../../../core/domain/combat/combat-display.model';
import { CombatLogRow } from './combat-log-row';

@Component({
  selector: 'app-combat-log-panel',
  standalone: true,
  imports: [CombatLogRow],
  templateUrl: './combat-log-panel.html',
  host: { class: 'd-block w-100' },
})
export class CombatLogPanel {
  readonly groups = input.required<readonly CombatDisplayLogGroup[]>();
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly emptyText = input.required<string>();
}
