import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import {
  GuildArmoryCurrentItemStatusKey,
  GuildArmoryItem,
} from '../../../core/domain/guild/guild-armory.model';
import { PlayerArmoryItemReadModel } from '../../../core/domain/item/player-armory-page-context.model';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { GuildArmoryItemActionsState } from './guild-armory-item-actions.state';
import { GuildArmoryMemberAccessState } from './guild-armory-member-access.state';
import { GuildArmoryReadState } from './guild-armory-read.state';

@Component({
  selector: 'app-guild-armory-read-section',
  standalone: true,
  imports: [ButtonModule, MessageModule],
  providers: [
    ArmoryShelfState,
    CurrentEquipmentState,
    GuildArmoryItemActionsState,
    GuildArmoryMemberAccessState,
    GuildArmoryReadState,
  ],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-armory-read-section.html',
})
export class GuildArmoryReadSection implements OnInit {
  readonly state = inject(GuildArmoryReadState);
  readonly actions = inject(GuildArmoryItemActionsState);
  readonly memberAccess = inject(GuildArmoryMemberAccessState);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.state.load();
    this.actions.load();
    this.memberAccess.load();
  }

  statusLabel(status: GuildArmoryCurrentItemStatusKey): string {
    return status === 'borrowed' ? 'Borrowed' : 'Available';
  }

  itemSubtitle(item: GuildArmoryItem): string {
    const quality = item.qualityLabel || item.generationQualityKey;
    const baseType = item.baseTypeKey;

    return `${quality} - ${baseType}`;
  }

  depositItemSubtitle(item: PlayerArmoryItemReadModel): string {
    const quality = item.displayCore.qualityLabel
      || item.displayCore.generationQualityKey
      || 'Unknown quality';
    const shelf = item.storageSlotName
      || item.shelfName
      || `Shelf ${item.storagePosition}`;

    return `${quality} - ${shelf}`;
  }
}
