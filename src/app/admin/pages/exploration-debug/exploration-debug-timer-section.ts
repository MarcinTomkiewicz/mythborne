import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ExplorationDebugPageState } from './exploration-debug-page.state';

@Component({
  selector: 'app-exploration-debug-timer-section',
  standalone: true,
  imports: [MessageModule],
  templateUrl: './exploration-debug-timer-section.html',
})
export class ExplorationDebugTimerSection {
  readonly page = inject(ExplorationDebugPageState);
}
