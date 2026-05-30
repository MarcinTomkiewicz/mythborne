import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { resolveRouteBackgroundImage } from '../../../core/config/route-backgrounds.config';
import { ActiveServer } from '../../../core/services/server/active-server';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { GameSidebar } from '../game-sidebar/game-sidebar';
import { GameTopbar } from '../game-topbar/game-topbar';
import { MembershipBlockedNotice } from '../membership-blocked-notice/membership-blocked-notice';
import { StaffGameplayBlockedNotice } from '../staff-gameplay-blocked-notice/staff-gameplay-blocked-notice';

@Component({
  selector: 'app-game-shell',
  imports: [
    RouterOutlet,
    GameSidebar,
    GameTopbar,
    MembershipBlockedNotice,
    StaffGameplayBlockedNotice,
  ],
  templateUrl: './game-shell.html',
})
export class GameShell {
  private readonly router = inject(Router);
  private readonly activeServer = inject(ActiveServer);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly isWideContent = computed(() => {
    const url = this.currentUrl();

    return (
      url.startsWith('/admin') ||
      url.startsWith('/hero/dashboard') ||
      url.startsWith('/hero/attributes')
    );
  });
  readonly routeBackgroundImage = computed(() => {
    const override = this.routeBackgroundOverride.image();

    if (override) {
      return override;
    }

    return resolveRouteBackgroundImage(this.currentUrl());
  });
  readonly activeServerAccess = this.activeServer.access;
  readonly isGameplayRoute = computed(
    () =>
      this.currentUrl().startsWith('/hero') ||
      this.currentUrl().startsWith('/game'),
  );
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
