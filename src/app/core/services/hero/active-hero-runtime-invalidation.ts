import { inject, Injectable, signal } from '@angular/core';
import { ActiveServer } from '../server/active-server';
import { ActiveHero } from './active-hero';
import { PlayerDashboardShellState } from './player-dashboard-shell-state';

@Injectable({ providedIn: 'root' })
export class ActiveHeroRuntimeInvalidation {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly dashboardShellState = inject(PlayerDashboardShellState);
  private readonly dashboardInvalidationReason = signal<string | null>(null);

  readonly lastDashboardInvalidationReason =
    this.dashboardInvalidationReason.asReadonly();

  invalidateActiveHeroDashboardContext(
    reason: string,
    expectedContext?: { serverId: string; heroId: string },
  ): void {
    if (expectedContext && !this.isExpectedContextCurrent(expectedContext)) {
      return;
    }

    this.dashboardInvalidationReason.set(reason.trim() || null);
    this.dashboardShellState.refreshActiveDashboardContext();
  }

  private isExpectedContextCurrent(
    expectedContext: { serverId: string; heroId: string },
  ): boolean {
    const activeHero = this.activeHero.state();
    const selectedServer = this.activeServer.selectedServer();

    return (
      activeHero?.heroId === expectedContext.heroId &&
      activeHero.serverId === expectedContext.serverId &&
      selectedServer?.id === expectedContext.serverId
    );
  }
}
