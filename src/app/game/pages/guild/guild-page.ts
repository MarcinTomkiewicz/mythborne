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
import { GuildMembershipManagementSection } from './guild-membership-management-section';

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
    GuildMembershipManagementSection,
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
  private createActionPending = false;
  private joinRequestActionPending = false;
  private inviteActionPending = false;

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
      () => this.consumeActionPending('create'),
    );
    this.bindToastFeedback(
      () => this.joinRequests.message(),
      () => this.joinRequests.error(),
      'Guild join request',
      'Guild join request failed',
      () => this.consumeActionPending('join-request'),
    );
    this.bindToastFeedback(
      () => this.invites.message(),
      () => this.invites.error(),
      'Guild invite',
      'Guild invite failed',
      () => this.consumeActionPending('invite'),
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
    this.createActionPending = true;
    this.guildCreate.submit();
  }

  searchGuilds(): void {
    const query = this.searchQueryControl.value.trim();

    this.discovery.search({ query: query || null });
  }

  requestToJoin(guild: Pick<GuildDiscoveryResult, 'guildId'>): void {
    this.joinRequestActionPending = true;
    this.joinRequests.create({ guildId: guild.guildId });
  }

  cancelJoinRequest(request: Pick<GuildJoinRequest, 'joinRequestId'>): void {
    this.joinRequestActionPending = true;
    this.joinRequests.cancel({ joinRequestId: request.joinRequestId });
  }

  acceptInvite(invite: Pick<GuildInvite, 'inviteId'>): void {
    this.inviteActionPending = true;
    this.invites.respond({ inviteId: invite.inviteId, accept: true });
  }

  rejectInvite(invite: Pick<GuildInvite, 'inviteId'>): void {
    this.inviteActionPending = true;
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
    shouldToast: () => boolean,
  ): void {
    effect(() => {
      const errorMessage = error();
      const successMessage = message();

      if (errorMessage) {
        if (shouldToast()) {
          this.showToast('error', errorSummary, errorMessage);
        }
        return;
      }

      if (successMessage) {
        if (shouldToast()) {
          this.showToast('success', successSummary, successMessage);
        }
      }
    });
  }

  private consumeActionPending(kind: 'create' | 'join-request' | 'invite'): boolean {
    if (kind === 'create') {
      const pending = this.createActionPending;
      this.createActionPending = false;
      return pending;
    }

    if (kind === 'join-request') {
      const pending = this.joinRequestActionPending;
      this.joinRequestActionPending = false;
      return pending;
    }

    const pending = this.inviteActionPending;
    this.inviteActionPending = false;
    return pending;
  }

  private showToast(
    severity: 'success' | 'error',
    summary: string,
    detail: string,
  ): void {
    this.toast.show(severity, summary, detail);
  }
}
