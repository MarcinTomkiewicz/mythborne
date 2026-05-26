import { Component, input } from '@angular/core';
import { CombatDisplayLogGroup } from '../../../core/domain/combat/combat-display.model';

@Component({
  selector: 'app-combat-log-panel',
  standalone: true,
  templateUrl: './combat-log-panel.html',
  host: { class: 'd-block w-100' },
})
export class CombatLogPanel {
  readonly groups = input.required<readonly CombatDisplayLogGroup[]>();
  readonly title = input('Przebieg starcia');
  readonly subtitle = input<string | null>(null);
  readonly emptyText = input('Przebieg starcia pojawi się po pierwszej akcji.');
}
