import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabCombatComparisonState } from './luck-lab-combat-comparison.state';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';

@Component({
  selector: 'app-luck-lab-combat-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  providers: [LuckLabCombatComparisonState, LuckLabCombatSectionState],
  templateUrl: './luck-lab-combat-section.html',
})
export class LuckLabCombatSection implements OnInit {
  readonly section = inject(LuckLabCombatSectionState);

  ngOnInit(): void {
    this.section.load();
  }
}
