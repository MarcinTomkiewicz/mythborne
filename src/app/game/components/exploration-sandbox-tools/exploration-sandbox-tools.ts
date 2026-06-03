import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';

@Component({
  selector: 'app-exploration-sandbox-tools',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './exploration-sandbox-tools.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationSandboxTools {
  readonly page = inject(ExplorationPageState);
}
