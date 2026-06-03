import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationDirectionBoard } from './exploration-direction-board';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-runtime-direction-section',
  standalone: true,
  imports: [ButtonModule, ExplorationDirectionBoard],
  templateUrl: './exploration-runtime-direction-section.html',
  host: { class: 'd-contents' },
})
export class ExplorationRuntimeDirectionSection {
  readonly page = inject(ExplorationPageState);
}
