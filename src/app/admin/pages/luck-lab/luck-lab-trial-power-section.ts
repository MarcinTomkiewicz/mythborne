import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-trial-power-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  templateUrl: './luck-lab-trial-power-section.html',
})
export class LuckLabTrialPowerSection {
  readonly page = inject(LuckLabPageState);
}
