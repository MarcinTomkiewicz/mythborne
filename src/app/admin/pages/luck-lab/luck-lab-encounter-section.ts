import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { encounterExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabExplanationList } from './luck-lab-explanation-list';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-encounter-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  templateUrl: './luck-lab-encounter-section.html',
})
export class LuckLabEncounterSection {
  readonly page = inject(LuckLabPageState);

  explanationRows() {
    return encounterExplanationRows({
      preview: this.page.encounterPreview(),
      domainRows: this.page.lab.result().explanationRows,
    });
  }
}
