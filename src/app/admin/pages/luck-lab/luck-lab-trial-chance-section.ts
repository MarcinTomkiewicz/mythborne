import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabExplanationList } from './luck-lab-explanation-list';
import { trialChanceExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-trial-chance-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  templateUrl: './luck-lab-trial-chance-section.html',
})
export class LuckLabTrialChanceSection {
  readonly page = inject(LuckLabPageState);

  explanationRows() {
    return trialChanceExplanationRows({
      opportunity: this.page.trialOpportunityPreview(),
      manifestation: this.page.trialManifestationPreview(),
      domainRows: this.page.lab.result().explanationRows,
    });
  }
}
