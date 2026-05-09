import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import {
  GuildInvite,
  GuildJoinRequest,
} from '../../../core/domain/guild/guild.model';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildInvitesState } from '../../../core/services/guild/guild-invites.state';
import { GuildJoinRequestsState } from '../../../core/services/guild/guild-join-requests.state';
import { GuildMembersState } from '../../../core/services/guild/guild-members.state';
import { ToastService } from '../../../core/services/ui/toast';
import { trimRequiredValidator } from '../../../core/validators/form.validators';

@Component({
  selector: 'app-guild-membership-management-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
  ],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-membership-management-section.html',
})
export class GuildMembershipManagementSection implements OnInit {
  readonly currentGuild = inject(CurrentGuildState);
  readonly members = inject(GuildMembersState);
  readonly invites = inject(GuildInvitesState);
  readonly joinRequests = inject(GuildJoinRequestsState);
  private readonly toast = inject(ToastService);
  private inviteActionPending = false;
  private joinRequestActionPending = false;
  private lastAcceptedJoinRequestId: string | null = null;

  readonly inviteForm = new FormGroup({
    targetHeroId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, trimRequiredValidator()],
    }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly memberReadError = signal<string | null>(null);
  readonly inviteReadError = signal<string | null>(null);
  readonly joinRequestReadError = signal<string | null>(null);
  readonly guild = computed(() => this.currentGuild.readModel()?.detail ?? null);
  readonly currentHeroId = computed(() =>
    this.currentGuild.readModel()?.state.heroId ?? null,
  );
  readonly canInvite = computed(() =>
    this.guild()?.permissions.canInvite ?? false,
  );
  readonly guildInvites = computed(() =>
    this.filterCurrentGuild(this.invites.invites()),
  );
  readonly incomingJoinRequests = computed(() =>
    this.filterCurrentGuild(this.joinRequests.requests()).filter((request) =>
      request.requesterHeroId !== this.currentHeroId(),
    ),
  );
  readonly outgoingJoinRequests = computed(() =>
    this.filterCurrentGuild(this.joinRequests.requests()).filter((request) =>
      request.requesterHeroId === this.currentHeroId(),
    ),
  );

  constructor() {
    this.bindReadError(
      () => this.members.error(),
      () => false,
      this.memberReadError,
    );
    this.bindReadError(
      () => this.invites.error(),
      () => this.inviteActionPending,
      this.inviteReadError,
    );
    this.bindReadError(
      () => this.joinRequests.error(),
      () => this.joinRequestActionPending,
      this.joinRequestReadError,
    );
    this.bindToastFeedback(
      () => this.invites.message(),
      () => this.invites.error(),
      'Guild invite',
      'Guild invite failed',
      () => this.consumeInviteAction(),
    );
    this.bindToastFeedback(
      () => this.joinRequests.message(),
      () => this.joinRequests.error(),
      'Guild join request',
      'Guild join request failed',
      () => this.consumeJoinRequestAction(),
    );
    effect(() => {
      const result = this.joinRequests.lastResult();

      if (
        result?.statusKey === 'accepted'
        && result.joinRequestId !== this.lastAcceptedJoinRequestId
      ) {
        this.lastAcceptedJoinRequestId = result.joinRequestId;
        this.members.load();
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.inviteActionPending = false;
    this.joinRequestActionPending = false;
    this.memberReadError.set(null);
    this.inviteReadError.set(null);
    this.joinRequestReadError.set(null);
    this.members.load();
    this.invites.load();
    this.joinRequests.load();
  }

  createInvite(): void {
    this.inviteForm.markAllAsTouched();

    if (this.inviteForm.invalid || !this.canInvite()) {
      return;
    }

    const targetHeroId = this.inviteForm.controls.targetHeroId.value.trim();
    const reason = this.inviteForm.controls.reason.value.trim();

    this.inviteActionPending = true;
    this.invites.create({
      targetHeroId,
      reason,
    });
  }

  cancelInvite(invite: Pick<GuildInvite, 'inviteId'>): void {
    this.inviteActionPending = true;
    this.invites.cancel({ inviteId: invite.inviteId });
  }

  acceptJoinRequest(request: Pick<GuildJoinRequest, 'joinRequestId'>): void {
    this.joinRequestActionPending = true;
    this.joinRequests.review({ joinRequestId: request.joinRequestId, accept: true });
  }

  rejectJoinRequest(request: Pick<GuildJoinRequest, 'joinRequestId'>): void {
    this.joinRequestActionPending = true;
    this.joinRequests.review({ joinRequestId: request.joinRequestId, accept: false });
  }

  cancelJoinRequest(request: Pick<GuildJoinRequest, 'joinRequestId'>): void {
    this.joinRequestActionPending = true;
    this.joinRequests.cancel({ joinRequestId: request.joinRequestId });
  }

  private filterCurrentGuild<T extends { guildId: string }>(items: T[]): T[] {
    const guildId = this.guild()?.guildId;

    return guildId
      ? items.filter((item) => item.guildId === guildId)
      : [];
  }

  private bindReadError(
    error: () => string | null,
    isActionPending: () => boolean,
    target: ReturnType<typeof signal<string | null>>,
  ): void {
    effect(() => {
      const message = error();

      if (!message) {
        target.set(null);
        return;
      }

      if (!isActionPending()) {
        target.set(message);
      }
    });
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

      if (successMessage && shouldToast()) {
        this.showToast('success', successSummary, successMessage);
      }
    });
  }

  private consumeInviteAction(): boolean {
    const pending = this.inviteActionPending;
    this.inviteActionPending = false;
    return pending;
  }

  private consumeJoinRequestAction(): boolean {
    const pending = this.joinRequestActionPending;
    this.joinRequestActionPending = false;
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
