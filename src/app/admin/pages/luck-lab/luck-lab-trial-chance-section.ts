import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-trial-chance-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  templateUrl: './luck-lab-trial-chance-section.html',
})
export class LuckLabTrialChanceSection {
  readonly page = inject(LuckLabPageState);
}
