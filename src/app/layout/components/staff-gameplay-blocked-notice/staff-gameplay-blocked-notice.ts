import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';

@Component({
  selector: 'app-staff-gameplay-blocked-notice',
  imports: [ButtonModule, MessageModule, RouterLink],
  templateUrl: './staff-gameplay-blocked-notice.html',
})
export class StaffGameplayBlockedNotice {
  private readonly activeServer = inject(ActiveServer);

  readonly selectedServer = this.activeServer.selectedServer;
  readonly access = this.activeServer.access;
  readonly policy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly roleLabel = computed(() => this.access().serverStaffRole ?? 'staff');
}
