import { Component, input, output } from '@angular/core';
import { CombatStageViewModel } from '../../../core/domain/combat/combat-stage.model';
import { CombatSurface } from './combat-surface';

@Component({
  selector: 'app-combat-stage',
  standalone: true,
  imports: [CombatSurface],
  templateUrl: './combat-stage.html',
  host: { class: 'd-block w-100' },
})
export class CombatStage {
  readonly stage = input.required<CombatStageViewModel>();
  readonly action = output<string>();
  readonly timingStrike = output<void>();
}
