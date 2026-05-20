import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
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
  imports: [ButtonModule],
  templateUrl: './exploration-direction-gate.html',
  host: { class: 'd-block w-100 h-100' },
})
export class ExplorationDirectionGate {
  readonly option = input.required<HeroExplorationMovementOptionReadModel>();
  readonly slot = input.required<ExplorationDirectionGateSlot>();
  readonly label = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly isBusy = input(false);
  readonly isDisabled = input(false);
  readonly chooseMovementOption = output<HeroExplorationMovementOptionReadModel>();

  readonly iconClass = () => explorationDirectionGateIconClass(this.slot());

  choose(): void {
    const option = this.option();

    if (this.isBusy() || this.isDisabled() || !option.isAvailable) {
      return;
    }

    this.chooseMovementOption.emit(option);
  }
}
