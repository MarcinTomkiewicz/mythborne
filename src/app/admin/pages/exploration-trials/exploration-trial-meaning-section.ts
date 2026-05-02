import { Component, inject } from '@angular/core';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trial-meaning-section',
  standalone: true,
  imports: [AdminSectionIntro],
  templateUrl: './exploration-trial-meaning-section.html',
})
export class ExplorationTrialMeaningSection {
  readonly page = inject(ExplorationTrialsPageState);
}
