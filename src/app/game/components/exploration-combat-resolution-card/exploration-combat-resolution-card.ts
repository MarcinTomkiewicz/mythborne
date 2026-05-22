import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WalkingDeadMeter } from '../combat/walking-dead-meter';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';

@Component({
  selector: 'app-exploration-combat-resolution-card',
  standalone: true,
  imports: [ButtonModule, WalkingDeadMeter],
  templateUrl: './exploration-combat-resolution-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationCombatResolutionCard {
  readonly challenge = inject(ExplorationChallengeState);
  readonly combatResolutionLabel = computed(() =>
    this.challenge.activeChallenge()?.trialDefinitionId
      ? 'Rozstrzygnij próbę bojową'
      : 'Rozstrzygnij zasadzkę',
  );
}
