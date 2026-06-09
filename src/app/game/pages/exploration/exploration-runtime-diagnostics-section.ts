import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationSandboxTools } from '../../components/exploration-sandbox-tools/exploration-sandbox-tools';
import { ExplorationDiagnosticsState } from './exploration-diagnostics.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';

@Component({
  selector: 'app-exploration-runtime-diagnostics-section',
  standalone: true,
  imports: [ButtonModule, ExplorationSandboxTools, ExplorationSelectionDiagnosticsCard],
  templateUrl: './exploration-runtime-diagnostics-section.html',
  host: { class: 'd-contents' },
})
export class ExplorationRuntimeDiagnosticsSection {
  readonly diagnostics = inject(ExplorationDiagnosticsState);
  readonly sandbox = inject(ExplorationSandboxToolState);
  readonly canShowSelectionDiagnostics = this.sandbox.canShowSelectionDiagnostics;
  readonly canShowSandboxChallengeTools = computed(() =>
    this.canShowSelectionDiagnostics()
    && this.sandbox.canShowSandboxChallengeCompletionTools(),
  );
  readonly canShowResolvedDiagnostics = this.diagnostics.canShowResolvedDiagnostics;
  readonly canShowDiagnosticsSection = this.diagnostics.canShowDiagnosticsSection;
}
