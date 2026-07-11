import { Component, inject } from '@angular/core';
import { ExplorationDebugPageState } from './exploration-debug-page.state';

@Component({
  selector: 'app-exploration-debug-readiness-section',
  standalone: true,
  templateUrl: './exploration-debug-readiness-section.html',
})
export class ExplorationDebugReadinessSection {
  readonly page = inject(ExplorationDebugPageState);
}
