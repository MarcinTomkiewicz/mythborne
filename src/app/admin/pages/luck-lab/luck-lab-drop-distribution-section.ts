import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabDropDistributionComparisonState } from './luck-lab-drop-distribution-comparison.state';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';

@Component({
  selector: 'app-luck-lab-drop-distribution-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  providers: [
    LuckLabDropDistributionComparisonState,
    LuckLabDropDistributionSectionState,
  ],
  templateUrl: './luck-lab-drop-distribution-section.html',
})
export class LuckLabDropDistributionSection implements OnInit {
  readonly section = inject(LuckLabDropDistributionSectionState);

  ngOnInit(): void {
    this.section.load();
  }
}
