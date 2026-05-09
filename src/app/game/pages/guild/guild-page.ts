import { Component, OnInit, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import {
  GuildDiscoveryResult,
  GuildInvite,
  GuildJoinRequest,
} from '../../../core/domain/guild/guild.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildCreateState } from '../../../core/services/guild/guild-create.state';
import { GuildDiscoveryState } from '../../../core/services/guild/guild-discovery.state';
import { GuildInvitesState } from '../../../core/services/guild/guild-invites.state';
import { GuildJoinRequestsState } from '../../../core/services/guild/guild-join-requests.state';
import { ToastService } from '../../../core/services/ui/toast';
import { GuildArmoryReadSection } from './guild-armory-read-section';

@Component({
  selector: 'app-guild-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
    LoadingOverlay,
    GuildArmoryReadSection,
  ],
  templateUrl: './guild-page.html',
})
export class GuildPage implements OnInit {
  readonly currentGuild = inject(CurrentGuildState);
  readonly guildCreate = inject(GuildCreateState);
  readonly discovery = inject(GuildDiscoveryState);
  readonly joinRequests = inject(GuildJoinRequestsState);
  readonly invites = inject(GuildInvitesState);
  readonly searchQueryControl = new FormControl<string>('', { nonNullable: true });
  private readonly toast = inject(ToastService);
  private loadedEntryState = false;
  private lastToastKey: string | null = null;

  constructor() {
    effect(() => {
      if (this.currentGuild.status() !== 'no-guild') {
        this.loadedEntryState = false;
        return;
      }

      if (!this.loadedEntryState) {
        this.loadedEntryState = true;
        this.loadEntryState();
      }
    });

    this.bindToastFeedback(
      () => this.guildCreate.message(),
      () => this.guildCreate.error(),
      'Guild creation',
      'Guild creation failed',
    );
    this.bindToastFeedback(
      () => this.joinRequests.message(),
      () => this.joinRequests.error(),
      'Guild join request',
      'Guild join request failed',
    );
    this.bindToastFeedback(
      () => this.invites.message(),
      () => this.invites.error(),
      'Guild invite',
      'Guild invite failed',
    );
  }

  ngOnInit(): void {
    this.currentGuild.load();
  }

  refresh(): void {
    this.currentGuild.load();

    if (this.currentGuild.status() === 'no-guild') {
      this.loadEntryState();
    }
  }

  submitCreateGuild(): void {
    this.guildCreate.submit();
  }

  searchGuilds(): void {
    const query = this.searchQueryControl.value.trim();

    this.discovery.search({ query: query || null });
  }

  requestToJoin(guild: Pick<GuildDiscoveryResult, 'guildId'>): void {
    this.joinRequests.create({ guildId: guild.guildId });
  }

  cancelJoinRequest(request: Pick<GuildJoinRequest, 'joinRequestId'>): void {
    this.joinRequests.cancel({ joinRequestId: request.joinRequestId });
  }

  acceptInvite(invite: Pick<GuildInvite, 'inviteId'>): void {
    this.invites.respond({ inviteId: invite.inviteId, accept: true });
  }

  rejectInvite(invite: Pick<GuildInvite, 'inviteId'>): void {
    this.invites.respond({ inviteId: invite.inviteId, accept: false });
  }

  pendingRequestForGuild(guildId: string): GuildJoinRequest | null {
    return this.joinRequests.requests().find((request) =>
      request.guildId === guildId &&
      request.statusKey === 'pending' &&
      request.canCancel
    ) ?? null;
  }

  private loadEntryState(): void {
    this.guildCreate.load();
    this.discovery.search();
    this.joinRequests.load();
    this.invites.load();
  }

  private bindToastFeedback(
    message: () => string | null,
    error: () => string | null,
    successSummary: string,
    errorSummary: string,
  ): void {
    effect(() => {
      const errorMessage = error();
      const successMessage = message();

      if (errorMessage) {
        this.showToastOnce('error', errorSummary, errorMessage);
        return;
      }

      if (successMessage) {
        this.showToastOnce('success', successSummary, successMessage);
      }
    });
  }

  private showToastOnce(
    severity: 'success' | 'error',
    summary: string,
    detail: string,
  ): void {
    const key = `${severity}:${summary}:${detail}`;

    if (key === this.lastToastKey) {
      return;
    }

    this.lastToastKey = key;
    this.toast.show(severity, summary, detail);
  }
}
