import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { mapHero } from '../../domain/hero/hero.mapper';
import { HeroOrderColumn } from '../../enums/active-hero.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ActiveHeroState,
  RequiredActiveHeroState,
} from '../../interfaces/hero/active-hero.interface';
import { Row } from '../../types/supabase.types';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { ActiveServer } from '../server/active-server';

@Injectable({ providedIn: 'root' })
export class ActiveHero {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeServer = inject(ActiveServer);
  private readonly _state = signal<ActiveHeroState | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly state = this._state.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadActiveHero(): Observable<ActiveHeroState | null> {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      this.clear();
      return of(null);
    }

    this._isLoading.set(true);
    this._error.set(null);

    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) => this.loadHeroRows(userId, serverId)),
      map((heroRows) => this.resolveState(userId, heroRows)),
      tap({
        next: (state) => {
          this._state.set(state);
          this.authState.setHero(state?.hero ?? null);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load active hero state.',
          );
          this._isLoading.set(false);
        },
      }),
    );
  }

  selectHero(heroId: string): Observable<ActiveHeroState> {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      return throwError(() => new Error('No authenticated user for hero selection.'));
    }

    this._isLoading.set(true);
    this._error.set(null);

    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) => this.loadHeroRows(userId, serverId)),
      map((heroRows) => {
        const heroRow = heroRows.find((row) => row.id === heroId) ?? null;

        if (!heroRow) {
          throw new Error('Selected hero is not available on this server.');
        }

        return this.toState(userId, heroRow);
      }),
      tap({
        next: (state) => {
          this._state.set(state);
          this.authState.setHero(state.hero);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to select active hero.',
          );
          this._isLoading.set(false);
        },
      }),
    );
  }

  requireActiveHero(): Observable<RequiredActiveHeroState> {
    const state = this._state();

    if (state?.hero && state.heroRow && state.heroId) {
      return of({
        ...state,
        hero: state.hero,
        heroId: state.heroId,
        heroRow: state.heroRow,
      });
    }

    return this.loadActiveHero().pipe(
      map((state) => {
        if (!state?.hero || !state.heroRow || !state.heroId) {
          throw new Error('No active hero for selected server.');
        }

        return {
          ...state,
          hero: state.hero,
          heroId: state.heroId,
          heroRow: state.heroRow,
        };
      }),
    );
  }

  clear() {
    this._state.set(null);
    this._error.set(null);
    this._isLoading.set(false);
    this.authState.setHero(null);
  }

  private resolveSelectedServerId(): Observable<string> {
    const selectedServerId = this.activeServer.selectedServer()?.id ?? null;

    if (selectedServerId) {
      return of(selectedServerId);
    }

    return this.activeServer.loadAccessibleServers().pipe(
      map(() => {
        const serverId = this.activeServer.selectedServer()?.id ?? null;

        if (!serverId) {
          throw new Error('No accessible game server is configured.');
        }

        return serverId;
      }),
    );
  }

  private loadHeroRows(
    userId: string,
    serverId: string,
  ): Observable<Row<'hero'>[]> {
    return this.backend.getAll<Row<'hero'>>({
      table: TABLES.hero,
      filters: {
        userId: { operator: FilterOperator.EQ, value: userId },
        serverId: { operator: FilterOperator.EQ, value: serverId },
      },
      orderBy: { column: HeroOrderColumn.CreatedAt },
      camelCase: false,
    });
  }

  private resolveState(
    userId: string,
    heroRows: Row<'hero'>[],
  ): ActiveHeroState | null {
    const server = this.activeServer.selectedServer();

    if (!server) {
      return null;
    }

    const currentHero = this._state()?.heroRow ?? null;
    const heroRow =
      heroRows.find((row) => row.id === currentHero?.id) ??
      heroRows[0] ??
      null;
    const hero = heroRow ? mapHero(heroRow) : null;

    return {
      userId,
      serverId: server.id,
      heroId: heroRow?.id ?? null,
      server,
      hero,
      heroRow,
    };
  }

  private toState(
    userId: string,
    heroRow: Row<'hero'>,
  ): ActiveHeroState {
    const server = this.activeServer.selectedServer();

    if (!server) {
      throw new Error('No selected server for active hero selection.');
    }

    const hero = mapHero(heroRow);

    return {
      userId,
      serverId: server.id,
      heroId: heroRow.id,
      server,
      hero,
      heroRow,
    };
  }
}
