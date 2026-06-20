import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  PlayerArmoryItemReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-armory-inventory-item-card',
  standalone: true,
  imports: [ButtonModule, ItemDetailPopover],
  templateUrl: './armory-inventory-item-card.html',
})
export class ArmoryInventoryItemCard {
  readonly item = input.required<PlayerArmoryItemReadModel>();
  readonly metadata = input<string | null>(null);
  readonly selected = input(false);
  readonly actionDisabled = input(false);
  readonly canEquip = input(false);
  readonly canSell = input(false);
  readonly equipItemLabel = input.required<string>();
  readonly sellItemLabel = input.required<string>();
  readonly toggleItem = output<PlayerArmoryItemReadModel>();
  readonly equipItem = output<PlayerArmoryItemReadModel>();
  readonly sellItem = output<PlayerArmoryItemReadModel>();
}
