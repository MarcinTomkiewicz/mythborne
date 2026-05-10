import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { autoResolveExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabExplanationList } from './luck-lab-explanation-list';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-auto-resolve-section',
  standalone: true,
  imports: [MessageModule, TableModule, LuckLabExplanationList],
  templateUrl: './luck-lab-auto-resolve-section.html',
})
export class LuckLabAutoResolveSection {
  readonly page = inject(LuckLabPageState);

  explanationRows() {
    return autoResolveExplanationRows({
      preview: this.page.autoResolvePreview(),
      domainRows: this.page.lab.result().explanationRows,
    });
  }
}
