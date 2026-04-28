import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_GUEST, MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { AuthState } from '../../../core/services/auth/auth-state';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss',
})
export class GameSidebar {
  collapsed = input<boolean>(false);

  private readonly authState = inject(AuthState);
  private readonly activeServer = inject(ActiveServer);
  private readonly router = inject(Router);

  readonly user = this.authState.user;
  readonly hero = this.authState.hero;
  readonly isLoggedIn = computed(() => !!this.user());
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly menuItems = computed(() => {
    const items = this.isLoggedIn() ? MENU_LOGGED_IN : MENU_GUEST;

    if (!this.staffAccessPolicy().isStaffGameplayBlocked) {
      return items;
    }

    return items.filter((item) => !isGameplayMenuUrl(item.url));
  });

  goToLogin() {
    void this.router.navigateByUrl('/auth/login');
  }
}

function isGameplayMenuUrl(url: unknown): boolean {
  return typeof url === 'string' && (url.startsWith('/hero') || url.startsWith('/game'));
}
