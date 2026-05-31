import { Injectable, signal } from '@angular/core';
import { PlayerDashboardPageContext } from './player-page-context.model';

@Injectable({ providedIn: 'root' })
export class PlayerDashboardShellState {
  private readonly _dashboardPageContext = signal<PlayerDashboardPageContext | null>(null);

  readonly dashboardPageContext = this._dashboardPageContext.asReadonly();

  applyDashboardContext(context: PlayerDashboardPageContext): void {
    this._dashboardPageContext.set(context);
  }

  clear(heroId?: string | null): void {
    if (heroId && this._dashboardPageContext()?.heroId !== heroId) {
      return;
    }

    this._dashboardPageContext.set(null);
  }
}
