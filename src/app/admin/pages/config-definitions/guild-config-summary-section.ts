import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { PlayerGuild } from '../../../core/services/guild/player-guild';

@Component({
  selector: 'app-guild-config-summary-section',
  standalone: true,
  imports: [MessageModule, LoadingOverlay],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-config-summary-section.html',
})
export class GuildConfigSummarySection implements OnInit {
  private readonly playerGuild = inject(PlayerGuild);

  readonly config = signal<GuildConfigSummary | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.playerGuild.getGuildConfigSummary().subscribe({
      next: (config) => {
        this.config.set(config);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.config.set(null);
        this.error.set(
          error instanceof Error
            ? error.message
            : 'Failed to load guild configuration.',
        );
        this.isLoading.set(false);
      },
    });
  }

  armoryCapacityLabel(config: GuildConfigSummary): string {
    return config.armoryCapacityIsUnlimited || config.armoryCapacity === 0
      ? 'Unlimited'
      : String(config.armoryCapacity);
  }

  memberLimitFormulaLabel(config: GuildConfigSummary): string {
    return `${config.memberBaseLimit} + leader level x ${config.memberLimitPerLeaderLevel}`;
  }

  durationLabel(minutes: number): string {
    return `${minutes} minutes`;
  }
}
