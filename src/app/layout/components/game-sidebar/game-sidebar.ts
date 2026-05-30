import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { MENU_LOGGED_IN_GROUPS } from '../../../core/config/menu-config';
import { RPC } from '../../../core/constants/rpc.const';
import {
  SidebarContextAction,
  SidebarContextRow,
  SidebarNavGroup,
} from '../../../core/interfaces/layout/sidebar.interface';
import {
  GetHeroPrestigePublicSummaryRpcArgs,
  GetHeroPrestigePublicSummaryRpcRow,
} from '../../../core/types/hero-prestige-rpc.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Backend } from '../../../core/services/backend/backend';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { ShellSidebarContent } from '../shell-sidebar-content/shell-sidebar-content';

@Component({
  selector: 'app-game-sidebar',
  imports: [ShellSidebarContent],
  templateUrl: './game-sidebar.html',
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
    this.selectedServer()?.status === 'live' ? 'Aktywny' : 'Niedostępny',
  );
  readonly contextRows = computed<SidebarContextRow[]>(() => {
    const hero = this.hero();
    const server = this.selectedServer();
    const prestige = this.prestigeSummary();

    return [
      {
        label: 'Bohater',
        value: hero?.name ?? 'Brak aktywnego bohatera',
        badgeLabel: hero ? `Poziom ${hero.level || 1}` : 'Brak bohatera',
        badgeTone: hero ? 'golden' : 'warn',
      },
      {
        label: 'Wybrany serwer',
        value: server?.name ?? 'Nie wybrano serwera',
        badgeLabel: this.serverStatusLabel(),
        badgeTone: server?.status === 'live' ? 'success' : 'warn',
      },
      {
        label: 'Prestiż',
        value: prestige?.player_label ?? 'Prestiż niedostępny',
        badgeLabel: prestige?.rank_number ? `Ranga ${prestige.rank_number}` : null,
        badgeTone: 'golden',
      },
    ];
  });
  readonly contextActions: readonly SidebarContextAction[] = [
    {
      label: 'Zmień serwer / postać',
      route: '/auth/server-entry',
    },
  ];
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly menuGroups = computed<SidebarNavGroup[]>(() => {
    const policy = this.staffAccessPolicy();

    return MENU_LOGGED_IN_GROUPS
      .map((group) => ({
        title: group.title,
        items: group.items.filter((item) => {
          if (isAdminMenuUrl(item.route)) {
            return policy.canAccessAdminShell;
          }

          if (policy.isStaffGameplayBlocked && isGameplayMenuUrl(item.route)) {
            return false;
          }

          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
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
