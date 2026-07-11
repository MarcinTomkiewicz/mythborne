import { Component, inject } from '@angular/core';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';
import { ExplorationDebugPageState } from './exploration-debug-page.state';

@Component({
  selector: 'app-exploration-debug-runtime-section',
  standalone: true,
  imports: [CollapsedJsonPreview],
  templateUrl: './exploration-debug-runtime-section.html',
})
export class ExplorationDebugRuntimeSection {
  readonly page = inject(ExplorationDebugPageState);
}
