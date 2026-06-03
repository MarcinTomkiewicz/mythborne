import { Component, computed, input, output } from '@angular/core';
import {
  HeroExplorationMovementOptionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import {
  ExplorationDirectionGateSlot,
  explorationDirectionGateIconClass,
} from './exploration-direction-board-layout';

@Component({
  selector: 'app-exploration-direction-gate',
  standalone: true,
  templateUrl: './exploration-direction-gate.html',
  host: {
    class: 'd-block w-100 h-100',
  },
})
export class ExplorationDirectionGate {
  readonly option = input.required<HeroExplorationMovementOptionReadModel>();
  readonly slot = input.required<ExplorationDirectionGateSlot>();
  readonly label = input.required<string>();
  readonly isBusy = input(false);
  readonly isDisabled = input(false);
  readonly chooseMovementOption = output<HeroExplorationMovementOptionReadModel>();

  readonly iconClass = () => explorationDirectionGateIconClass(this.slot());
  readonly canChoose = computed(() =>
    !this.isBusy()
    && !this.isDisabled()
    && this.option().isAvailable,
  );

  choose(event?: Event): void {
    event?.preventDefault();
    const option = this.option();

    if (!this.canChoose()) {
      return;
    }

    this.chooseMovementOption.emit(option);
  }
}
