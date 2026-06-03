import { Component, computed, inject } from '@angular/core';
import {
  buildExplorationDirectionBoardLayout,
} from './exploration-direction-board-layout';
import {
  ExplorationDirectionGate,
} from './exploration-direction-gate';
import { ExplorationMovementState } from './exploration-movement.state';

@Component({
  selector: 'app-exploration-direction-board',
  standalone: true,
  imports: [ExplorationDirectionGate],
  templateUrl: './exploration-direction-board.html',
  styleUrl: './exploration-direction-board.scss',
  host: {
    class: 'd-block w-100',
  },
})
export class ExplorationDirectionBoard {
  readonly movement = inject(ExplorationMovementState);
  readonly movementOptions = computed(() => this.movement.movementOptions());
  readonly boardLayout = computed(() =>
    buildExplorationDirectionBoardLayout(this.movementOptions()),
  );
}
