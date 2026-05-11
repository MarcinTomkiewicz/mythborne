import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, combineLatest, map, of, Subscription, switchMap } from 'rxjs';
import { MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { RPC } from '../../../core/constants/rpc.const';
import {
  GetHeroPrestigePublicSummaryRpcArgs,
  GetHeroPrestigePublicSummaryRpcRow,
} from '../../../core/types/hero-prestige-rpc.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Backend } from '../../../core/services/backend/backend';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { SessionLogoutButton } from '../../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, SessionLogoutButton],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss',
})
export class GameSidebar implements OnInit, OnDestroy {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);
  private readonly selectedServer$ = toObservable(this.activeServer.selectedServer);
  private prestigeSubscription?: Subscription;

  readonly user = this.authState.user;
  readonly hero = this.authState.hero;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly prestigeSummary = signal<GetHeroPrestigePublicSummaryRpcRow | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  readonly serverStatusLabel = computed(() =>
    humanizeKey(this.selectedServer()?.status ?? 'server_unavailable'),
  );
  readonly serverStatusClass = computed(() =>
    this.selectedServer()?.status === 'live'
      ? 'tag-badge tag-badge--success'
      : 'tag-badge tag-badge--muted',
  );
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly menuItems = computed(() => {
    const policy = this.staffAccessPolicy();

    return MENU_LOGGED_IN.filter((item) => {
      if (isAdminMenuUrl(item.url)) {
        return policy.canAccessAdminShell;
      }

      if (policy.isStaffGameplayBlocked && isGameplayMenuUrl(item.url)) {
        return false;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.prestigeSubscription = combineLatest([
      this.activeHeroState$,
      this.selectedServer$,
    ])
      .pipe(
        switchMap(([activeHeroState, server]) => {
          if (!activeHeroState?.heroId || !server?.id) {
            return of(null);
          }

          const requestContext = {
            heroId: activeHeroState.heroId,
            serverId: server.id,
          };
          const args: GetHeroPrestigePublicSummaryRpcArgs = {
            p_hero_id: activeHeroState.heroId,
          };

          return this.backend
            .rpc<GetHeroPrestigePublicSummaryRpcRow[]>(
              RPC.get_hero_prestige_public_summary,
              args,
            )
            .pipe(
              map((rows) => {
                const currentHeroId = this.activeHero.state()?.heroId;
                const currentServerId = this.selectedServer()?.id;

                if (
                  currentHeroId !== requestContext.heroId
                  || currentServerId !== requestContext.serverId
                ) {
                  return null;
                }

                return rows[0] ?? null;
              }),
              catchError(() => of(null)),
            );
        }),
      )
      .subscribe((summary) => this.prestigeSummary.set(summary));
  }

  ngOnDestroy(): void {
    this.prestigeSubscription?.unsubscribe();
  }
}

function isGameplayMenuUrl(url: unknown): boolean {
  return typeof url === 'string' && (url.startsWith('/hero') || url.startsWith('/game'));
}

function isAdminMenuUrl(url: unknown): boolean {
  return typeof url === 'string' && url.startsWith('/admin');
}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Status';
}
