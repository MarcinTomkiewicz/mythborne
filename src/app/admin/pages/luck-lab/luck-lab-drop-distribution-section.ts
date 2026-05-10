import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LuckLabDropDistributionComparisonState } from './luck-lab-drop-distribution-comparison.state';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';
import { dropDistributionExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabExplanationList } from './luck-lab-explanation-list';

@Component({
  selector: 'app-luck-lab-drop-distribution-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  providers: [
    LuckLabDropDistributionComparisonState,
    LuckLabDropDistributionSectionState,
  ],
  templateUrl: './luck-lab-drop-distribution-section.html',
})
export class LuckLabDropDistributionSection implements OnInit {
  readonly section = inject(LuckLabDropDistributionSectionState);
  private readonly lab = inject(LuckLabState);

  ngOnInit(): void {
    this.section.load();
  }

  explanationRows() {
    const summary = this.section.summary();

    return dropDistributionExplanationRows({
      explanation: summary.explanation,
      reason: summary.reason,
      sampleSize: summary.sampleSize,
      domainRows: this.lab.result().explanationRows,
      formulaContextJson: summary.formulaContextJson,
      summaryJson: summary.summaryJson,
    });
  }
}
