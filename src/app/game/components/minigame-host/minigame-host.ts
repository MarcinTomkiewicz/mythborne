import { Component, computed, input, output } from '@angular/core';
import { CombatSurfaceDecisionDeadline } from '../../../core/domain/combat/combat-display.model';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import { CombatHost } from '../combat/combat-host';
import { MINIGAME_KEY, MinigameCompletionEvent, MinigameSourceRef } from './minigame-host.model';

@Component({
  selector: 'app-minigame-host',
  standalone: true,
  imports: [CombatHost],
  templateUrl: './minigame-host.html',
  host: { class: 'd-block w-100' },
})
export class MinigameHost {
  readonly minigameKey = input.required<string>();
  readonly sourceRef = input.required<MinigameSourceRef>();
  readonly contextTitle = input.required<string>();
  readonly sourcePresentation = input.required<CombatSourcePresentation>();
  readonly combatDecisionDeadline = input<CombatSurfaceDecisionDeadline | null>(null);
  readonly combatLiveSessionId = input<string | null>(null);
  readonly completed = output<MinigameCompletionEvent>();
  readonly isCombatMinigame = computed(() => this.minigameKey() === MINIGAME_KEY.combat);
}
