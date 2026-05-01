import { Component, inject } from '@angular/core';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trial-meaning-section',
  standalone: true,
  templateUrl: './exploration-trial-meaning-section.html',
})
export class ExplorationTrialMeaningSection {
  readonly page = inject(ExplorationTrialsPageState);
}
