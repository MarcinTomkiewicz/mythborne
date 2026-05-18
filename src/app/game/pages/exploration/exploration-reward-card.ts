import { Component, inject } from '@angular/core';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-reward-card',
  standalone: true,
  imports: [ItemDetailPopover],
  templateUrl: './exploration-reward-card.html',
})
export class ExplorationRewardCard {
  readonly page = inject(ExplorationPageState);
}
