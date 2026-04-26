import { Component, computed, inject } from '@angular/core';
import { ServerMembershipStatus } from '../../../core/enums/active-server.enum';
import { ActiveServer } from '../../../core/services/server/active-server';
import {
  membershipStatusLabel,
  membershipStatusReason,
} from '../../../core/utils/server-membership';

@Component({
  selector: 'app-membership-blocked-notice',
  standalone: true,
  templateUrl: './membership-blocked-notice.html',
})
export class MembershipBlockedNotice {
  private readonly activeServer = inject(ActiveServer);

  readonly access = this.activeServer.access;
  readonly membership = computed(() => this.access().membership);
  readonly statusLabel = computed(() =>
    membershipStatusLabel(this.access().membershipStatus),
  );
  readonly reason = computed(() => membershipStatusReason(this.membership()));
  readonly title = computed(() =>
    this.access().isMembershipBanned ? 'You have been banned' : 'Account suspended',
  );
  readonly isSuspended = computed(
    () => this.membership()?.status === ServerMembershipStatus.Suspended,
  );
  readonly suspendedUntil = computed(() => {
    const suspendedUntil = this.membership()?.suspendedUntil;

    if (!suspendedUntil) {
      return null;
    }

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(suspendedUntil));
  });
}
