import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TradePageContext, TradePageCopy } from '../../../core/domain/trade/player-trade.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerTrades } from '../../../core/services/trade/player-trades';
import { RequestToken } from '../../../core/utils/request-token';

@Injectable()
export class TradeOverviewState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerTrades = inject(PlayerTrades);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;

  readonly copy = signal<TradePageCopy | null>(null);
  readonly context = signal<TradePageContext | null>(null);
  readonly error = signal<unknown>(null);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);

  loadData(): void {
    const token = this.requestToken.next();

    this.activeHeroId = null;
    this.activeServerId = null;
    this.copy.set(null);
    this.context.set(null);
    this.error.set(null);
    this.pendingRequestCount.set(1);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadPageCopy(state.heroId, state.serverId, token);
          this.loadPageContext(state.heroId, state.serverId, token);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private loadPageCopy(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.playerTrades
      .getPageCopy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(copy);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private loadPageContext(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.playerTrades
      .getPageContext(heroId, serverId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (context) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.context.set(context);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private isCurrentRequest(token: number, heroId: string, serverId: string): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.activeHeroId === heroId &&
      this.activeServerId === serverId
    );
  }

  private startRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => count + 1);
  }

  private finishRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => Math.max(0, count - 1));
  }
}
