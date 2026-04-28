import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminTagLink } from '../../../core/types/admin-ui.types';
import { ActiveServer } from '../../../core/services/server/active-server';
import { filterAdminTagLinks } from '../../../core/utils/admin-navigation-access';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';

@Component({
  selector: 'app-admin-tag-links',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-tag-links.html',
})
export class AdminTagLinks {
  private readonly activeServer = inject(ActiveServer);

  readonly links = input.required<readonly AdminTagLink[]>();
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly visibleLinks = computed(() =>
    filterAdminTagLinks(this.links(), this.staffAccessPolicy()),
  );
}
