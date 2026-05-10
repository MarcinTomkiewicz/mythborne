import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-encounter-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  templateUrl: './luck-lab-encounter-section.html',
})
export class LuckLabEncounterSection {
  readonly page = inject(LuckLabPageState);
}
