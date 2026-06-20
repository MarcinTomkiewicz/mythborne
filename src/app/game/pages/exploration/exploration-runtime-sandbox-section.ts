import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationSandboxTools } from '../../components/exploration-sandbox-tools/exploration-sandbox-tools';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';

@Component({
  selector: 'app-exploration-runtime-sandbox-section',
  standalone: true,
  imports: [ButtonModule, ExplorationSandboxTools],
  templateUrl: './exploration-runtime-sandbox-section.html',
  host: { class: 'd-contents' },
})
export class ExplorationRuntimeSandboxSection {
  readonly sandbox = inject(ExplorationSandboxToolState);
  readonly canShowSandboxTools = this.sandbox.canShowSandboxTools;
  readonly canShowSandboxChallengeTools = computed(() =>
    this.canShowSandboxTools()
    && this.sandbox.canShowSandboxChallengeCompletionTools(),
  );
}
