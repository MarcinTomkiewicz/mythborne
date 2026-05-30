import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  SidebarContextAction,
  SidebarContextRow,
  SidebarBadgeTone,
  SidebarNavGroup,
  SidebarNavItem,
} from '../../../core/interfaces/layout/sidebar.interface';
import { SessionLogoutButton } from '../../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-shell-sidebar-content',
  standalone: true,
  imports: [RouterLink, SessionLogoutButton],
  templateUrl: './shell-sidebar-content.html',
})
export class ShellSidebarContent {
  private readonly router = inject(Router);
  readonly contextAriaLabel = input.required<string>();
  readonly contextRows = input.required<readonly SidebarContextRow[]>();
  readonly contextActions = input<readonly SidebarContextAction[]>([]);
  readonly navAriaLabel = input.required<string>();
  readonly navGroups = input.required<readonly SidebarNavGroup[]>();
  readonly showLogoutBeforeNav = input(false);
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  badgeToneClass(tone: SidebarBadgeTone | null | undefined): string {
    return `tag-badge tag-badge--${tone ?? 'muted'}`;
  }

  isNavItemActive(item: SidebarNavItem): boolean {
    const route = item.activeRoute ?? item.route;

    if (!route) {
      return false;
    }

    const currentUrl = this.currentUrl().split('?')[0]?.split('#')[0] ?? this.currentUrl();

    return item.exact === false
      ? currentUrl.startsWith(route)
      : currentUrl === route;
  }
}
