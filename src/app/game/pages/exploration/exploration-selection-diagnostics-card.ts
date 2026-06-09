import { Component, inject } from '@angular/core';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';
import { ExplorationDiagnosticsState } from './exploration-diagnostics.state';

@Component({
  selector: 'app-exploration-selection-diagnostics-card',
  standalone: true,
  imports: [CollapsedJsonPreview],
  templateUrl: './exploration-selection-diagnostics-card.html',
})
export class ExplorationSelectionDiagnosticsCard {
  readonly diagnostics = inject(ExplorationDiagnosticsState);
}
