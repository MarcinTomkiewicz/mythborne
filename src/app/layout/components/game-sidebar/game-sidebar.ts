import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
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
import { humanizeKey } from '../../../core/utils/normalize-text';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { SessionLogoutButton } from '../../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, SessionLogoutButton],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss',
})
export class GameSidebar implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);
  private readonly selectedServer$ = toObservable(this.activeServer.selectedServer);

  readonly hero = this.authState.hero;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly prestigeSummary = signal<GetHeroPrestigePublicSummaryRpcRow | null>(null);
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
    combineLatest([
      this.activeHeroState$,
      this.selectedServer$,
    ])
      .pipe(
        switchMap(([activeHeroState, server]) => {
          this.prestigeSummary.set(null);

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

                return rows.find((row) =>
                  row.hero_id === requestContext.heroId
                  && row.server_id === requestContext.serverId
                ) ?? null;
              }),
              catchError(() => of(null)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary) => this.prestigeSummary.set(summary));
  }
}

function isGameplayMenuUrl(url: unknown): boolean {
  return typeof url === 'string' && (url.startsWith('/hero') || url.startsWith('/game'));
}

function isAdminMenuUrl(url: unknown): boolean {
  return typeof url === 'string' && url.startsWith('/admin');
}
