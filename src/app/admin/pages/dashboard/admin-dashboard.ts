import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import {
  ADMIN_DASHBOARD_CARDS,
  ADMIN_DASHBOARD_LINKS,
} from '../../admin-navigation.config';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RouterLink, AdminTagLinks],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardPage {
  readonly cards = ADMIN_DASHBOARD_CARDS;
  readonly links = ADMIN_DASHBOARD_LINKS;
}
