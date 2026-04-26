import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { GameSidebar } from './layout/components/game-sidebar/game-sidebar';
import { GameTopbar } from './layout/components/game-topbar/game-topbar';
import { ActiveServer } from './core/services/server/active-server';
import { MembershipBlockedNotice } from './layout/components/membership-blocked-notice/membership-blocked-notice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar, GameTopbar, ToastModule, MembershipBlockedNotice],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly activeServer = inject(ActiveServer);
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );
  readonly isWideContent = computed(() => this.currentUrl().startsWith('/admin'));
  readonly activeServerAccess = this.activeServer.access;
  readonly isGameplayRoute = computed(
    () =>
      this.currentUrl().startsWith('/hero') ||
      this.currentUrl().startsWith('/game'),
  );
  readonly isGameplayBlocked = computed(
    () => this.isGameplayRoute() && this.activeServerAccess().isMembershipBlocked,
  );

  protected title = 'mythos-hunter-2-0';
}
