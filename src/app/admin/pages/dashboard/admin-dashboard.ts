import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import {
  ADMIN_DASHBOARD_CARDS,
  ADMIN_DASHBOARD_LINKS,
} from '../../admin-navigation.config';
import { ActiveServer } from '../../../core/services/server/active-server';
import { filterAdminDashboardCards } from '../../../core/utils/admin-navigation-access';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RouterLink, AdminTagLinks, AdminServerSwitcher],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardPage {
  private readonly activeServer = inject(ActiveServer);

  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly cards = computed(() =>
    filterAdminDashboardCards(ADMIN_DASHBOARD_CARDS, this.staffAccessPolicy()),
  );
  readonly links = ADMIN_DASHBOARD_LINKS;
}
