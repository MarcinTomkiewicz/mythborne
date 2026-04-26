import { Component, input } from '@angular/core';
import { CombatantSnapshot } from '../../../core/domain/combat/combat.model';

@Component({
  selector: 'app-combatant-card',
  standalone: true,
  templateUrl: './combatant-card.html',
  styleUrl: './combatant-card.scss',
})
export class CombatantCard {
  readonly title = input.required<string>();
  readonly combatant = input.required<CombatantSnapshot>();
  readonly currentHealth = input.required<number>();
  readonly maxHealth = input.required<number>();
  readonly baseStats = input.required<Array<{ key: string; label: string; value: number }>>();
}
