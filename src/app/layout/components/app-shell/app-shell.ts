import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ActiveServer } from '../../../core/services/server/active-server';
import { AuthState } from '../../../core/services/auth/auth-state';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { GameSidebar } from '../game-sidebar/game-sidebar';
import { GameTopbar } from '../game-topbar/game-topbar';
import { MembershipBlockedNotice } from '../membership-blocked-notice/membership-blocked-notice';
import { StaffGameplayBlockedNotice } from '../staff-gameplay-blocked-notice/staff-gameplay-blocked-notice';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    GameSidebar,
    GameTopbar,
    MembershipBlockedNotice,
    StaffGameplayBlockedNotice,
  ],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly activeServer = inject(ActiveServer);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly isWideContent = computed(() => this.currentUrl().startsWith('/admin'));
  readonly activeServerAccess = this.activeServer.access;
  readonly isGameplayRoute = computed(
    () =>
      this.currentUrl().startsWith('/hero') ||
      this.currentUrl().startsWith('/game'),
  );
  readonly shouldShowShellChrome = computed(() => {
    const url = this.currentUrl();

    return (
      !!this.authState.user() ||
      this.isGameplayRoute() ||
      url.startsWith('/admin')
    );
  });
  readonly isGameplayBlocked = computed(
    () => this.isGameplayRoute() && this.activeServerAccess().isMembershipBlocked,
  );
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly isStaffGameplayBlocked = computed(
    () => this.isGameplayRoute() && this.staffAccessPolicy().isStaffGameplayBlocked,
  );
  readonly shouldShowHeroTopbarContent = computed(
    () => !this.isStaffGameplayBlocked(),
  );
}
