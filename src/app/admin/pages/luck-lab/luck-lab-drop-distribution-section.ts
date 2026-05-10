import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';

@Component({
  selector: 'app-luck-lab-drop-distribution-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  providers: [LuckLabDropDistributionSectionState],
  templateUrl: './luck-lab-drop-distribution-section.html',
})
export class LuckLabDropDistributionSection {
  readonly section = inject(LuckLabDropDistributionSectionState);
}
