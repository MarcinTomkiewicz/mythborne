import { inject, Injectable, signal } from '@angular/core';
import { RequestToken } from '../../utils/request-token';
import { ActiveServer } from '../server/active-server';
import { ActiveHero } from './active-hero';
import { PlayerPageContext } from './player-page-context';
import { PlayerDashboardPageContext } from './player-page-context.model';

interface DashboardRefreshContext {
  heroId: string;
  serverId: string;
}

@Injectable({ providedIn: 'root' })
export class PlayerDashboardShellState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly pageContext = inject(PlayerPageContext);
  private readonly refreshToken = new RequestToken();
  private readonly _dashboardPageContext = signal<PlayerDashboardPageContext | null>(null);
  private readonly _isRefreshing = signal(false);

  readonly dashboardPageContext = this._dashboardPageContext.asReadonly();
  readonly isRefreshing = this._isRefreshing.asReadonly();

  applyDashboardContext(context: PlayerDashboardPageContext): void {
    this._dashboardPageContext.set(context);
  }

  refreshActiveDashboardContext(): void {
    const context = this.currentRefreshContext();
    const token = this.refreshToken.next();

    if (!context) {
      this._dashboardPageContext.set(null);
      this._isRefreshing.set(false);
      return;
    }

    this._isRefreshing.set(true);
    this.pageContext.getDashboardPageContext(context.heroId).subscribe({
      next: (dashboardContext) => {
        if (!this.isCurrentRefresh(token, context)) {
          if (this.refreshToken.isCurrent(token)) {
            this._isRefreshing.set(false);
          }

          return;
        }

        if (
          dashboardContext.heroId === context.heroId &&
          dashboardContext.serverId === context.serverId
        ) {
          this.applyDashboardContext(dashboardContext);
        }

        this._isRefreshing.set(false);
      },
      error: () => {
        if (this.refreshToken.isCurrent(token)) {
          this._isRefreshing.set(false);
        }
      },
    });
  }

  clear(heroId?: string | null): void {
    if (heroId && this._dashboardPageContext()?.heroId !== heroId) {
      return;
    }

    this.refreshToken.next();
    this._dashboardPageContext.set(null);
    this._isRefreshing.set(false);
  }

  private currentRefreshContext(): DashboardRefreshContext | null {
    const hero = this.activeHero.state();
    const server = this.activeServer.selectedServer();

    return hero?.heroId && hero.serverId && server?.id === hero.serverId
      ? { heroId: hero.heroId, serverId: hero.serverId }
      : null;
  }

  private isCurrentRefresh(token: number, context: DashboardRefreshContext): boolean {
    const current = this.currentRefreshContext();

    return (
      this.refreshToken.isCurrent(token) &&
      current?.heroId === context.heroId &&
      current.serverId === context.serverId
    );
  }
}
