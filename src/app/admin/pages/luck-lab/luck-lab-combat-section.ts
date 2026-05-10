import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LuckLabCombatComparisonState } from './luck-lab-combat-comparison.state';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';
import { combatExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabExplanationList } from './luck-lab-explanation-list';

@Component({
  selector: 'app-luck-lab-combat-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  providers: [LuckLabCombatComparisonState, LuckLabCombatSectionState],
  templateUrl: './luck-lab-combat-section.html',
})
export class LuckLabCombatSection implements OnInit {
  readonly section = inject(LuckLabCombatSectionState);
  private readonly lab = inject(LuckLabState);

  ngOnInit(): void {
    this.section.load();
  }

  explanationRows() {
    return combatExplanationRows({
      explanation: this.section.preview()?.explanation ?? null,
      domainRows: this.lab.result().explanationRows,
    });
  }
}
