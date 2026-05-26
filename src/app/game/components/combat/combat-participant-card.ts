import { Component, input } from '@angular/core';
import { CombatDisplayParticipant } from '../../../core/domain/combat/combat-display.model';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { StatCard } from '../../../shared/stat-card/stat-card';

@Component({
  selector: 'app-combat-participant-card',
  standalone: true,
  imports: [GameBar, StatCard],
  templateUrl: './combat-participant-card.html',
  host: { class: 'd-block w-100 max-w-350 flex-shrink-0' },
})
export class CombatParticipantCard {
  readonly participant = input.required<CombatDisplayParticipant>();

  initials(name = this.participant().displayName): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
      : name.slice(0, 2);

    return initials.toUpperCase() || '?';
  }
}
