import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  SidebarContextAction,
  SidebarContextRow,
  SidebarBadgeTone,
  SidebarNavGroup,
} from '../../../core/interfaces/layout/sidebar.interface';
import { SessionLogoutButton } from '../../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-shell-sidebar-content',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SessionLogoutButton],
  templateUrl: './shell-sidebar-content.html',
})
export class ShellSidebarContent {
  readonly contextAriaLabel = input.required<string>();
  readonly contextRows = input.required<readonly SidebarContextRow[]>();
  readonly contextActions = input<readonly SidebarContextAction[]>([]);
  readonly navAriaLabel = input.required<string>();
  readonly navGroups = input.required<readonly SidebarNavGroup[]>();
  readonly showLogoutBeforeNav = input(false);

  badgeToneClass(tone: SidebarBadgeTone | null | undefined): string {
    return `tag-badge tag-badge--${tone ?? 'muted'}`;
  }
}
