import { Component, computed, inject } from '@angular/core';
import {
  buildExplorationDirectionBoardLayout,
} from './exploration-direction-board-layout';
import {
  ExplorationDirectionGate,
} from './exploration-direction-gate';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-direction-board',
  standalone: true,
  imports: [ExplorationDirectionGate],
  templateUrl: './exploration-direction-board.html',
})
export class ExplorationDirectionBoard {
  readonly page = inject(ExplorationPageState);
  readonly movementOptions = computed(() => this.page.movementOptions());
  readonly boardLayout = computed(() =>
    buildExplorationDirectionBoardLayout(this.movementOptions()),
  );
}
