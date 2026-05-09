import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import {
  GuildArmoryCurrentItemStatusKey,
  GuildArmoryItem,
} from '../../../core/domain/guild/guild-armory.model';
import { GuildArmoryReadState } from './guild-armory-read.state';

@Component({
  selector: 'app-guild-armory-read-section',
  standalone: true,
  imports: [ButtonModule, MessageModule],
  providers: [GuildArmoryReadState],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-armory-read-section.html',
})
export class GuildArmoryReadSection implements OnInit {
  readonly state = inject(GuildArmoryReadState);

  ngOnInit(): void {
    this.state.load();
  }

  statusLabel(status: GuildArmoryCurrentItemStatusKey): string {
    return status === 'borrowed' ? 'Borrowed' : 'Available';
  }

  itemSubtitle(item: GuildArmoryItem): string {
    const quality = item.qualityLabel || item.generationQualityKey;
    const baseType = item.baseTypeKey;

    return `${quality} - ${baseType}`;
  }
}
