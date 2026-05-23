import { Component, input } from '@angular/core';
import { CombatantSnapshot } from '../../../core/domain/combat/combat-sandbox.model';
import type { StatCardRow } from '../../../core/types/stat-card.types';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { StatCard } from '../../../shared/stat-card/stat-card';

@Component({
  selector: 'app-combatant-card',
  standalone: true,
  imports: [GameBar, StatCard],
  templateUrl: './combatant-card.html',
})
export class CombatantCard {
  readonly title = input.required<string>();
  readonly combatant = input.required<CombatantSnapshot>();
  readonly currentHealth = input.required<number>();
  readonly maxHealth = input.required<number>();
  readonly baseStats = input.required<StatCardRow[]>();
  readonly combatStats = input.required<StatCardRow[]>();
}
