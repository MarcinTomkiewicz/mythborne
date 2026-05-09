import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildArmoryReadSection } from './guild-armory-read-section';

@Component({
  selector: 'app-guild-page',
  standalone: true,
  imports: [MessageModule, LoadingOverlay, GuildArmoryReadSection],
  templateUrl: './guild-page.html',
})
export class GuildPage implements OnInit {
  readonly currentGuild = inject(CurrentGuildState);

  ngOnInit(): void {
    this.currentGuild.load();
  }
}
