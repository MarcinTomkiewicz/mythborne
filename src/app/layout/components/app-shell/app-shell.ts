import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { GameSidebar } from '../game-sidebar/game-sidebar';
import { GameTopbar } from '../game-topbar/game-topbar';
import { MembershipBlockedNotice } from '../membership-blocked-notice/membership-blocked-notice';
import { StaffGameplayBlockedNotice } from '../staff-gameplay-blocked-notice/staff-gameplay-blocked-notice';

const ROUTE_BACKGROUNDS: ReadonlyArray<readonly [pathPrefix: string, image: string]> = [
  ['/hero/dashboard', "url('/images/backgrounds/main-background.png')"],
  ['/hero/attributes', "url('/images/backgrounds/attributes-background.png')"],
  ['/game/exploration', "url('/images/backgrounds/exploration-background.png')"],
  ['/game/armory', "url('/images/backgrounds/armory-background.png')"],
  ['/game/mansion', "url('/images/backgrounds/mansion-background.png')"],
  ['/game/vicinity', "url('/images/backgrounds/vicinity-background.png')"],
  ['/game/guild', "url('/images/backgrounds/guild-background.png')"],
  ['/game/trade', "url('/images/backgrounds/trade-background.png')"],
  ['/game/auction', "url('/images/backgrounds/auction-background.png')"],
  ['/game/reports', "url('/images/backgrounds/reports-background.png')"],
  ['/game/combat', "url('/images/backgrounds/combat-background.png')"],
];

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
  private readonly activeServer = inject(ActiveServer);

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
    const path = this.currentUrl().split(/[?#]/, 1)[0];

    return ROUTE_BACKGROUNDS.find(([prefix]) => path.startsWith(prefix))?.[1] ?? null;
  });
  readonly activeServerAccess = this.activeServer.access;
  readonly isGameplayRoute = computed(
    () =>
      this.currentUrl().startsWith('/hero') ||
      this.currentUrl().startsWith('/game'),
  );
  readonly shouldShowShellChrome = computed(() => {
    const url = this.currentUrl();

    return this.isGameplayRoute() || url.startsWith('/admin');
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
