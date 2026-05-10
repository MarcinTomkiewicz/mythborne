import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabExplanationList } from './luck-lab-explanation-list';
import { trialPowerExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-trial-power-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  templateUrl: './luck-lab-trial-power-section.html',
})
export class LuckLabTrialPowerSection {
  readonly page = inject(LuckLabPageState);

  explanationRows() {
    return trialPowerExplanationRows({
      trialPower: this.page.trialPower(),
      domainRows: this.page.lab.result().explanationRows,
    });
  }
}
