import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationSandboxToolState } from '../../pages/exploration/exploration-sandbox-tool.state';
import { SandboxTestToolsStrip } from '../sandbox-test-tools-strip/sandbox-test-tools-strip';

@Component({
  selector: 'app-exploration-sandbox-tools',
  standalone: true,
  imports: [ButtonModule, SandboxTestToolsStrip],
  templateUrl: './exploration-sandbox-tools.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationSandboxTools {
  readonly sandbox = inject(ExplorationSandboxToolState);
}
