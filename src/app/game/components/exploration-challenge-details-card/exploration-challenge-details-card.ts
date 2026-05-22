import { Component, inject } from '@angular/core';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';

@Component({
  selector: 'app-exploration-challenge-details-card',
  standalone: true,
  templateUrl: './exploration-challenge-details-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationChallengeDetailsCard {
  readonly challenge = inject(ExplorationChallengeState);
}
