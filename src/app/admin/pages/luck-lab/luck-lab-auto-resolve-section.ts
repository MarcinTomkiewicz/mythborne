import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { LuckLabPageState } from './luck-lab-page.state';

@Component({
  selector: 'app-luck-lab-auto-resolve-section',
  standalone: true,
  imports: [MessageModule, TableModule],
  templateUrl: './luck-lab-auto-resolve-section.html',
})
export class LuckLabAutoResolveSection {
  readonly page = inject(LuckLabPageState);
}
