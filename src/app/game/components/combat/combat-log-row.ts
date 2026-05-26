import { Component, input } from '@angular/core';
import { CombatDisplayLogRow } from '../../../core/domain/combat/combat-display.model';

@Component({
  selector: 'app-combat-log-row',
  standalone: true,
  templateUrl: './combat-log-row.html',
})
export class CombatLogRow {
  readonly row = input.required<CombatDisplayLogRow>();
}
